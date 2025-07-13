import stripe from "stripe";
import Bookings from "../models/Bookings.js";

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
  } catch (error) {
    return res.status(400).json(`webhook error : ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // Fetch the session using the payment_intent ID
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        const session = sessionList.data[0];
        const { bookingId } = session.metadata;

        // Update the booking record in MongoDB
        await Bookings.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });

        break;
      }

      default:
        console.log("unhandled event",event.type)
        break;
    }
    res.json({received : true})
  } catch (error) {
    console.error('webhook error',error.message)
  }
};
