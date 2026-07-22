import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Helmet } from "react-helmet-async";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Media() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // All images in order for the lightbox
  const images = [
    "am1.jpeg",
    "am2.jpeg",
    "am3.jpeg",
    "am6.jpeg",
    "am7.jpeg",
    "am8.jpeg",
    "am9.jpeg",
    "am10.jpeg"
  ];

  const openLightbox = (img) => {
    setCurrentIndex(images.indexOf(img));
    setOpen(true);
  };

  return (
    <section className="bg-[#f8f9fa] space-y-20 py-12 px-4 sm:px-8 lg:px-20">
      <Helmet>
        <title>KFTV News | Kigali Film and Television School</title>
        <meta
          name="description"
          content="Stay updated with the latest events, news, and experiences happening at Kigali Film and Television School (KFTV)."
        />
        <meta property="og:title" content="KFTV News | Kigali Film and Television School" />
        <meta
          property="og:description"
          content="Stay updated with the latest events, news, and experiences happening at Kigali Film and Television School (KFTV)."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kftvschool.com/media" />
        <meta property="og:image" content="%PUBLIC_URL%/logo1.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>

      {/* Part 1 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            spaceBetween={20}
            loop={true}
            className="w-full h-full"
          >
            {["am1.jpeg", "am2.jpeg"].map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => openLightbox(img)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
            The Israel Ambassador to Rwanda Visits Kigali Film and Television School
          </h1>
          <p className="text-gray-700 leading-relaxed">
            The Ambassador of Israel to Rwanda, Dr. Ron Adam, visited Kigali Film and Television School, 
            commended its work in training youth, and provided financial support to upgrade equipment 
            and sustain operations during COVID-19.
          </p>
          <a
            href="/documents/IsraelAmbasador.docx"
            download
            className="inline-block bg-[#ff0000] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            Read More
          </a>
        </div>
      </div>

      {/* Part 2 */}
      <div className="flex flex-col md:flex-row items-center gap-10 p-6  rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
            Maison Shalom & KFTV Partner to Train Youth
          </h1>
          <p className="text-gray-700 leading-relaxed">
            Maison Shalom has partnered with Kigali Film and Television School to train youth from Mahama Refugee Camp 
            in filmmaking, graphic design, and photography. Leaders encouraged the students to stay disciplined, 
            innovative, and committed to becoming future multimedia professionals.
          </p>
          <a
            href="/documents/MaisonShalom.docx"
            download
            className="inline-block bg-[#ff0000] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            Read More
          </a>
        </div>
        <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
          <img
            src="am3.jpeg"
            alt="Maison Shalom partnership"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => openLightbox("am3.jpeg")}
          />
        </div>
      </div>

      {/* Part 3 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 p-6  rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
            DAMIAN KOCUR a filmmaker from Poland visited KIGALI FILM AND TELEVISION SCHOOL to conduct the masterclass
          </h1>
          <p className="text-gray-700 leading-relaxed">
            Award-winning filmmaker Damian Kocur conducted a masterclass at Kigali Film and Television School, sharing his filmmaking process, screening his works,
            and giving students valuable insights into cinematography and production
          </p>
          <a
            href="/documents/DamianVisit.docx"
            download
            className="inline-block bg-[#ff0000] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            Read More
          </a>
        </div>

        <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            spaceBetween={20}
            loop={true}
            className="w-full h-full"
          >
            {["am4.jpeg", "am5.jpeg"].map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => openLightbox(img)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
         {/* Part 5 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 p-6  rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
            Patrisse Marie Khan-Cullors Brignac, co-founder of the Black Lives Matter movement, artist and writer
          </h1>
          <p className="text-gray-700 leading-relaxed">
             Patrisse directs and produces theother, performance pieces and docu series  and describe art as an 
           economic and spiritual engine  that if used properly can and does transform the world          </p>
          <a
            href="/documents/Patricie.docx"
            download
            className="inline-block bg-[#ff0000] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            Read More
          </a>
        </div>

        <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            spaceBetween={20}
            loop={true}
            className="w-full h-full"
          >
            {["am6.jpeg", "am7.jpeg"].map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => openLightbox(img)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Part 4 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 p-6  rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            spaceBetween={20}
            loop={true}
            className="w-full h-full"
          >
            {["am8.jpeg", "am9.jpeg"].map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => openLightbox(img)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
            Damola Ademola, a Nigerian professional filmmaker visited KFTV SCHOOL 
          </h1>
          <p className="text-gray-700 leading-relaxed">
            Damola, executive producer and co-founder of Inkblot Productions,
            conducted a workshop at KFTV School, sharing his production process, project planning, pitching strategies, and practical filmmaking tips,
            while encouraging students to create using available resources
          </p>
          <a
            href="documents/DamolaVisit.docx"
            download
            className="inline-block bg-[#ff0000] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            Read More
          </a>
        </div>
      </div>

      {/* Part 5 */}
      <div className="flex flex-col md:flex-row items-center gap-10 p-6  rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
            Canon Central and North Africa collaborates with Kigali Film and Television School to support the development of the film and photography industries
          </h1>
          <p className="text-gray-700 leading-relaxed">
            Canon partnered with Kigali Film and Television School to deliver a 
            week-long photography and filmmaking workshop, providing practical 
            training and exposure to the latest Canon technology. The initiative, part of Canon’s Miraisha Programme, empowers 
            participants with skills to advance in Rwanda’s creative arts industry
          </p>
          <button className="inline-block bg-[#ff0000] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition">
            Read More
          </button>
        </div>
        <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
          <img
            src="am10.jpeg"
            alt="Canon workshop"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => openLightbox("am10.jpeg")}
          />
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={images.map((src) => ({ src }))}
        index={currentIndex}
      />
    </section>
  );
}
