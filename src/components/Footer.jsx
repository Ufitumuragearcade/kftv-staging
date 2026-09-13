import React from "react";
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaComments, FaPhoneAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const ig =
    "https://www.instagram.com/kftvschool_official?igsh=MXN2YTRkdHJmaHVrNQ==";
  const fb =
    "https://www.facebook.com/KFTVschool1?mibextid=rS40aB7S9Ucbxw6v";

  const exploreLinks = [
    { name: "Home", path: "/" },
    { name: "Programs", path: "/programs" },
    { name: "About Us", path: "/about" },
    { name: "Student Life", path: "/Life" },
    { name: "News", path: "/media" },
    { name: "Contact", path: "/contact" }
  ];

  const admissionsLinks = [
    { name: "Apply Now", path: "/apply" },
    { name: "Scholarship", path: "/scholarship" },
    { name: "Study Now Pay Later", path: "/studyNow" },
    { name: "Donate", path: "/donate" }
  ];

  return (
    <footer className="border-t border-gray-200 bg-white px-4 pb-6 pt-12">
      <div className="container mx-auto grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <img
            src="logo1.png"
            alt="Kigali Film and Television School Logo"
            className="w-32 lg:w-40"
            loading="lazy"
          />
          <p className="text-sm text-gray-600">
            Inspiring the next generation of film professionals.
          </p>
          <div className="flex gap-3">
            <a
              href={fb}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-2xl text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaFacebook />
            </a>
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-2xl text-pink-600 hover:text-pink-800 transition-colors"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Explore */}
        <nav aria-label="Explore" className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <h2 className="text-lg font-semibold text-[#ff0000]">Explore</h2>
          {exploreLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className="text-sm text-gray-700 hover:text-[#ff0000] hover:underline transition-colors"
            >
              {l.name}
            </Link>
          ))}
        </nav>

        {/* Admissions */}
        <nav aria-label="Admissions" className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <h2 className="text-lg font-semibold text-[#ff0000]">Admissions</h2>
          {admissionsLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className="text-sm text-gray-700 hover:text-[#ff0000] hover:underline transition-colors"
            >
              {l.name}
            </Link>
          ))}
        </nav>

        {/* Get in Touch */}
        <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <h2 className="text-lg font-semibold text-[#ff0000]">Get in Touch</h2>
          <p className="flex items-center gap-2 text-sm text-gray-700"><FaMapMarkerAlt /> Kigali, Rwanda</p>
          <a
            href="https://wa.me/250788363732"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2 text-sm text-white hover:bg-green-600 transition-colors"
          >
            <FaComments /> Chat with Us
          </a>
          <a
            href="tel:+250788363732"
            className="flex items-center gap-2 rounded-lg bg-[#ff0000] px-5 py-2 text-sm text-white hover:bg-red-600 transition-colors"
          >
            <FaPhoneAlt /> Call Us
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <Link
            to="/privacy-policy"
            className="hover:text-[#ff0000] hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-and-conditions"
            className="hover:text-[#ff0000] hover:underline transition-colors"
          >
            Terms and Conditions
          </Link>
          <Link
            to="/admin"
            className="hover:text-[#ff0000] hover:underline transition-colors"
          >
            Admin Login
          </Link>
        </div>
        © {new Date().getFullYear()} Kigali Film and Television School. All
        rights reserved.
      </div>
    </footer>
  );
};

export default Footer;