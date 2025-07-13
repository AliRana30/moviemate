import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import timeFormat from '../libs/timeFormat'
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const MovieCards = ({ movie }) => {
  const navigate = useNavigate();
  const {image_base_url} = useContext(UserContext)
  return (
    <div
      className="bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer w-full h-full"
    >
      <div className="p-3">
        <img
          src={image_base_url + movie.backdrop_path}
          alt={movie.title}
          className="w-full h-40 object-cover rounded-md"
          onClick={() => navigate(`/movies/${movie._id}`)}
        />

        <h2 className="text-lg font-semibold text-white mt-3">
          {movie.title}
        </h2>

        <p className="text-sm text-white mt-1">
          {new Date(movie.release_date).getFullYear()} &nbsp; | &nbsp;
          {movie.genres?.slice(0, 2).map((genre) => genre.name).join(" | ")} &nbsp; | &nbsp;
          {timeFormat(movie.runtime)}
        </p>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => navigate(`/movies/${movie._id}`)}
            className="bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition"
          >
            Buy Tickets
          </button>

          <div className="flex items-center gap-1 text-yellow-500 font-medium">
            <StarIcon className="w-4 h-4" />
            {movie.vote_average?.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};


export default MovieCards;
