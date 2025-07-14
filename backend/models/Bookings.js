import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    ref: 'User'
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Show'
  },
  amount: {
    type: Number,
    required: true
  },
  bookedSeats: {
    type: [String],
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentLink: {
    type: String,
    default: ''
  },
  stripeSessionId: {
    type: String,
    default: ''
  },
  paymentDate: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 40 * 60 * 1000) 
  }
}, {
  timestamps: true
});

bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { isPaid: false } });

const Bookings = mongoose.model('Booking', bookingSchema);

export default Bookings;