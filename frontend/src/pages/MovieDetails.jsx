import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyShowsData } from "../assets/assets";
import timeFormat from "../libs/timeFormat";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import DateSelect from "../components/DateSelect";
import MovieCards from "../components/MovieCards";
import BlurCircle from "../components/BlurCircle";
import { UserContext } from "../context/UserContext";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

const MovieDetails = () => {
  const { id } = useParams();
  const [currentmovie, setcurrentmovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);
  const navigate = useNavigate();

  const {
    axios,
    user,
    favorite,
    fetchFavoriteShows,
    updateFavorite,
    image_base_url,
  } = useContext(UserContext);

  const [localFav, setLocalFav] = useState(false);
  const { getToken } = useAuth();

  const getshow = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setcurrentmovie({ movie: data.movie, dateTime: data.dateTime });
      } else {
        setError(data.message || "Failed to fetch movie details");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch movie details");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) return toast.error("Login first to proceed");
    if (isFavoriteUpdating) return;

    try {
      setIsFavoriteUpdating(true);
      const token = await getToken({ template: "default" });
      if (!token) return toast.error("Missing auth token");

      const { data } = await axios.post(
        "/api/user/update-favorites",
        { movieId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        setLocalFav(data.data?.isFavorite || false);
        await fetchFavoriteShows();
        toast.success(data.message || "Favorites updated");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update favorites");
    } finally {
      setIsFavoriteUpdating(false);
    }
  };

  useEffect(() => {
    if (id) getshow();
  }, [id]);

  useEffect(() => {
    if (favorite && Array.isArray(favorite)) {
      const isFav = favorite.some((movie) => movie._id === id);
      setLocalFav(isFav);
    }
  }, [favorite, id]);

 const getCastData = () => {
  const movie = currentmovie.movie;

  if (!movie || typeof movie !== "object") return [];

  // Debug all keys for safety
  console.log("🎬 Movie keys:", Object.keys(movie));

  if (Array.isArray(movie.cast)) return movie.cast;
  if (Array.isArray(movie.casts)) return movie.casts;
  if (Array.isArray(movie.credits?.cast)) return movie.credits.cast;
  if (Array.isArray(movie.credits?.casts)) return movie.credits.casts;
  if (Array.isArray(movie.actors)) return movie.actors;
  if (Array.isArray(movie.performers)) return movie.performers;

  return [];
};


  if (loading) {
    return (
      <div className="mt-40 text-center text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
          <p className="mt-4">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-40 text-center text-white">
        <p className="text-red-500 text-lg mb-4">Error: {error}</p>
        <button
          onClick={() => navigate("/movies")}
          className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
        >
          Go Back to Movies
        </button>
      </div>
    );
  }

  const castData = getCastData();

  return (
    <div className="mt-32 px-4 md:px-10 text-white max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <BlurCircle />
        <div className="relative w-60 mx-auto md:mx-0">
          <img
            src={`${image_base_url}${currentmovie.movie.poster_path}`}
            className="w-60 rounded-lg shadow-lg"
            alt={currentmovie.movie.title}
            onError={(e) => (e.target.src = "/placeholder.jpg")}
          />
        </div>

        <div className="flex flex-col gap-3 w-full">
          <p className="text-sm text-red-500 uppercase">
            Language: {currentmovie.movie.original_language || "N/A"}
          </p>
          <h1 className="text-3xl font-bold">{currentmovie.movie.title}</h1>

          <div className="flex items-center text-red-500 font-semibold">
            <StarIcon className="w-5 h-5 mr-1" />
            {currentmovie.movie.vote_average
              ? currentmovie.movie.vote_average.toFixed(1)
              : "N/A"}
          </div>

          <p className="text-sm mt-2 max-w-2xl">
            {currentmovie.movie.overview || "No overview available"}
          </p>

          <p className="text-sm text-white">
            {currentmovie.movie.runtime
              ? timeFormat(currentmovie.movie.runtime)
              : "N/A"} –
            {currentmovie.movie.genres?.map((g) => g.name).join(", ") ||
              currentmovie.movie.gen?.map((g) => g.name).join(", ") ||
              "N/A"} –
            {currentmovie.movie.release_date?.split("-")[0] || "N/A"}
          </p>

          <div className="flex gap-4 mt-6">
            <button className="bg-gray-800 px-5 py-2 rounded-full flex items-center gap-2 hover:bg-gray-700">
              <PlayCircleIcon className="w-5 h-5" /> Watch Trailer
            </button>
            <a href="#dateSelect">
              <button className="bg-red-600 px-6 py-2 rounded-full font-semibold hover:bg-red-700">
                Buy Tickets
              </button>
            </a>
            <button
              onClick={handleFavorite}
              disabled={isFavoriteUpdating}
              className={`bg-gray-700 p-2.5 rounded-full hover:bg-gray-600 ${
                isFavoriteUpdating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  localFav ? "text-red-500 fill-red-500" : "text-white"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

  
      <div className="mt-32" id="dateSelect">
        <DateSelect dateTime={currentmovie.dateTime} id={id} />
      </div>

      <div className="mt-20">
        <h1 className="text-xl font-semibold">You May Also Like</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dummyShowsData.slice(0, 4).map((movie, index) => (
            <MovieCards key={index} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
