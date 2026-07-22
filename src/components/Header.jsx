import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Pages to search
  const pages = [
    { name: "Home", path: "/" },
    { name: "Programs", path: "/programs" },
    { name: "scholarship", path: "/scholarship" },
    { name: "About Us", path: "/about" },
    { name: "Student Life", path: "/Life" },
    { name: "News", path: "/media" },
    { name: "Donate", path: "/donate" },
    { name: "Study Now Pay Later", path: "/studyNow" },
     { name: "Contact", path: "/contact" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;

    const match = pages.find((p) => p.name.toLowerCase().includes(query));

    if (match) {
      navigate(match.path);
    } else {
      alert("No results found");
    }

    setSearchTerm("");
    setIsOpen(false);
  };

  // Styling for active/inactive links (desktop)
  const linkClass = ({ isActive }) =>
    `hover:underline transition-colors ${isActive ? "text-black" : "text-[#ff0000]"}`;

  return (
    <header className="sticky top-0 w-full bg-white shadow z-50">
      <nav className="container mx-auto flex justify-between items-center px-4 py-2">
        {/* Logo */}
        <NavLink to="/" onClick={() => setIsOpen(false)}>
          <img
            src="logo1.png"
            alt="Kigali Film and Television School Logo"
            className="h-12"
          />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 font-semibold">
          {pages.map((p) => (
            <NavLink key={p.path} to={p.path} className={linkClass}>
              {p.name}
            </NavLink>
          ))}

          {/* Search */}
          <form onSubmit={handleSearch} className="ml-4 flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 border border-[#ff0000] rounded-l-md focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#ff0000] text-white px-3 rounded-r-md font-semibold hover:bg-red-700 transition-colors"
            >
              Go
            </button>
          </form>
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle Menu"
          className="md:hidden text-3xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 font-semibold transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-screen opacity-100 p-4" : "max-h-0 opacity-0 p-0"
        }`}
      >
        <div className="flex flex-col space-y-2">
          {pages.map((p) => (
            <NavLink
              key={p.path}
              to={p.path}
              className={({ isActive }) =>
                `hover:underline transition-colors ${
                  isActive ? "text-black" : "text-[#ff0000]"
                } font-bold`
              }
              onClick={() => setIsOpen(false)}
            >
              {p.name}
            </NavLink>
          ))}
          {/* Mobile search removed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
