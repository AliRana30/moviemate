import React, { useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';

const Favorite = () => {
  const { favorite, image_base_url, fetchFavoriteShows, user } = useContext(UserContext);
  const navigate = useNavigate();

  // Fetch favorites on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchFavoriteShows();
    }
  }, [user, fetchFavoriteShows]);

  // Log favorite array for debug
  useEffect(() => {
    console.log("🧩 favorite array:", favorite);
  }, [favorite]);

  // If not logged in
  if (!user) {
    return (
      <div className="mt-40 text-center text-white">
        <Heart className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">Please Login</h2>
        <p className="text-gray-400">You need to login to view your favorite movies.</p>
      </div>
    );
  }

  // If logged in but no favorites
  if (!favorite || favorite.length === 0) {
    return (
      <div className="mt-40 text-center text-white">
        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold mb-2">No Favorite Movies</h2>
        <p className="text-gray-400">You haven't added any movies to your favorites yet.</p>
        <button 
          onClick={() => navigate('/movies')} 
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
        >
          Browse Movies
        </button>
      </div>
    );
  }

  // Show list of favorites
  return (
    <div className="mt-32 px-4 md:px-10 text-white max-w-screen-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold">Your Favorite Movies</h1>
        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
          {favorite.length}
        </span>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {favorite.map((movie) => (
          <div 
            key={movie._id} 
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => navigate(`/movie/${movie._id}`)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src={`${image_base_url}${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-lg font-semibold line-clamp-1">{movie.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-400">
                  {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-sm text-gray-400">
                  {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorite;
