import {
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
} from 'lucide-react';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const user = {
    firstName: 'Admin',
    lastName: 'User',
    imageUrl: assets.profile,
  };

  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon, exact: true },
    { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquareIcon },
    { name: 'List Shows', path: '/admin/shows', icon: ListIcon },
    { name: 'List Bookings', path: '/admin/bookings', icon: ListCollapseIcon },
  ];

  return (
    <div className="p-4 h-screen border-r border-gray-700">

      <div className="flex flex-col space-y-2">
        {adminNavLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-red-500 transition ${
                isActive ? 'bg-red-600 text-white' : ''
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <p>{link.name}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
