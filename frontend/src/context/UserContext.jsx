import axios from 'axios';
import { createContext, useEffect, useState, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
console.log("🌍 Axios Base URL:", axios.defaults.baseURL);

export const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  const [isadmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favorite, setFavorite] = useState([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [adminChecked, setAdminChecked] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const fetchAdmin = useCallback(async () => {
    if (!user || !isLoaded) {
      setIsLoadingAdmin(false);
      setAdminChecked(true);
      return;
    }

    try {
      const token = await getToken({ template: 'default' });
      if (!token) {
        setIsAdmin(false);
        setIsLoadingAdmin(false);
        setAdminChecked(true);
        return;
      }

      const { data } = await axios.get('/api/admin/is-admin', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      toast.error('Error checking admin status');
      setIsAdmin(false);
    } finally {
      setIsLoadingAdmin(false);
      setAdminChecked(true);
    }
  }, [user, isLoaded, getToken]);

  const fetchShows = async () => {
    try {
      const { data } = await axios.get('/api/show/all');
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message || 'Failed to fetch shows');
      }
    } catch (error) {
      toast.error('Failed to fetch shows');
    }
  };

  const fetchFavoriteShows = useCallback(async () => {
    if (!user) {
      setFavorite([]);
      setIsLoadingFavorites(false);
      return;
    }

    try {
      setIsLoadingFavorites(true);

      const token = await getToken({ template: 'default' });
      if (!token) {
        setFavorite([]);
        return;
      }

      const { data } = await axios.get('/api/user/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const movies = Array.isArray(data.movies) ? data.movies : [];
        setFavorite(movies);
      } else {
        setFavorite([]);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error('Error fetching favorites');
      }
      setFavorite([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [user, getToken]);

  const updateFavorite = useCallback(
    async (movieId) => {
      if (!user) {
        return toast.error('Login first to proceed');
      }

      try {
        const token = await getToken({ template: 'default' });
        if (!token) {
          return toast.error('Authentication required');
        }

        const { data } = await axios.post(
          '/api/user/update-favorites',
          { movieId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          await fetchFavoriteShows();
          return data;
        } else {
          toast.error(data.message || 'Failed to update favorites');
          return null;
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error updating favorites');
        return null;
      }
    },
    [user, getToken, fetchFavoriteShows]
  );

  // Fetch shows on component mount
  useEffect(() => {
    fetchShows();
  }, []);

  // Handle user auth changes
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        fetchAdmin();
        fetchFavoriteShows();
      } else {
        setIsAdmin(false);
        setFavorite([]);
        setIsLoadingAdmin(false);
        setAdminChecked(true);
        setIsLoadingFavorites(false);
      }
    }
  }, [user, isLoaded, fetchAdmin, fetchFavoriteShows]);

  // Handle unauthorized error globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setFavorite([]);
          setIsAdmin(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        axios,
        user,
        getToken,
        isadmin,
        shows,
        favorite,
        fetchFavoriteShows,
        updateFavorite,
        image_base_url,
        isLoadingAdmin,
        adminChecked,
        isLoadingFavorites,
        fetchAdmin,
        fetchShows,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
