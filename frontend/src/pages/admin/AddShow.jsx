import React, { useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import { X } from "lucide-react";

const AddShow = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showPrice, setShowPrice] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [dateTimeSlots, setDateTimeSlots] = useState([]);

  const handleAddTime = () => {
    if (selectedDate && selectedTime) {
      const newDateTime = `${selectedDate}T${selectedTime}`;
      setDateTimeSlots([...dateTimeSlots, newDateTime]);
      setSelectedTime("");
    }
  };

  const handleRemoveTime = (timeToRemove) => {
    setDateTimeSlots(dateTimeSlots.filter((t) => t !== timeToRemove));
  };

  const handleAddShow = (e) => {
    e.preventDefault();
    const payload = {
      movie: selectedMovie,
      price: showPrice,
      timeSlots: dateTimeSlots,
    };
    console.log("Add Show Payload:", payload);
  };

  return (
    <div className="p-6 text-white max-w-7xl mx-auto bg-[#121212] min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Add New Show</h2>

      {/* Movie Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {dummyShowsData.map((movie) => (
          <div
            key={movie._id}
            className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all ${
              selectedMovie?._id === movie._id
                ? "border-red-500 scale-105"
                : "border-gray-700"
            }`}
            onClick={() => setSelectedMovie(movie)}
          >
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-2 text-sm">
              <p className="font-semibold">{movie.title}</p>
              <p className="text-gray-400 text-xs">
                {movie.genres.map((g) => g.name).join(",")}
              </p>
              <p className="text-yellow-400 text-xs mt-1">
                ⭐ {movie.vote_average.toFixed(1)} | {movie.vote_count.toLocaleString()} Votes
              </p>
            </div>
            {selectedMovie?._id === movie._id && (
              <div className="absolute top-2 right-2 bg-red-500 w-4 h-4 rounded-full border border-white"></div>
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleAddShow} className="space-y-6">
        {/* Price */}
        <div>
          <label className="block mb-1 text-sm">Show Price</label>
          <input
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="w-full px-3 py-2 bg-[#1f1f1f] border border-gray-700 rounded text-white"
          />
        </div>

        {/* Date & Time Inputs */}
        <div>
          <label className="block mb-1 text-sm">Select Date and Time</label>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#1f1f1f] border border-gray-700 rounded px-3 py-2 text-white"
            />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-[#1f1f1f] border border-gray-700 rounded px-3 py-2 text-white"
            />
            <button
              type="button"
              onClick={handleAddTime}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add Time
            </button>
          </div>
        </div>

        {/* Selected Time Slots */}
        <div className="flex flex-wrap gap-2">
          {dateTimeSlots.map((dt, idx) => (
            <div
              key={idx}
              className="flex items-center bg-[#1f1f1f] border border-gray-600 rounded-full px-3 py-1 text-sm"
            >
              {new Date(dt).toLocaleString()}
              <button
                type="button"
                onClick={() => handleRemoveTime(dt)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Add Show
        </button>
      </form>
    </div>
  );
};

export default AddShow;
