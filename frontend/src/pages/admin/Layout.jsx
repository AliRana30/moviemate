import AdminNavbar from '../../components/admin/AdminNavbar';
import Sidebar from '../../components/admin/Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="h-16">
        <AdminNavbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-52 h-full">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;