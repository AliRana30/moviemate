import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import BlurCircle from "./BlurCircle";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ dateTime, id }) => {
  const [selected, setselected] = useState(null);
  const navigate = useNavigate();

  const BookHandler = () => {
    if (!selected) {
      return toast("Please select a date");
    }
    navigate(`/movies/${id}/${selected}`);
    scrollTo(0, 0);
  };

  return (
    <div
      id="dateSelect"
      className="mt-20 flex justify-center items-center px-4 relative"
    >
      {/* Blurred Background Circles */}
      <BlurCircle position="top-0 left-0" />
      <BlurCircle position="bottom-0 right-0" />

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 w-full max-w-4xl shadow-lg z-10 relative">
        <h2 className="text-white text-lg font-semibold mb-4">Choose Date</h2>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left Arrow */}
          <ChevronLeftIcon width={28} className="text-white cursor-pointer" />

          {/* Date Buttons */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {Object.keys(dateTime).map((date) => (
              <button
                key={date}
                className={`px-4 py-2 rounded-md flex flex-col items-center min-w-[60px] transition duration-300
                   ${selected === date  ? "bg-red-600 text-white shadow-md": 
                    "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600" }`}
                onClick={() => setselected(date)}
              >
                <span className="text-lg font-bold">
                  {new Date(date).getDate()}
                </span>
                <span className="text-xs uppercase">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <ChevronRightIcon width={28} className="text-white cursor-pointer" />
        </div>

        {/* Book Now Button */}
        <div className="mt-6 flex justify-center">
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
            onClick={BookHandler}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelect;
