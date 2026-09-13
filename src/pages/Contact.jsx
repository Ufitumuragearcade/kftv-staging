
import { HiOutlineMail, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineLink } from "react-icons/hi";
import { FaFacebook, FaInstagram, FaComments, FaPhoneAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
const Contact = () => {
 const calender ="https://calendly.com/kftv/15min"
 const ig ="https://www.instagram.com/kftvschool_official?igsh=MXN2YTRkdHJmaHVrNQ=="
const fb ="https://www.facebook.com/KFTVschool1?mibextid=rS40aB7S9Ucbxw6v"


    return (
<section className="bg-[#e6f4fa] text-black py-16 px-6 sm:px-10 lg:px-20">

<Helmet>
  <title>Contact | Kigali Film and Television School</title>
  <meta
    name="description"
    content="Get in touch with Kigali Film and Television School (KFTV) for inquiries, admissions, or general information."
  />

  {/* Open Graph tags */}
  <meta property="og:title" content="Contact | Kigali Film and Television School" />
  <meta
    property="og:description"
    content="Get in touch with Kigali Film and Television School (KFTV) for inquiries, admissions, or general information."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://kftvschool.com/contact" />
  <meta property="og:image" content="%PUBLIC_URL%/logo1.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
</Helmet>



  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-[#ff0000]">Contact Us</h2>
      <h2 className="text-lg sm:text-xl font-bold mb-8 text-gray-700">Contact the head of school</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {/* Phone */}
      <div className="flex flex-col items-center bg-white space-y-2 text-black rounded-xl p-6 shadow-md hover:scale-105 transform transition duration-300">
       <p className="font-semibold">Call/Whatsup</p>
        
         {/* WhatsApp Chat */}
          <a
            href="https://wa.me/250788363732"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
          >
            <FaComments /> Chat with Us
          </a>
          {/* Phone Call */}
          <a
            href="tel:+250788363732"
            className="flex items-center gap-2 bg-[#ff0000] text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <FaPhoneAlt /> Call Us
          </a>
      </div>

      {/* Email */}
      <div className="flex flex-col items-center bg-white text-black rounded-xl p-6 shadow-md hover:scale-105 transform transition duration-300">
        <HiOutlineMail className="text-3xl text-[#ff0000] mb-4" />
        <p className="font-semibold">Email</p>
        <p className="text-gray-700 mt-1 text-center">Admission@kftv.org</p>
      </div>

      {/* Location */}
      <div className="flex flex-col items-center bg-white text-black rounded-xl p-6 shadow-md hover:scale-105 transform transition duration-300">
        <HiOutlineLocationMarker className="text-3xl text-[#ff0000] mb-4" />
        <p className="font-semibold">Location</p>
        <p className="text-gray-700 mt-1 text-center">
          Kigali, Nyarugenge <br />  behind Kiyovu
        </p>
      </div>
    </div>
          <h2 className="text-lg sm:text-xl font-bold p-16 text-gray-700">Book a meeting to talk with head of school</h2>
  {/* calender*/}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
  <a href={calender}>
           <div className="flex flex-col items-center bg-white text-black rounded-xl p-6 shadow-md hover:scale-105 transform transition duration-300">
        < HiOutlineCalendar className="text-3xl text-[#ff0000] mb-4" />
        <p className="font-semibold">Book a Meeting</p>
        <p className="text-gray-700 mt-1 text-center">
          
          
        </p>
      </div>
          </a>
             {/* Location */}
      <div className="flex flex-col items-center bg-white text-black rounded-xl space-y-2 p-4 shadow-md hover:scale-105 transform transition duration-300">
        <HiOutlineLink className="text-3xl text-[#ff0000] mb-1" />
       <a href={ig} className="text-red-700 hover:text-[#ff0000] flex text-2xl space-x-2"> <FaInstagram /> <p className="text-gray-900 text-lg">Follow us</p></a>
      <a href={fb} className="text-blue-800 hover:text-[#ff0000] flex text-2xl space-x-2"> <FaFacebook /> <p className="text-gray-900 text-lg">Follow us</p> </a>

      </div>
     </div>
  </div>
</section>

  );
};

export default Contact;
