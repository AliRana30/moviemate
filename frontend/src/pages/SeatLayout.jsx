import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../libs/isoTimeFormat";
import toast from "react-hot-toast";
import BlurCircle from "../components/BlurCircle";
import { UserContext } from "../context/UserContext";
import { useAuth } from "@clerk/clerk-react";

const SeatLayout = () => {
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const { axios, user } = useContext(UserContext);
  const {getToken} = useAuth()
  

  const navigate = useNavigate();

  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const getShow = async () => {
    try {
      const token = await getToken({ template: 'default' });

      const { data } = await axios.get(`/api/show/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setShow({
          movie: data.movie,
          dateTime: data.dateTime,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load show details.");
    }
  };

  const handleSeats = (seat) => {
    if (!selectedTime) {
      return toast("Please select a time first.");
    }
    if (!selectedSeats.includes(seat) && selectedSeats.length >= 5) {
      return toast("You can only select up to 5 seats");
    }
    if (occupiedSeats.includes(seat)) {
      return toast("Seat is already occupied");
    }

    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2 items-center">
      <span className="w-4 text-right mr-2">{row}</span>
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        return (
          <button
            key={seatId}
            onClick={() => handleSeats(seatId)}
            className={`h-8 w-8 rounded border text-sm flex items-center justify-center
              ${selectedSeats.includes(seatId)
                ? "bg-red-600 text-white"
                : "border-gray-600 bg-transparent hover:bg-red-700/30"
              } ${occupiedSeats.includes(seatId) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  const getOccupiedSeats = async () => {
    try {
      
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`);
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch occupied seats");
    }
  };

const bookSeats = async () => {
  try {
    if (!user) return toast("Login first to book");
    if (!selectedTime || selectedSeats.length === 0) {
      return toast("Select time and seats first");
    }

    console.log("🎫 BOOKING SEATS DEBUG");
    console.log("👤 User:", user);
    console.log("⏰ Selected time:", selectedTime);
    console.log("💺 Selected seats:", selectedSeats);
    console.log("🌍 Axios base URL:", axios.defaults.baseURL);

    const requestData = {
      showId: selectedTime.showId,
      selectedSeats,
    };
      const token = await getToken({ template: 'default' });

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    console.log("📦 Request data:", requestData);
    console.log("🔧 Request config:", requestConfig);
    console.log("🚀 Making request to: /api/booking/create");

    const { data } = await axios.post(
      "/api/booking/create",
      requestData,
      requestConfig
    );
    
    console.log("📨 Response data:", data.booking);
    
    if (data.success) {
      window.location.href = data.url
    } else {
      toast.error(data.message || "Booking failed");
    }
  } catch (error) {
    console.error("❌ BOOKING ERROR:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    console.error("❌ Error config:", error.config);
    
    toast.error(
      error.response?.data?.message || 
      `Booking failed: ${error.message}`
    );
  }
};

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  return (
    <div className="mt-28 px-6 text-white flex flex-col lg:flex-row justify-center gap-10">
      {/* Available Timings Sidebar */}
      <div className="bg-[#2a0e0e]/50 backdrop-blur-md rounded-xl p-6 w-full lg:w-64">
        <div className="ml-36">
          <BlurCircle />
        </div>
        <h2 className="text-lg font-semibold mb-6">Available Timings</h2>

        {show?.dateTime?.[date] ? (
          <div className="flex flex-col gap-4">
            {show.dateTime[date].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTime(item)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition duration-200
                  ${selectedTime?.time === item.time
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-transparent text-white hover:bg-red-700/30 border border-white/20"
                  }`}
              >
                <ClockIcon className="w-4 h-4" />
                {isoTimeFormat(item.time)}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No timings for selected date.</p>
        )}
      </div>

      {/* Seat Layout Area */}
      <div className="flex-1 max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold mb-6 text-center">
          Select Your Seat
        </h1>
        <div className="w-full flex justify-center mb-2">
          <img
            src={assets.screenImage}
            alt="screen"
            className="h-8 object-contain"
          />
        </div>
        <p className="text-center text-sm text-white mb-6">SCREEN SIDE</p>

        <div className="flex flex-col gap-4 items-center">
          {/* First group (A, B) inline */}
          <div className="flex flex-col items-start gap-2">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          {/* Remaining rows grouped below */}
          <div className="flex flex-col items-start gap-2">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                {group.map((row) => renderSeats(row))}
              </div>
            ))}
            <div className="relative left-100">
              <BlurCircle />
            </div>
          </div>
        </div>

        {/* Proceed to Checkout Button */}
        <div className="flex justify-center mt-16">
          <button
            className="bg-red-600 w-60 text-white px-4 py-4 rounded-full text-sm hover:bg-red-700 transition"
            onClick={bookSeats}
          >
            Proceed to Checkout{" "}
            <span>
              <ArrowRightIcon className="inline w-4 h-4 ml-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
