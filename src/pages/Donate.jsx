import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
const Donate = () => {

  const videos = [

  "https://www.youtube.com/embed/Ma4TmfGOPE8",
  "https://www.youtube.com/embed/CzKGi3lmCtY",
  "https://www.youtube.com/embed/vggHR2avGkA",
  "https://www.youtube.com/embed/whq-ovRxML0",
  "https://www.youtube.com/embed/M9I8Pk4Zy8I",
  "https://www.youtube.com/embed/DXcZyptHf2Q",
  "https://www.youtube.com/embed/PsscEVAkrZA"
];



  return (
    <section className="bg-[#e6f4fa] py-16 px-4 sm:px-8 lg:px-20">
       <Helmet>
               <title>Donate </title>
               <meta
                 name="description"
                 content="Let's remove barries and support young generation through financial assistance  "
               />
             </Helmet>
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Support the Next Generation of African Creatives
          </h1>
          <p className="text-xl text-gray-700 italic">
            Your donation can change a life.
          </p>
        </div>

        {/* Why Your Donation Matters */}
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Your Donation Matters
          </h2>
          <p>
            At Kigali Film and Television School (KFTV), talented students dream of telling stories through film, music, photography, animation, and television. For many, tuition is out of reach. Your donation helps break barriers and empower young creatives.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Empower a student’s future with skills for a lifetime career.</li>
            <li>Break cycles of poverty by creating job opportunities.</li>
            <li>Give voice to African stories that inspire the world.</li>
            <li>Build a stronger creative industry across Africa.</li>
          </ul>
        </div>

        {/* Where Your Money Goes */}
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Where Your Money Goes
          </h2>
          <p>Every donation supports scholarship opportunities in programs such as</p>
          <ul className="list-inside text-gray-700 space-y-2">
            <li> Filmmaking & Television Production</li>
            <li> Photography & Graphic Design</li>
            <li> Music & Audio Production</li>
            <li> Acting for Film & TV</li>
            <li> Animation & Visual Effects</li>
          </ul>
          <p>Example of Your Impact:</p>
          <ul className=" list-inside text-gray-700 space-y-2">
            <li>$50 – Supports basic learning materials for students.</li>
            <li>$200 – Covers a month of tuition for a partial scholar.</li>
            <li>$500 – Funds a full semester for a student from a rural area.</li>
            <li>$1,000 – Provides a full-year scholarship for a student in need.</li>
          </ul>
        </div>

        {/* Transparency */}
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Our Commitment to Transparency
          </h2>
          <ul className=" list-inside text-gray-700 space-y-2">
            <li>Regular updates and student success stories.</li>
            <li>Financial accountability reports for all scholarship funds.</li>
            <li>Opportunities to connect with the students you help.</li>
          </ul>
        </div>

        {/* Ways to Give */}
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ways to Give</h2>
          <ul className=" list-inside text-gray-700 space-y-2">
            <li>One-Time Donation – Any amount makes a real difference.</li>
            <li>Monthly Giving – Commit to ongoing support and change lives every month.</li>
            <li>Corporate Sponsorship – Partner with KFTV to fund multiple scholarships.</li>
            <li>In-Kind Contributions – Donate equipment, resources, or services that support student learning.</li>
          </ul>
        </div>

        <section className=" ">
           {/* Videos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {videos.map((video, index) => (
            <div key={index} className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                className="w-full h-64 sm:h-56 lg:h-64"
                src={video}
                title={`Video ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
            </div>
           
          ))}

          <div>  <Link
          to="/scholarship"
          className="inline-block text-gray-600  font-semibold "
        >
          Read more about Scholarship ....
        </Link></div>
        </div>
        </section>

        {/* Call-to-Action */}
        <div className="bg-red-600 text-white p-8 rounded-2xl text-center space-y-4">
          <h2 className="text-3xl font-bold">Give Today. Change Tomorrow.</h2>
          <p>Turn untold African stories into films, equip youth with world-class creative skills, and empower communities through art.</p>
          <a 
            href="[Secure Donation Link]" 
            className="inline-block bg-white text-red-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300"
          >
            Donate Online
          </a>
          <p className="flex items-center justify-center gap-2 text-lg mt-4">
            <FaEnvelope /> Email: <a href="mailto:donate@kftv.org" className="underline">donate@kftv.org</a> | <FaPhoneAlt /> Call: +250788306623
          </p>
          <p className="flex items-center justify-center gap-2">
            <FaMapMarkerAlt /> Visit: Kigali Film and Television School, Kigali, Rwanda
          </p>
        </div>

      </div>
    </section>
  );
};

export default Donate;
