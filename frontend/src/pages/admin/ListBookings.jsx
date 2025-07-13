import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';

const ListBookings = () => {
  const { user, axios ,getToken} = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  if (loading) return <div className="text-white text-center mt-10">Loading Bookings...</div>;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">All Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-700">
          <thead className="bg-[#1f1f1f] border-b border-gray-700 text-white">
            <tr>
              <th className="p-2">Username</th>
              <th className="p-2">Movie</th>
              <th className="p-2">Showtime</th>
              <th className="p-2">Seats</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b border-gray-700 text-gray-200">
                <td className="p-2">{booking.user?.fullName || 'Unknown'}</td>
                <td className="p-2">{booking.show?.movie?.title || 'N/A'}</td>
                <td className="p-2">{new Date(booking.show?.showDateTime).toLocaleString()}</td>
                <td className="p-2">{booking.seats.join(', ')}</td>
                <td className="p-2">Rs. {booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBookings;
