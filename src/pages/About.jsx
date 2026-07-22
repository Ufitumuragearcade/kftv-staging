import React from 'react';
import { Helmet } from "react-helmet-async";
const About = () => {
  return (
    <section className="bg-[#e6f4fa] py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Kigali Film and Television School
          </h1>
          <p className="text-xl md:text-2xl text-gray-900 italic">
            Nurturing Creative Visionaries
          </p>
        </div>

        {/* Description */}
        <div className="space-y-6 text-gray-900 leading-relaxed text-lg">
          <p>
            <span className="font-semibold text-red-600">Kigali Film and Television School (KFTV)</span> 
            is Rwanda's leading film school training professionals in filmmaking, photography, acting, music audio production, graphic design, animation, and visual effects. In the past five years, KFTV has trained over 1,000 professionals who are making their mark across Rwanda, East Africa, and the world.
          </p>

          <p>
            At KFTV, we emphasize hands-on experience. Students direct, shoot, write, and edit their own projects, gaining real-world skills in film production. Our programs are led by accomplished faculty, including professional 3D animators, visual effects artists, and seasoned industry experts.
          </p>

          <p>
            Our photography and graphic design courses combine practical skills with technical and business knowledge, preparing students for professional careers. Acting programs focus on screen acting and modern on-camera techniques, while our music and audio production programs develop technical, creative, and business skills required in the industry.
          </p>

          {/* Unique Features */}
          <div className="bg-gray-900 p-6 rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-600 mb-2">Why Choose KFTV:</p>
            <ul className="list-disc list-inside text-gray-300">
              <li>Flexible course durations: 3 months, 6 months, and 1 year</li>
              <li>Partial scholarship programs for local and international students</li>
              <li>Internationally recognized certifications (RTB & NESA accredited)</li>
              <li>Hands-on learning with professional instructors and industry projects</li>
            </ul>
          </div>

          <p>
            Our goal is to transform passionate individuals into skilled professionals, equipping them with both creative mastery and industry-ready expertise.
          </p>

          {/* Call-to-Action */}
          <div className="text-center py-6 bg-red-600 text-white rounded-lg mt-6">
            <p className="text-xl md:text-2xl font-bold">
              Where Passion Meets Possibility, Creativity Finds Its Home
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
