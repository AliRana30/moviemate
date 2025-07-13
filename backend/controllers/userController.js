import Bookings from "../models/Bookings.js";
import Movie from "../models/Movie.js";
import { clerkClient } from "@clerk/express";

// ✅ Fetch user bookings
export const userBookings = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user ID",
      });
    }

    const bookings = await Bookings.find({ user: userId }).populate({
      path: "show",
      populate: { path: "movie" },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });

  } catch (error) {
    console.error("❌ userBookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ Add/remove favorite movies from Clerk metadata
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth.userId;

    if (!userId || !movieId) {
      return res.status(400).json({
        success: false,
        message: "Missing user ID or movie ID",
      });
    }

    const movieExists = await Movie.findById(movieId);
    if (!movieExists) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    let favorites = Array.isArray(user.privateMetadata?.favorites) ? user.privateMetadata.favorites : [];

    const movieIdStr = movieId.toString();
    const isCurrentlyFavorite = favorites.includes(movieIdStr);

    // Toggle favorite
    if (isCurrentlyFavorite) {
      favorites = favorites.filter(fav => fav !== movieIdStr);
    } else {
      favorites.push(movieIdStr);
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        favorites,
      },
    });

    res.status(200).json({
      success: true,
      message: `Movie ${isCurrentlyFavorite ? 'removed from' : 'added to'} favorites`,
      data: {
        favorites,
        isFavorite: !isCurrentlyFavorite,
      },
    });

  } catch (error) {
    console.error("❌ updateFavorite error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating favorites",
      error: error.message,
    });
  }
};

// ✅ Get all favorite movies for logged-in user
export const getfavorites = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user ID",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const favoriteIds = Array.isArray(user.privateMetadata?.favorites)
      ? user.privateMetadata.favorites
      : [];

    if (favoriteIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No favorite movies found",
        movies: [],
      });
    }

    // No need to validate IDs — they’re strings
    const movies = await Movie.find({ _id: { $in: favoriteIds } });

    return res.status(200).json({
      success: true,
      message: "Favorites fetched successfully",
      movies,
    });

  } catch (error) {
    console.error("❌ getfavorites error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching favorites",
      error: error.message,
    });
  }
};
