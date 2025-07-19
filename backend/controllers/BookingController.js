import Show from "../models/Show.js";
import Bookings from "../models/Bookings.js";
import stripe from 'stripe';
import { inngest } from '../inngest/index.js';

// Check if selected seats are available
const checkAvalaiblity = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};
    const isAnySeatOccupied = selectedSeats.some(seat => occupiedSeats[seat]);

    return !isAnySeatOccupied;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export default checkAvalaiblity;

// Create Booking
export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!showId || !selectedSeats || selectedSeats.length === 0) {
      console.log("❌ Missing required data");
      return res.status(400).json({ success: false, message: "Show ID and selected seats are required" });
    }

    console.log("🔍 Checking seat availability...");
    const isAvailable = await checkAvalaiblity(showId, selectedSeats);
    console.log("✅ Seats available:", isAvailable);
    
    if (!isAvailable) {
      console.log("❌ Seats not available");
      return res.status(400).json({ success: false, message: "Selected seats are not available" });
    }

    console.log("📊 Finding show data...");
    const showData = await Show.findById(showId).populate("movie");
    console.log("🎬 Show data found:", showData ? "YES" : "NO");

    if (!showData) {
      console.log("❌ Show not found");
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    console.log("💰 Show price:", showData.showPrice);
    console.log("🧮 Total amount:", showData.showPrice * selectedSeats.length);

    console.log("📝 Creating booking...");

    const booking = await Bookings.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false, 
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    console.log("✅ Booking created:", booking._id);

    console.log("🔄 Updating occupied seats...");
    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    // Stripe gateway
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: showData.movie.title,
          description: `Seats: ${selectedSeats.join(', ')}`,
        },
        unit_amount: Math.floor(booking.amount * 100) 
      },
      quantity: 1
    }];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/bookings?success=true`,
      cancel_url: `${origin}/bookings?cancelled=true`,
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        bookingId: booking._id.toString()
      }
     
    });

    booking.paymentLink = session.url;
    await booking.save();
    booking.stripeSessionId = session.id;

    console.log("💳 Stripe session created:", session.id);

    // Schedule seat release function
    await inngest.send({
      name: 'app/checkpayment',
      data: {
        bookingId: booking._id.toString()
      }
    });

    console.log("⏰ Payment check scheduled");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: {
        id: booking._id,
        amount: booking.amount,
        seats: booking.bookedSeats,
        isPaid: booking.isPaid
      },
      url: session.url
    });
  } catch (error) {
    console.error("❌ CREATE BOOKING ERROR:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ success: false, message: "Booking failed: " + error.message });
  }
};

// Get occupied seats for a show
export const occupiedSeatsData = async (req, res) => {
  try {
    console.log("🔍 OCCUPIED SEATS ENDPOINT HIT");
    const { showId } = req.params;
    console.log("🎬 Show ID:", showId);
    
    const showData = await Show.findById(showId);

    if (!showData) {
      console.log("❌ Show not found");
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});
    console.log("💺 Occupied seats:", occupiedSeats);

    res.status(200).json({
      success: true,
      occupiedSeats, 
    });
  } catch (error) {
    console.error("❌ OCCUPIED SEATS ERROR:", error);
    res.status(500).json({ success: false, message: "Error fetching occupied seats" });
  }
};