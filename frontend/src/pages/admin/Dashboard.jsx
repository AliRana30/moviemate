import { useContext, useEffect, useState } from 'react';
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
} from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';
import BlurCircle from '../../components/BlurCircle';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { axios, getToken, user, image_base_url } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
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
    if (user) fetchDashboardData();
  }, [user]);

  if (loading) return <p className="text-white text-center mt-10">Loading Dashboard...</p>;
  if (!dashboardData) return <p className="text-red-500 text-center">Failed to load data.</p>;

  const { totalBookings, totalRevenue, activeShows, totalUsers } = dashboardData;

  const dashboardCards = [
    { title: 'Total Bookings', value: totalBookings, icon: ChartLineIcon },
    { title: 'Total Revenue', value: `Rs. ${totalRevenue}`, icon: CircleDollarSignIcon },
    { title: 'Active Shows', value: activeShows?.length, icon: PlayCircleIcon },
    { title: 'Total Users', value: totalUsers, icon: UsersIcon },
  ];

  return (
    <div className="relative p-6 space-y-6">
      <BlurCircle top="-100px" left="0" />
      <div className="flex flex-wrap gap-4">
        {dashboardCards.map((card, index) => (
          <div key={index} className="flex justify-between items-center bg-primary/10 border border-primary/20 rounded-md p-4 w-full max-w-xs text-white">
            <div>
              <p className="text-sm">{card.title}</p>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
            <card.icon className="w-6 h-6" />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-white">Active Shows</h2>
      <div className="flex flex-wrap gap-4">
        {activeShows.slice(0, 3).map((show, i) => (
          <div key={i} className="w-40 border border-gray-700 rounded overflow-hidden">
            <img
              src={`${image_base_url}${show.movie?.poster_path}`}
              alt={show.movie?.title}
              className="w-full h-60 object-cover"
            />
            <div className="bg-[#1f1f1f] text-white p-2 text-xs">
              <p className="font-bold truncate">{show.movie?.title}</p>
              <p className="text-gray-400">{new Date(show.showDateTime).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
