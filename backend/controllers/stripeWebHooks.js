import stripe from "stripe";
import Bookings from "../models/Bookings.js";
import { inngest } from "../inngest/index.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Stripe Webhook Event:", event.type);
  } catch (error) {
    console.error("❌ Stripe Webhook Signature Error:", error.message);
    return res.status(400).json({ error: error.message });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      console.log("🔍 Processing checkout.session.completed");
      console.log("📋 Session metadata:", session.metadata);
      console.log("🎫 Booking ID:", bookingId);

      if (!bookingId) {
        console.error("❌ bookingId missing from Stripe session metadata.");
        return res.status(400).json({ error: "Missing bookingId" });
      }

      // Find and update booking
      const booking = await Bookings.findById(bookingId);
      if (!booking) {
        console.error("❌ Booking not found in DB for ID:", bookingId);
        return res.status(404).json({ error: "Booking not found" });
      }

      console.log("📝 Current booking status:", {
        id: booking._id,
        isPaid: booking.isPaid,
        amount: booking.amount
      });

      // Update booking status
      booking.isPaid = true;
      booking.paymentLink = "";
      booking.paymentDate = new Date();
      booking.stripeSessionId = session.id;
      
      const updatedBooking = await booking.save();
      console.log("✅ Booking updated successfully:", {
        id: updatedBooking._id,
        isPaid: updatedBooking.isPaid,
        paymentDate: updatedBooking.paymentDate
      });

      // Send confirmation email event
      await inngest.send({
        name: "app/show.booked",
        data: { bookingId: bookingId }
      });

      console.log("📧 Confirmation email event sent");
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};