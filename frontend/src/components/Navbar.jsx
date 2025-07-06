import React, { useState } from "react";
import { SearchIcon, Menu, XIcon, User, TicketPercent } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate()
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkClick = () => {
    scrollTo(0, 0);
    setIsOpen(false);
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-50 px-6 py-4 text-white flex items-center justify-between bg-transparent ">


      <div className="text-xl font-bold">MovieMate</div>

      <div className="hidden md:flex gap-12 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md shadow-sm">

        <Link onClick={handleLinkClick} to="/">
          Home
        </Link>
        <Link onClick={handleLinkClick} to="/movies">
          Movies
        </Link>
        <Link onClick={handleLinkClick} to="/">
          Theaters
        </Link>
        <Link onClick={handleLinkClick} to="/">
          Releases
        </Link>
        <Link onClick={handleLinkClick} to="/favorite">
          Favorites
        </Link>
      </div>

      {/* Search, Login, Hamburger */}
      <div className="flex items-center gap-8">
        <SearchIcon size={20} />
        {!user ? (
          <button
            onClick={openSignIn}
            className="text-white font-medium border-red-600 bg-red-700 py-3 px-6 rounded-3xl"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPercent />}
                onClick={()=> navigate("/bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}

        {/* Hamburger only on Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {isOpen ? <XIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black text-white flex flex-col items-center gap-6 py-6 md:hidden z-50">
          <Link onClick={handleLinkClick} to="/">
            Home
          </Link>
          <Link onClick={handleLinkClick} to="/movies">
            Movies
          </Link>
          <Link onClick={handleLinkClick} to="/">
            Theaters
          </Link>
          <Link onClick={handleLinkClick} to="/">
            Releases
          </Link>
          <Link onClick={handleLinkClick} to="/favorite">
            Favorites
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
