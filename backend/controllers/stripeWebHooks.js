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
      switch(event.type){
        case "payment_intent.succeeded" :{
           const paymentIntent = event.data.object
           const sessionList = await stripeInstance.checkout.sessions.list({
               payment_intent : paymentIntent.id
           })

           const session = sessionList.data[0]
           const {bookingId} = session.metadata;

           console.log(bookingId)

           await Bookings.findByIdAndUpdate(bookingId,{
              isPaid : true,
              paymentLink : ""
            }) 
            break;
        }

        default :
         break;
      }
      
      res.json({received : true})
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};