import stripe from "stripe";
import Bookings from "../models/Bookings.js";
import { inngest } from "../inngest/index.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebHook = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
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

      console.log("🔁 Stripe Session Metadata:", session.metadata);

      const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
        return res.status(400).json({ error: "Missing bookingId" });
      }

      await Bookings.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: "",
      });
     
      // send confirmation email

      await inngest.send({
        name : "app/show.booked",
        data : {bookingId}
      })
     }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
