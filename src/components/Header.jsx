import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NAV = [
  { name: "Home", path: "/" },
  { name: "Programs", path: "/programs" },
  { name: "scholarship", path: "/scholarship" },
  { name: "About Us", path: "/about" },
  { name: "Student Life", path: "/Life" },
  { name: "News", path: "/media" },
  { name: "Donate", path: "/donate" },
  { name: "Study Now Pay Later", path: "/studyNow" },
  { name: "Contact", path: "/contact" }
];

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-red-50 text-[#ff0000] font-semibold"
      : "text-gray-700 hover:bg-gray-100 hover:text-[#ff0000]"
  }`;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const allPages = NAV;

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;
    const match = allPages.find((p) =>
      p.name.toLowerCase().includes(query)
    );
    if (match) {
      navigate(match.path);
    } else {
      alert("No results found");
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const closeAll = () => {
    setIsOpen(false);
  };

  const SearchForm = () => (
    <form onSubmit={handleSearch} className="flex">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        aria-label="Search"
        className="w-36 rounded-l-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#ff0000] focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-r-lg bg-[#ff0000] px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
      >
        Go
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between gap-2 px-4 lg:px-6">
        <NavLink to="/" onClick={closeAll} className="shrink-0">
          <img
            src="logo1.png"
            alt="Kigali Film and Television School Logo"
            className="h-11 md:h-12 py-1"
          />
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV.map((p) => (
            <NavLink key={p.path} to={p.path} className={linkClass}>
              {p.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <SearchForm />
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle Menu"
          aria-expanded={isOpen}
          className="lg:hidden text-2xl p-2 text-gray-800 focus:outline-none"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden border-t border-gray-200 bg-white transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[80vh] overflow-y-auto p-4" : "max-h-0 p-0"
        }`}
      >
        <div className="flex flex-col gap-1">
          <SearchForm />
          <div className="my-2 h-px bg-gray-200" />
          {allPages.map((p) => (
            <NavLink
              key={p.path}
              to={p.path}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-red-50 text-[#ff0000] font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {p.name}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;