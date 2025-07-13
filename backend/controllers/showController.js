import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";


// API to get now playing movies
const showController = async (req, res) => {
  try {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );
    const movies = data.results;
    res.status(200).json({
      success: true,
      movies: movies,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch movies",
      error: error.message,
    });
  }
};


//API to add shows
const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;
    let movie = await Movie.findById(movieId);
    if (!movie) {
      const [movieDetailsResponse , movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            accept: "application/json", 
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
       
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },

        })
      ]);

      const movieApiData = movieDetailsResponse.data
      const movieCredits = movieCreditsResponse.data
      const movieDetails = {
        _id : movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        cast : movieCredits.cast,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        original_language: movieApiData.original_language,
        release_date: movieApiData.release_date,
        vote_average: movieApiData.vote_average || 0,
        tagline: movieApiData.tagline || "",
        genres: movieApiData.genres,
        runtime: movieApiData.runtime || 0,
      }
      movie = await Movie.create(movieDetails)
    }
    const showstoCreate = []
    showsInput.forEach((show) => {
      const showDate =show.showDate
      show.showTime.forEach((time)=>{
        const dateTimeString = `${showDate}T${time}`;
        showstoCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {}, 
      })
      });
    }); 
    
    if(showstoCreate.length > 0) {
      await Show.insertMany(showstoCreate);
    }

    res.status(200).json({success: true, message: "Shows added successfully", movie: movie,});

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to add movies",
      error: error.message,
    });
  }
};


//API to get all shows
const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate('movie')
      .sort({ showDateTime: 1 });

    const uniqueMoviesMap = new Map();

    shows.forEach((show) => {
      const movieId = show.movie._id.toString();
      if (!uniqueMoviesMap.has(movieId)) {
        uniqueMoviesMap.set(movieId, show.movie);
      }
    });

    res.status(200).json({
      success: true,
      shows: Array.from(uniqueMoviesMap.values()),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};


//API to get single show

const getSingleShow = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("=== DEBUG INFO ===");
    console.log("Received ID:", id, "Type:", typeof id);

    // Validate if id is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required",
      });
    }

    // First, let's check if the movie exists
    const movie = await Movie.findOne({ _id: String(id) });
    console.log("Movie found:", movie ? `Yes - ${movie.title}` : "No");
    
    if (!movie) {
      // Let's see what movies are available for debugging
      const sampleMovies = await Movie.find().limit(3).select('_id title');
      console.log("Sample movies in database:", sampleMovies);
      
      return res.status(404).json({
        success: false,
        message: "Movie not found",
        debug: {
          searchedId: id,
          availableMovies: sampleMovies
        }
      });
    }

    const shows = await Show.find({
      movie: String(id),
      showDateTime: { $gte: new Date() },
    });

    console.log("Found shows:", shows.length);

    if (shows.length === 0) {
      console.log("No shows found for this movie");
      return res.status(200).json({
        success: true,
        movie: movie,
        dateTime: {},
        shows: [],
        message: "Movie found but no upcoming shows available"
      });
    }

    // Group shows by date
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ 
        time: show.showDateTime, 
        showId: show._id,
        price: show.showPrice
      });
    });

    Object.keys(dateTime).forEach(date => {
      dateTime[date].sort((a, b) => new Date(a.time) - new Date(b.time));
    });

    console.log("Response data prepared successfully");

    res.status(200).json({
      success: true,
      movie: movie,
      dateTime: dateTime,
      shows: shows,
    });

  } catch (error) {
    console.error("Error in getSingleShow:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { showController, addShow ,getAllShows,getSingleShow};