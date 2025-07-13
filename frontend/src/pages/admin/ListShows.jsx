import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';

const AllShows = () => {
  const { user, axios, getToken, image_base_url } = useContext(UserContext);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShows = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/admin/shows', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setShows(data.data);
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
    if (user) fetchShows();
  }, [user]);

  if (loading) return <div className="text-white text-center mt-10">Loading Shows...</div>;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">All Shows</h2>
      {shows.length === 0 ? (
        <p className="text-gray-400">No shows available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {shows.map((show) => (
            <div key={show._id} className="bg-[#1f1f1f] border border-gray-700 rounded-lg overflow-hidden">
              <img
                src={`${image_base_url}${show.movie?.poster_path}`}
                alt={show.movie?.title}
                className="w-full h-60 object-cover"
                onError={(e) => { e.target.src = '/placeholder-poster.jpg'; }}
              />
              <div className="p-4 text-sm">
                <p className="font-bold">{show.movie?.title}</p>
                <p className="text-gray-400">{new Date(show.showDateTime).toLocaleString()}</p>
                <p className="text-red-400 mt-1">Price: Rs. {show.showPrice}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllShows;
