import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
 const ig ="https://www.instagram.com/kftvschool_official?igsh=MXN2YTRkdHJmaHVrNQ=="
const fb ="https://www.facebook.com/KFTVschool1?mibextid=rS40aB7S9Ucbxw6v"
  return (
    <footer className="bg-white text-[#ff0000] py-8 px-4 border-t border-gray-200">
      {/* Main Footer - Hidden on small devices */}
      <div className="container mx-auto hidden md:flex flex-col md:flex-row md:justify-between items-center md:items-start space-y-8 md:space-y-0">
        {/* Logo */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src="logo1.png"
            alt="Kigali Film and Television School Logo"
            className="w-32 md:w-48 mb-4"
            loading="lazy"
          />
          <p className="text-sm text-gray-700 text-center md:text-left">
            Inspiring the next generation of film professionals.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col space-y-3 items-center md:items-start">
          <h1 className="text-lg font-semibold text-[#ff0000]">Links</h1>
          <Link to="/" className="hover:underline text-gray-700">Home</Link>
          <Link to="/programs" className="hover:underline text-gray-700">Programs</Link>
          <Link to="/contact" className="hover:underline text-gray-700">Contact</Link>
        </div>

    {/* Contacts */}
<div className="flex flex-col space-y-3 items-center md:items-start">
  <h1 className="text-lg font-semibold text-[#ff0000]">Contacts</h1>
  <p className="text-gray-700">📍 Kigali, Rwanda</p>

  {/* Social Media */}
  <div className="flex space-x-4 mt-2">
    <a
      href={fb} // <-- replace with your real page
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 text-xl"
    >
      <FaFacebook />
    </a>
    <a
      href={ig} // <-- replace with your real handle
      target="_blank"
      rel="noopener noreferrer"
      className="text-pink-600 hover:text-pink-800 text-xl"
    >
      <FaInstagram />
    </a>
  </div>
</div>


        {/* Chat & Call */}
        <div className="flex flex-col space-y-3 items-center md:items-start">
          <h1 className="text-lg font-semibold text-[#ff0000]">Get in Touch</h1>
          
          {/* WhatsApp Chat */}
          <a
            href="https://wa.me/250788363732"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
          >
            💬 Chat with Us
          </a>

          {/* Phone Call */}
          <a
            href="tel:+250788363732"
            className="bg-[#ff0000] text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
          >
            📞 Call Us
          </a>
        </div>
      </div>

      {/* Bottom Bar - Always Visible */}
      <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
        © {new Date().getFullYear()} Kigali Film and Television School. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
