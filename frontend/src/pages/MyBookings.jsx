import React, { useEffect, useState } from 'react';
import { dummyBookingData } from '../assets/assets';
import BlurCircle from '../components/BlurCircle';
import isoTimeFormat from '../libs/isoTimeFormat';
import { DateFormat } from '../libs/dateFormat';

const MyBookings = () => {
  const [booking, setBooking] = useState(null);

  const getBookings = async () => {
    // Assuming there's only one booking to show
    setBooking(dummyBookingData[0]); // Only show the first one
  };

  useEffect(() => {
    getBookings();
  }, []);

  if (!booking) return null;

  return (
    <div className="w-full min-h-screen mt-32 px-6 text-white relative">
      <BlurCircle />
      <h1 className="text-3xl font-bold mb-10 text-center">My Booking</h1>

      <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
        <div className="flex w-full bg-[#2a0e0e]/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={booking.show.movie.poster_path}
              alt="poster"
              className="w-32 h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-4 flex flex-col justify-between w-full">
            <h2 className="text-xl font-semibold mb-2">
              {booking.show.movie.title}
            </h2>

            <div className="text-sm text-gray-300 mb-2">
              <p>Duration: {isoTimeFormat(booking.show.movie.runtime)}</p>
              <p>Date: {DateFormat(booking.show.showDateTime)}</p>
              <p>Total Tickets: {booking.bookedSeats.length}</p>
              <p>Seat Numbers: {booking.bookedSeats.join(', ')}</p>
            </div>

            <div className="font-semibold text-lg text-red-400 mb-2">
              Total Price: ${booking.amount}
            </div>

            {!booking.isPaid && (
              <button className="bg-red-600 w-40 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition">
                Pay Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
