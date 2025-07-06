import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../libs/isoTimeFormat";
import toast from "react-hot-toast";
import BlurCircle from "../components/BlurCircle";

const SeatLayout = () => {
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);

  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];
  const navigate = useNavigate();

  const getShow = async () => {
    const showData = dummyShowsData.find((seat) => seat._id === id);
    if (showData) {
      setShow({
        movie: showData,
        dateTime: dummyDateTimeData,
      });
    }
  };

  const handleSeats = (seat) => {
    if (!selectedTime) {
      return toast("Please select a time first.");
    }
    if (!selectedSeats.includes(seat) && selectedSeats.length >= 5) {
      return toast("You can only select up to 5 seats");
    }

    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
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
              ${
                selectedSeats.includes(seatId)
                  ? "bg-red-600 text-white"
                  : "border-gray-600 bg-transparent hover:bg-red-700/30"
              }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  useEffect(() => {
    getShow();
  }, [id]);

  return (
    <div className="mt-28 px-6 text-white flex flex-col lg:flex-row justify-center gap-10">
      {/* Available Timings Sidebar */}
      <div className="bg-[#2a0e0e]/50 backdrop-blur-md rounded-xl p-6 w-full lg:w-64">
      <div className="ml-36">
      <BlurCircle/>

      </div>
        <h2 className="text-lg font-semibold mb-6">Available Timings</h2>

        {show?.dateTime?.[date] ? (
          <div className="flex flex-col gap-4">
            {show.dateTime[date].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTime(item)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition duration-200
                  ${
                    selectedTime?.time === item.time
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
              <BlurCircle/>
            </div>
          </div>
        </div>

        {/* Proceed to Checkout Button */}
        <div className="flex justify-center mt-16">
          <button
            className="bg-red-600 w-60 text-white px-4 py-4 rounded-full text-sm hover:bg-red-700 transition"
            onClick={() => navigate("/bookings")}
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
