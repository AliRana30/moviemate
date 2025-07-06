import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import timeFormat from "../libs/timeFormat";
import { PlayCircleIcon, StarIcon } from "lucide-react";
import DateSelect from "../components/DateSelect";
import MovieCards from "../components/MovieCards";
import BlurCircle from "../components/BlurCircle";

const MovieDetails = () => {
  const { id } = useParams();
  const [currentmovie, setcurrentmovie] = useState(null);
  const navigate = useNavigate();

  const getshow = async () => {
    const show = dummyShowsData.find((show) => show._id == id);
    setcurrentmovie({
      movie: show,
      dateTime: dummyDateTimeData,
    });
  };

  useEffect(() => {
    getshow();
  }, [id]);

  return currentmovie ? (
    <div className="mt-32 px-4 md:px-10 text-white max-w-screen-xl mx-auto">
      {/* Movie Layout */}
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <BlurCircle />
        <div className="relative w-60 mx-auto md:mx-0">
          <div className="absolute top-0 left-0 w-20 h-20 bg-red-500 opacity-30 blur-2xl rounded-full z-0" />
          <img
            src={currentmovie.movie.poster_path}
            className="w-60 rounded-lg shadow-lg relative z-10"
            alt={currentmovie.movie.title}
          />
        </div>

        {/* Movie Info */}
        <div className="flex flex-col gap-3 w-full">
          <p className="text-sm text-red-500 uppercase tracking-wide">
            Language: English
          </p>

          <h1 className="text-3xl md:text-4xl font-bold">
            {currentmovie.movie.title}
          </h1>

          <div className="flex items-center text-red-500 font-semibold mt-1">
            <StarIcon className="w-5 h-5 mr-1" />
            {currentmovie.movie.vote_average.toFixed(1)}
          </div>

          <p className="text-sm text-white opacity-90 mt-2 max-w-2xl">
            {currentmovie.movie.overview}
          </p>

          <p className="text-white mt-2 text-sm">
            {timeFormat(currentmovie.movie.runtime)} –{" "}
            {currentmovie.movie.genres.map((genre) => genre.name).join(", ")} –{" "}
            {currentmovie.movie.release_date.split("-")[0]}
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition duration-300">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>

            <a href="#dateSelect">
              <button className="px-6 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition duration-300 shadow-md">
                Buy Tickets
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="mt-20">
        <p className="text-xl font-semibold mb-4">Your Favorite Cast</p>
        <div className="flex flex-wrap gap-6 justify-start">
          {currentmovie.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center w-20">
              <img
                src={cast.profile_path}
                alt={cast.name}
                className="w-20 h-20 object-cover rounded-full shadow-md border border-gray-700"
              />
              <p className="mt-2 text-sm text-white text-center truncate w-full">
                {cast.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Date Select Section */}
      <div className="mt-32">
        <DateSelect dateTime={currentmovie.dateTime} id={id} />
      </div>

      {/*You May Also Like*/}
      <div className="mt-20">
        <h1 className="text-xl font-semibold">You May Also Like</h1>
        <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dummyShowsData.slice(0, 4).map((movie, index) => (
            <MovieCards key={index} movie={movie} />
          ))}
        </div>
      </div>

      {/*Show More*/}

      <div className="mt-10 flex justify-center">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition"
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
        >
          Show More
        </button>
      </div>
    </div>
  ) : (
    <div className="mt-40 text-center text-white">Loading...</div>
  );
};

export default MovieDetails;
