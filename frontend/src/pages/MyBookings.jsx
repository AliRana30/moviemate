import React, { useEffect, useState, useContext } from 'react';
import BlurCircle from '../components/BlurCircle';
import isoTimeFormat from '../libs/isoTimeFormat';
import { DateFormat } from '../libs/dateFormat';
import { UserContext } from '../context/UserContext';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, image_base_url, user } = useContext(UserContext);

  const { getToken } = useAuth();

  const getBookings = async () => {
    try {
      const token = await getToken({ template: 'default' });

      const { data } = await axios.get('/api/user/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setBookings(data.data); 
      } else {
        toast.error(data.message || 'Failed to load bookings');
      }
    } catch (error) {
      toast.error('Error fetching bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getBookings();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="mt-40 text-center text-white">
        <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4">Loading your bookings...</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="mt-40 text-center text-white">
        <p>No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mt-32 px-6 text-white relative">
      <BlurCircle />
      <h1 className="text-3xl font-bold mb-10 text-center">My Bookings</h1>

      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        {bookings.map((booking, index) => (
          <div
            key={index}
            className="flex bg-[#2a0e0e]/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
          >
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={image_base_url + booking.show.movie.poster_path}
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

              {!booking.isPaid && booking.paymentLink && (
                <Link
                  to={booking.paymentLink}
                  className="bg-red-600 w-40 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition"
                >
                  Pay Now
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
