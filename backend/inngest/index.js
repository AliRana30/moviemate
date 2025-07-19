import { Inngest } from "inngest";
import User from "../models/User.js";
import Bookings from "../models/Bookings.js";
import Show from "../models/Show.js";
import sendmail from "../utils/Nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "moviemate" });

// Function to sync user creation from Clerk to MongoDB
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    };
    await User.create(userData);
    console.log("User created:", event.data);
    return event.data;
  }
);

// Function to delete user from MongoDB when user is deleted from Clerk
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
    return event.data;
  }
);

// Function to update user in MongoDB when user is updated in Clerk
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    };
    await User.findByIdAndUpdate(id, userData);
    return event.data;
  }
);

// Function to check payment and release seats if unpaid
const reserveSeats = inngest.createFunction(
  {
    id: "checkpayment",
    name: "Check if payment is done or not",
    concurrency: {
      limit: 1,
      key: "event.data.bookingId",
    },
  },
  { event: "app/booking.created" },

  async ({ event, step }) => {
    const bookingId = event.data.bookingId;

    await step.sleep("wait for 1 minute", "1m");

    await step.run("check-payment-status", async () => {
      try {
       const booking = await Bookings.findById(event.data.bookingId);
const session = await stripeInstance.checkout.sessions.retrieve(booking.stripeSessionId, {
  expand: ["payment_intent"],
});

if (session && session.payment_status?.toLowerCase() === "paid") {
  booking.isPaid = true;
  booking.paymentDate = new Date();
  await booking.save();
  console.log("✅ isPaid set to true");
} else {
  console.log("❌ Payment not completed, not marking isPaid");
}


      } catch (error) {
        console.error(`❌ Error while checking payment status for booking ${bookingId}:`, error);
      }
    });
  }
);


// Function to send confirmation email
const confirmationEmail = inngest.createFunction(
  { id: "send-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    console.log(`📧 Sending confirmation email for booking: ${bookingId}`);

    await step.run("send-email", async () => {
      try {
        const booking = await Bookings.findById(bookingId)
          .populate({
            path: "show",
            populate: { path: "movie", model: "movie" },
          })
          .populate("user");

        if (!booking) {
          console.log(`❌ Booking not found for email: ${bookingId}`);
          return;
        }

        if (!booking.user || !booking.user.email) {
          console.log(`❌ User email not found for booking: ${bookingId}`);
          return;
        }

        await sendmail({
          to: booking.user.email,
          subject: `Payment Confirmation – ${booking.show.movie.title} booked!`,
          body: `
            <div style="max-width:600px;margin:auto;background:#fff;padding:20px;font-family:sans-serif;border-radius:8px;">
              <h2 style="text-align:center;color:#333;">🎟️ Booking Confirmed!</h2>
              <p>Hello ${booking.user.name},</p>
              <p>Your booking for <strong>${booking.show.movie.title}</strong> has been confirmed.</p>
              <p><strong>Date & Time:</strong> ${new Date(booking.show.showDateTime).toLocaleString()}</p>
              <p><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</p>
              <p><strong>Total Amount Paid:</strong> $${booking.amount}</p>
              <p><strong>Booking ID:</strong> ${booking._id}</p>

              <div style="text-align:center;margin-top:30px;">
                <a href="${process.env.FRONTEND_URL || 'https://moviemate.com'}/bookings" 
                   style="background:#007BFF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">
                  View Booking
                </a>
              </div>

              <p style="margin-top:30px;font-size:12px;color:#888;text-align:center;">
                &copy; 2025 MovieMate. All rights reserved.
              </p>
            </div>
          `,
        });

        console.log(`✅ Confirmation email sent to: ${booking.user.email}`);
      } catch (error) {
        console.error(`❌ Error sending confirmation email for booking ${bookingId}:`, error);
      }
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  reserveSeats,
  confirmationEmail,
];