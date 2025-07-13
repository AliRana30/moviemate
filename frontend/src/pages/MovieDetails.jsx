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
  const {getToken} = useAuth()

  const getshow = async () => {

    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Fetching show details for ID:", id);
      console.log("🌐 Making request to:", `${axios.defaults.baseURL}/api/show/${id}`);
      
      const {data} = await axios.get(`/api/show/${id}`);
      
      console.log("📝 Show API response:", data);
      
      if (data.success) {
        setcurrentmovie({
          movie: data.movie,
          dateTime: data.dateTime,
        });
        console.log("✅ Movie data set:", data.movie);
      } else {
        setError(data.message || "Failed to fetch movie details");
        console.error("❌ API returned success=false:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching movie:", error);
      console.error("❌ Error response:", error.response);
      setError(error.response?.data?.message || "Failed to fetch movie details");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFavorite = async () => {
    try {
      if (!user) {
        return toast.error("Login first to proceed");
      }

      if (isFavoriteUpdating) {
        return;
      }

      setIsFavoriteUpdating(true);
      console.log("🔄 Updating favorite for movie:", id);

      const token = await getToken({ template: 'default' });

      console.log("🔑 Token obtained:", token ? "YES" : "NO");
      
      if (!token) {
        return toast.error("Missing auth token");
      }

      const requestUrl = `/api/user/update-favorites`;
      const requestData = { movieId: id };
      
      console.log("🌐 Making request to:", `${axios.defaults.baseURL}${requestUrl}`);
      console.log("📦 Request data:", requestData);
      console.log("🔐 Authorization header:", `Bearer ${token.substring(0, 20)}...`);

      const response = await axios.post(requestUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("📝 Full response:", response);
      console.log("📝 Response data:", response.data);
      console.log("📝 Response status:", response.status);

      if (response.data.success) {
        // Update local state immediately for better UX
        setLocalFav(response.data.data?.isFavorite || false);
        
        // Fetch updated favorites from server
        await fetchFavoriteShows();
        
        toast.success(response.data.message || "Favorites updated");
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("❌ handleFavorite error:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error("Please log in again");
      } else {
        toast.error(error.response?.data?.message || "Failed to update favorites");
      }
    } finally {
      setIsFavoriteUpdating(false);
    }
  };

  // Fetch show details when component mounts or id changes
  useEffect(() => {
    if (id) {
      getshow();
    }
  }, [id]);

  // Update local favorite state when favorites change
  useEffect(() => {
    if (favorite && Array.isArray(favorite)) {
      const isFav = favorite.some((movie) => movie._id === id);
      setLocalFav(isFav);
      console.log("💝 Local favorite state updated:", isFav);
    }
  }, [favorite, id]);

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

  if (!currentmovie) {
    return (
      <div className="mt-40 text-center text-white">
        <p className="text-lg mb-4">No movie details found</p>
        <button 
          onClick={() => navigate("/movies")} 
          className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
        >
          Go Back to Movies
        </button>
      </div>
    );
  }

  // Handle different possible cast data structures
  const getCastData = () => {
    const movie = currentmovie.movie;
    
    console.log("🎬 Full movie object:", movie);
    console.log("🎭 Available properties:", Object.keys(movie));
    
    // Try different possible cast property names
    let castData = [];
    
    if (movie.cast && Array.isArray(movie.cast)) {
      castData = movie.cast;
      console.log("✅ Found cast in movie.cast");
    } else if (movie.casts && Array.isArray(movie.casts)) {
      castData = movie.casts;
      console.log("✅ Found cast in movie.casts");
    } else if (movie.credits?.cast && Array.isArray(movie.credits.cast)) {
      castData = movie.credits.cast;
      console.log("✅ Found cast in movie.credits.cast");
    } else if (movie.credits?.casts && Array.isArray(movie.credits.casts)) {
      castData = movie.credits.casts;
      console.log("✅ Found cast in movie.credits.casts");
    } else if (movie.actors && Array.isArray(movie.actors)) {
      castData = movie.actors;
      console.log("✅ Found cast in movie.actors");
    } else if (movie.performers && Array.isArray(movie.performers)) {
      castData = movie.performers;
      console.log("✅ Found cast in movie.performers");
    } else {
      console.log("❌ No cast data found. Available properties:", Object.keys(movie));
      // Check if there's any array property that might contain cast info
      Object.keys(movie).forEach(key => {
        if (Array.isArray(movie[key])) {
          console.log(`🔍 Found array property '${key}' with ${movie[key].length} items:`, movie[key][0]);
        }
      });
    }

    console.log("🎭 Cast data found:", castData.length, "members");
    return castData;
  };

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
            onError={(e) => {
              console.log("❌ Image failed to load:", e.target.src);
              e.target.src = "/placeholder.jpg";
            }}
          />
        </div>

        <div className="flex flex-col gap-3 w-full">
          <p className="text-sm text-red-500 uppercase">
            Language: {currentmovie.movie.original_language || 'N/A'}
          </p>
          <h1 className="text-3xl font-bold">{currentmovie.movie.title}</h1>

          <div className="flex items-center text-red-500 font-semibold">
            <StarIcon className="w-5 h-5 mr-1" />
            {currentmovie.movie.vote_average ? 
              currentmovie.movie.vote_average.toFixed(1) : 'N/A'
            }
          </div>

          <p className="text-sm mt-2 max-w-2xl">
            {currentmovie.movie.overview || 'No overview available'}
          </p>

          <p className="text-sm text-white">
            {currentmovie.movie.runtime ? timeFormat(currentmovie.movie.runtime) : 'N/A'} –
            {currentmovie.movie.genres?.map(g => g.name).join(", ") || 
             currentmovie.movie.gen?.map(g => g.name).join(", ") || 'N/A'} –
            {currentmovie.movie.release_date?.split("-")[0] || 'N/A'}
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
                isFavoriteUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Heart 
                className={`w-5 h-5 ${localFav ? "text-red-500 fill-red-500" : "text-white"}`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {castData && castData.length > 0 && (
        <div className="mt-20">
          <p className="text-xl font-semibold mb-4">Cast ({castData.length})</p>
          <div className="flex flex-wrap gap-6">
            {castData.slice(0, 12).map((cast, index) => (
              <div key={cast.id || index} className="flex flex-col items-center w-20">
                <img
                  src={cast.profile_path ? 
                    `${image_base_url}${cast.profile_path}` : 
                    "/placeholder.jpg"
                  }
                  alt={cast.name || 'Cast member'}
                  className="w-20 h-20 object-cover rounded-full"
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                <p className="mt-2 text-sm text-center line-clamp-2">
                  {cast.name || 'Unknown'}
                </p>
                {cast.character && (
                  <p className="text-xs text-gray-400 text-center line-clamp-1">
                    {cast.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug cast info */}
      {(!castData || castData.length === 0) && (
        <div className="mt-20 p-4 bg-gray-800 rounded">
          <p className="text-yellow-400">Debug: No cast data found</p>
          <p className="text-sm">Movie properties: {Object.keys(currentmovie.movie).join(', ')}</p>
        </div>
      )}

      {/* Date Selection */}
      <div className="mt-32" id="dateSelect">
        <DateSelect dateTime={currentmovie.dateTime} id={id} />
      </div>

      {/* Recommended Movies */}
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