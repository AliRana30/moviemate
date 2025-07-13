import Bookings from "../models/Bookings.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { clerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';

export const fetchisAdmin = async (req, res) => {
  try {
    console.log("🔥 fetchisAdmin HIT");
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        isAdmin: false, 
        message: 'Unauthorized - No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.decode(token);
    const userId = payload?.sub;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        isAdmin: false, 
        message: 'Unauthorized - Invalid token' 
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdminUser = user.privateMetadata?.role === 'admin';

    return res.status(200).json({
      success: true,
      isAdmin: isAdminUser,
      message: isAdminUser ? 'User is admin' : 'User is not admin',
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        role: user.privateMetadata?.role || 'none',
      },
    });

  } catch (error) {
    console.error("Error in fetchisAdmin:", error);
    return res.status(500).json({ 
      success: false,
      isAdmin: false, 
      message: 'Internal server error while checking admin status' 
    });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    console.log("🔥 getDashboardData HIT");
    
    // No need to check admin again - protectAdmin middleware already did it
    // req.user is available from the middleware
    
    console.log("🔥 Fetching dashboard data for admin:", req.user?.id);

    // Fetch dashboard data
    const bookings = await Bookings.find({ isPaid: true });
    const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie");
    const totalUsers = await User.countDocuments();

    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.amount, 0);
    const totalBookings = bookings.length;

    const dashboardData = {
      totalRevenue,
      totalBookings,
      activeShows,
      totalUsers,
    };

    console.log("🔥 Dashboard data:", {
      totalRevenue,
      totalBookings,
      activeShowsCount: activeShows.length,
      totalUsers
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      dashboardData
    });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error while fetching dashboard data' 
    });
  }
};

export const getAllShows = async (req, res) => {
  try {
    console.log("🔥 getAllShows HIT");
    
    // No need to check admin again - protectAdmin middleware already did it
    
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    console.log("🔥 Found shows:", shows.length);

    return res.status(200).json({ 
      success: true, 
      message: "All shows fetched successfully", 
      data: shows 
    });
  } catch (error) {
    console.error("Error in getAllShows:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error while fetching shows' 
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    console.log("🔥 getAllBookings HIT");
    
    
    const bookings = await Bookings.find({})
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });

    console.log("🔥 Found bookings:", bookings.length);

    return res.status(200).json({ 
      success: true, 
      message: "All bookings fetched successfully", 
      data: bookings 
    });
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error while fetching bookings' 
    });
  }
};