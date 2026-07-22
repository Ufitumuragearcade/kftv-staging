import React from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
const Scholarship = () => {

  const handleScholarship = () => {
    // Send a custom event to Google Tag Manager
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "apply for a program ", // Custom event name
      formName: "Google Form - application for a program" // Optional metadata
    });

    // Open the Google Form in a new tab
    window.open("https://forms.gle/DGNgaJQ1MajVFmwFA", "_blank");
  };

  return (
    <div className="bg-[#e6f4fa] text-black py-12 px-6">
      <div className="max-w-6xl mx-auto">
      
        {/* Programs Description */}
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <section className="text-center">
            <p className="text-lg text-gray-800 leading-relaxed max-w-3xl mx-auto">
              Our <strong className="text-[#ff0000]">Short-Term Training Programs</strong> are designed for individuals looking for a fast and focused learning experience. These programs offer hands-on training in various fields, providing a practical and immersive education in a short period of time. For those seeking a deeper, more comprehensive understanding, the <strong  className="text-[#ff0000]">One-Year Comprehensive Program</strong> offers an intensive curriculum. This program combines theoretical knowledge with practical experience, allowing students to fully develop their skills and gain valuable industry insights over the course of the year.
            </p>
          </section>
        </div>

        {/* Scholarship Description */}
        <div className="bg-white p-8 rounded-lg shadow-xl mt-10">
          <h2 className="text-3xl font-bold text-[#ff0000] mb-4">Partial Scholarship Program</h2>
          <p className="text-lg text-gray-800 mb-4">
            We believe talent should never be hindered by financial constraints. Our Partial Scholarship Program is designed to support individuals passionate about film and multimedia but facing financial challenges.
          </p>
          <h3 className="text-xl font-semibold text-[#ff0000] mb-4">Who Qualifies?</h3>
          <p className="text-lg text-gray-800 mb-4">
            If you have a strong desire to explore filmmaking, photography, animation, acting, or music audio production, we invite you to apply. We focus on passion and potential, ensuring that financial constraints do not stand in the way of your dreams.
          </p>
          <h3 className="text-xl font-semibold text-[#ff0000] mb-4">How to Apply</h3>
          
          <p className="text-lg text-gray-800 mb-4">

            To apply for the scholarship, submit a passion statement and complete the application form at: 
            <button  onClick={handleScholarship} className="text-[#009EEF] hover:animate-bounce underline  font-semibold ml-1">
            Apply for Scholarship
            </button>
          </p>
             <section className="bg-white p-6 sm:p-8 rounded-2xl">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: 'Step 1', title: 'Complete Form', desc: 'Fill out the online application form.' },
                { step: 'Step 2', title: 'Select Program', desc: 'Choose the program you wish to study.' },
                { step: 'Step 3', title: 'Submit Documents', desc: 'Attach required supporting documents.' },
                { step: 'Step 4', title: 'Admissions Review', desc: 'Shortlisted candidates will be contacted.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow shadow-black">
                  <span className="text-xs font-bold text-black uppercase">{item.step}</span>
                  <h4 className="font-bold text-slate-900 mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <h3 className="text-xl font-semibold text-[#ff0000] mb-4">Benefits of the Scholarship</h3>
          <ul className="text-lg text-gray-800 mb-4 list-disc pl-6">
            <li>Reduced Tuition (up to 80%)</li>
            <li>Mentorship Opportunities from Industry Experts</li>
            <li>Networking with Leading Professionals</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">Contact Us for More Information</h3>
            <a
          href="/contact"
          className="inline-block bg-[#ff0000] hover:bg-black text-white px-5 py-2 rounded-lg font-semibold shadow-lg transition"
        >
          Contact Us
        </a>
        </div>
      </div>
    </div>
  );
};

export default Scholarship;
