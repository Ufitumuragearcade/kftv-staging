import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import React, { useRef} from "react";
import { motion, useInView } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

function Home() {
  const applicationLink = "https://forms.gle/X1dbz4QjQ8Z5oXkH9";
  const homeYoutube =
    "https://www.youtube.com/embed/mDjFvKQeybA?autoplay=1&mute=1";



  // YouTube iframe URL with JS API enabled
  
  
  const AnimatedSection = ({ children, ...props }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -100, rotateX: 90 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ transformOrigin: "top", perspective: "1000px" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  };


  const programs = [
    "Filmmaking & TV Production",
    "Photography & Graphic Design",
    "3D Animation & VFX",
    "Music & Audio Production",
    "Acting for Film & TV",
    "Programming & Software Dev",
    "Digital Marketing",
  ];

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      
      {/* HERO SECTION */}
 <div className="relative w-full h-screen overflow-hidden">
  {/* Swiper */}
  <Swiper
    modules={[Navigation, Pagination, Autoplay]}
    spaceBetween={0}
    slidesPerView={1}
    loop={true}
    autoplay={{ delay: 5000, disableOnInteraction: false }}
    speed={800}
    pagination={{ clickable: true }}
    className="absolute inset-0 z-0 h-full w-full"
  >
  
    <SwiperSlide className="h-full w-full">
      <img src="./D2.webp" alt="Slide 2" className="w-full h-full object-cover" />
    </SwiperSlide>
    <SwiperSlide className="h-full w-full">
      <img src="./D5.webp" alt="Slide 3" className="w-full h-full object-cover" />
    </SwiperSlide>
    <SwiperSlide className="h-full w-full">
      <img src="./D3.webp" alt="Slide 4" className="w-full h-full object-cover" />
    </SwiperSlide>
    <SwiperSlide className="h-full w-full">
      <img src="./D4.webp" alt="Slide 5" className="w-full h-full object-cover" />
    </SwiperSlide>
  </Swiper>

  {/* Overlay - Note pointer-events-none on parent and pointer-events-auto on inner div */}
  <div className="absolute inset-0 bg-black/60 z-10 grid place-items-center px-4 sm:px-6 text-center text-white h-full pointer-events-none">
    <div className="max-w-3xl pointer-events-auto">
      <p className="text-base sm:text-lg md:text-xl tracking-wide text-gray-200 mb-4">
        Bring Your Creative Ideas to Life With
      </p>
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
        Kigali Film & Television School
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8">
        Empowering the next generation of storytellers through hands-on
        training, expert mentorship, and world-class facilities.
      </p>
      <Link
        to="/programs"
        className="inline-block bg-[#ff0000] hover:bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition duration-300"
      >
        Explore Our Programs
      </Link>
    </div>
  </div>
</div>
            {/* ABOUT SECTION */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Image */}
          <div className="rounded-b-2xl  ">
            <img
              src="./D2.webp"
              alt="Kigali Film and Television School Studio"
              className="w-full h-full object-cover animate-zoom-slow"
            />
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white to-transparent"></div>
          </div>

          {/* Text */}
          <AnimatedSection className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md p-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-6">
              About Kigali Film & Television School
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
              We are the first and leading professional film school in Rwanda.
              Our teaching method is grounded in{" "}
              <span className="font-semibold">hands-on training</span>, ensuring
              our students become active, creative, and highly skilled
              professionals equipped with real-world practical knowledge.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
              Our studio is equipped with the latest, high-quality film
              production tools, professional-grade music and audio recording
              systems, industry-standard software, powerful computers, and much
              more—giving you everything you need to bring your creative visions
              to life.
            </p>
            <Link
              to="/about"
              className="inline-block bg-[#ff0000] hover:bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition duration-300"
            >
              Learn More
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* VIDEO + TEXT SECTION */}
      <section className="flex flex-col lg:flex-row justify-around items-center bg-[#e6f4fa] py-12 sm:py-16 px-4 sm:px-6 lg:px-20 gap-10">
        {/* Text */}
        <AnimatedSection>
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">
              You Can Learn to Do the Same and More
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6">
              Master the skills you need to succeed in today’s world. Our
              programs are designed to give you hands-on experience, industry
              insights, and the confidence to achieve your goals.
            </p>
            <Link
              to="/programs"
              className="inline-block bg-[#ff0000] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg hover:bg-black transition"
            >
              Explore Our Programs
            </Link>
          </div>
        </AnimatedSection>

        {/* Video */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-xl max-w-xl w-full">
          <video
            className="w-full aspect-video object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="video.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* PROGRAM SECTION */}
      <div className="w-full py-20 px-4 bg-white">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Our Programs
          </h2>
          <p className="mt-2 text-gray-600 max-w-xl mx-auto">
            Explore our wide range of courses and find the perfect path to
            kickstart your career.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-white px-6 py-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition transform cursor-pointer text-gray-800 font-semibold text-center"
            >
              {program}
            </div>
          ))}
        </div>

        {/* Call-to-Action */}
        <div className="mt-12 text-center">
          <a
            href={applicationLink}
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-black transition"
          >
            Apply Now
          </a>
        </div>
      </div>


      {/* FINAL CTA SECTION */}
      <section className="py-12 sm:py-16 bg-[#e6f4fa]">
        <div className="container mx-auto px-4 sm:px-6 text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#ff0000]">
            Unlock Your Potential with Kigali Film Academy
          </h2>
          <p className="text-sm sm:text-base md:text-lg font-sans font-medium mt-4 text-gray-600 max-w-4xl mx-auto">
            Contact us today to learn more about our programs, admission process
            and be among more than 1000 alumni
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* YouTube Video */}
          <div
            className="mb-12 relative w-full h-0"
            style={{ paddingBottom: "56.25%" }}
          >
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
              src={homeYoutube}
              title="Kigali Film Academy Overview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Links to Student Life & Media */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 text-center">
            <Link
              to="/Life"
              className="bg-red-600 hover:bg-black transition text-white rounded-xl p-8 flex flex-col justify-center items-center shadow-lg"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                Student Life
              </h3>
              <p className="text-sm sm:text-base">
                Explore vibrant student experiences, campus life, and support
                services.
              </p>
            </Link>

            <Link
              to="/media"
              className="bg-red-600 hover:bg-black transition text-white rounded-xl p-8 flex flex-col justify-center items-center shadow-lg"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                Media
              </h3>
              <p className="text-sm sm:text-base">
                Discover our students’ creative projects, films, and media
                events.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
