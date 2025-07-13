import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import toast from "react-hot-toast";

const AddShow = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [nowplayingMovies, setNowPlayingMovies] = useState([]);
  const [showPrice, setShowPrice] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [dateTimeSlots, setDateTimeSlots] = useState([]);
  const [addshow, setAddShow] = useState(false);

  const { getToken, user, image_base_url } = useContext(UserContext);

  const handleAddTime = () => {
    if (selectedDate && selectedTime) {
      const newDateTime = `${selectedDate}T${selectedTime}`;
      if (!dateTimeSlots.includes(newDateTime)) {
        setDateTimeSlots([...dateTimeSlots, newDateTime]);
      }
      setSelectedTime("");
    } else {
      toast.error("Please select both date and time");
    }
  };

  const handleRemoveTime = (timeToRemove) => {
    setDateTimeSlots(dateTimeSlots.filter((t) => t !== timeToRemove));
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    try {
      setAddShow(true);

      if (!selectedMovie || dateTimeSlots.length === 0 || !showPrice) {
        toast.error("Select all details to add show");
        return;
      }

      // Group times by date
      const grouped = {};
      dateTimeSlots.forEach((dt) => {
        const [date, time] = dt.split("T");
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(time);
      });

      const showsInput = Object.entries(grouped).map(([date, timeArray]) => ({
        showDate: date,
        showTime: timeArray,
      }));

      const payload = {
        movieId: selectedMovie.id || selectedMovie._id,
        showsInput,
        showPrice: Number(showPrice),
      };


      const { data } = await axios.post("/api/show/add", payload, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        toast.success(data.message);
        setSelectedMovie(null);
        setDateTimeSlots([]);
        setShowPrice("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setAddShow(false);
    }
  };

  const fetchNowPlayingMovies = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      const { data } = await axios.get("/api/show/now-playing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setNowPlayingMovies(data.movies);
      } else {
        toast.error("Failed to fetch movies.");
      }
    } catch (error) {
      toast.error("Failed to fetch now playing movies.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user]);

  return (
    <div className="p-6 text-white max-w-7xl mx-auto bg-[#121212] min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Add New Show</h2>

      {/* Movie Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {nowplayingMovies.map((movie) => {
          const id = movie._id || movie.id;
          const genreNames = (movie.genres || []).map((g) => g.name).join(", ");
          const isSelected = selectedMovie?.id === id || selectedMovie?._id === id;

          return (
            <div
              key={id}
              className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all duration-200 ${
                isSelected ? "border-red-500 scale-105" : "border-gray-700"
              }`}
              onClick={() => setSelectedMovie(movie)}
            >
              <img
                src={image_base_url + movie.poster_path}
                alt={movie.title}
                className="w-full h-60 sm:h-72 md:h-80 object-cover"
              />
              <div className="p-2 text-sm">
                <p className="font-semibold">{movie.title}</p>
                <p className="text-gray-400 text-xs">{genreNames}</p>
                <p className="text-yellow-400 text-xs mt-1">
                  ⭐ {movie.vote_average?.toFixed(1)} |{" "}
                  {movie.vote_count?.toLocaleString()} Votes
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-red-500 w-4 h-4 rounded-full border border-white"></div>
              )}
            </div>
          );
        })}
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
          <div className="flex flex-wrap gap-3 items-center">
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
          {dateTimeSlots.map((dt) => (
            <div
              key={dt}
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
          disabled={addshow}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          {addshow ? "Adding..." : "Add Show"}
        </button>
      </form>
    </div>
  );
};

export default AddShow;
