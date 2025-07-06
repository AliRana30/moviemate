// FeaturedSection.jsx
import { MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MovieCards from "./MovieCards";
import { dummyShowsData } from "../assets/assets";

const FeaturedSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden mt-10">
      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <p className="text-xl font-semibold text-white">Popular Movies</p>
        <button
          onClick={() => navigate("/movies")}
          className="bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2"
        >
          <span>View All</span>
          <MoveRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4 mt-10">
        {dummyShowsData.slice(0, 4).map((movie) => (
          <MovieCards key={movie._id} movie={movie} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition"
          onClick={() => navigate("/movies")}
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default FeaturedSection;
