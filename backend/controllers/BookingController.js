import Show from "../models/Show.js";
import Bookings from "../models/Bookings.js";
import stripe from 'stripe'
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

    const {userId} = req.auth;
    const { showId, selectedSeats } = req.body;
    const {origin} = req.headers    

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
    });

    console.log("✅ Booking created:", booking._id);

    console.log("🔄 Updating occupied seats...");
    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    // stripe gateway

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

    const lineitems = [{
      price_data : {
        currency: 'usd',
        product_data : {
          name : showData.movie.title
        },
        unit_amount : Math.floor(booking.amount) *100 
      },
      quantity : 1
    }]

    const session = await stripeInstance.checkout.sessions.create({
       success_url : `${origin}/bookings`,
       cancel_url : `${origin}/bookings`,
       line_items : lineitems,
       mode : 'payment',
       metadata :{
          bookingId : booking._id.toString()
       },
       expires_at : Math.floor(Date.now() / 1000) + 30 * 60 // expires in 30 mins
    })

    booking.paymentLink = session.url;
    await booking.save()


    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
      url : session.url
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