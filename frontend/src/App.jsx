import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatLayout from './pages/SeatLayout';
import MyBookings from './pages/MyBookings';
import Favorite from './pages/Favorite';
import Footer from './components/Footer';
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import ListShows from './pages/admin/ListShows';
import AddShow from './pages/admin/AddShow';
import ListBookings from './pages/admin/ListBookings';
import { UserContext } from './context/UserContext';
import { useContext } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const { isLoaded } = useUser();
  const { user, isadmin, isLoadingAdmin, adminChecked } = useContext(UserContext);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        🔄 Loading application...
      </div>
    );
  }

  return (
    <>
      {/* Only show navbar outside admin */}
      {!isAdminPath && <Navbar />}

      <Toaster />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />

        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={<AdminRouteHandler />}
        >
          <Route index element={<Dashboard />} />
          <Route path="shows" element={<ListShows />} />
          <Route path="add-shows" element={<AddShow />} />
          <Route path="bookings" element={<ListBookings />} />
        </Route>
      </Routes>

      {!isAdminPath && (
        <div className="mt-20">
          <Footer />
        </div>
      )}
    </>
  );
}

// Separate component to handle admin route logic
function AdminRouteHandler() {
  const { user, isadmin, isLoadingAdmin, adminChecked } = useContext(UserContext);

  // Still checking admin status
  if (isLoadingAdmin || !adminChecked) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        ⏳ Checking admin privileges...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Please sign in to access admin panel</p>
          <SignIn fallbackRedirectUrl="/admin" />
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isadmin) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl text-red-500">
        ❌ Access Denied - Admin privileges required
      </div>
    );
  }

  // User is admin - render the layout
  return <Layout />;
}

export default App;