import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "ui-component/Logo";
import { Menu } from "@mui/icons-material";
import { useAuth } from "contexts/Auth0Context";

const Header = ({ toggleNavbar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { role, fichas, userName, userPicture, logout } = useAuth();


  const handleLogout = () => {
    logout();
  };


  return (
    <div className="bg-[#5a82e5] text-white flex items-center justify-between px-6 py-3 relative">
      {/* Logo */}
      <Link className="absolute top-0 left-[5.5rem] items-center z-50 hidden md:block" to="/">
        <Logo className="h-10" />
      </Link>
      <button className="-ml-1.5" onClick={toggleNavbar}>
        <Menu />
      </button>

      {/* User Profile & Logout Dropdown */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-3 hover:bg-blue-600 px-4 rounded-lg transition duration-300"
        >
          <div className="flex flex-col items-start">
            <p className="text-sm font-medium">Bienvenido, {userName}</p>
            {role === "Paciente" && (
              <span className="bg-white text-blue-600 text-xs font-semibold px-2 py-1 rounded-full shadow-sm mt-1">
                {fichas} ficha{fichas !== 1 && "s"}
              </span>
            )}
          </div>
          <img
            src={userPicture}
            className="h-10 w-10 rounded-full border-2 border-white cursor-pointer"
            alt="User Avatar"
            referrerPolicy="no-referrer"
          />

        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-md overflow-hidden z-50">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
