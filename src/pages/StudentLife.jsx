
import { motion } from "framer-motion";
import  { useEffect } from "react";
const videos = [
  
  "https://www.youtube.com/embed/Xe2dggHVKSo",
  "https://www.youtube.com/embed/HpxmT6kVOSg",
  "https://www.youtube.com/embed/XdBgAn_UYwA",
   "https://www.youtube.com/embed/s7EJh6J60u8",
  "https://www.youtube.com/embed/wVbB9yU1mzE",
   "https://www.youtube.com/embed/SnzF3KgRbAU",
  "https://www.youtube.com/embed/KCQ1nLQr4DU",
   "https://www.youtube.com/embed/EhbjdfgtU4Q",
  "https://www.youtube.com/embed/JhvvTSyYhLw",
   "https://www.youtube.com/embed/ZJj0Z3xB05k",
  "https://www.youtube.com/embed/xTuMzDIIXi0",
  "https://www.youtube.com/embed/QdjSk3BiEGk",
  "https://www.youtube.com/embed/9FXiWKisbT4",
  
  "https://www.youtube.com/embed/jFNsJ7Wj9Lg",
  "https://www.youtube.com/embed/jMfywaJobeU",
  "https://www.youtube.com/embed/CiVqBYn8iEw",
  "https://www.youtube.com/embed/mfZnletnhOY",
  "https://www.youtube.com/embed/-QoPS7Je4GI",


];

const StudentLifeSection = () => {

 useEffect(() => {
    // Load Instagram embed script
    const scriptId = "instagram-embed-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => {
        window.instgrm?.Embeds.process();
      };
      document.body.appendChild(script);
    } else {
      // Re-process Instagram embeds whenever component updates
      window.instgrm?.Embeds.process();
    }
  }, []);
  return (
    <section className="w-full h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
     {/* Left Column: Student Life Content */}
<motion.div
  className="bg-white p-6 rounded-xl shadow-lg overflow-y-auto h-full"
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 1 }}
>
  <h2 className="text-3xl font-bold mb-6 text-red-600"> Student Life at Kigali Film & Television School</h2>

  <p className="mb-4 text-gray-700">
    At <strong>Kigali Film and Television School (KFTV)</strong>, student life is more than just classes and assignments—it’s a vibrant, creative journey that shapes not only careers but lifelong friendships and unforgettable experiences.
  </p>

  <h3 className="text-2xl font-semibold mb-4 text-red-600"> A Diverse and Welcoming Community</h3>
  <p className="mb-4 text-gray-700">
    Our campus is home to students from <em>East Africa, West Africa, and across the globe</em>. This rich cultural diversity fosters collaboration, cultural exchange, and networking opportunities that extend far beyond graduation. Whether you’re from Nairobi, Lagos, Kinshasa, Johannesburg, or beyond, you’ll feel right at home in Kigali.
  </p>

  <h3 className="text-2xl font-semibold mb-4 text-red-600"> A Hands-On Creative Environment</h3>
  <p className="mb-4 text-gray-700">
    From day one, students dive into <em>practical projects</em> in filmmaking, television production, photography, graphic design, animation, music and audio production, and acting for film & TV. Our studios, editing suites, and production labs are buzzing with creativity, giving students the tools and space to turn ideas into reality.
  </p>

  <h3 className="text-2xl font-semibold mb-4 text-red-600"> Campus Life & Activities</h3>
  <ul className="list-disc ml-5 mb-4 text-gray-700 space-y-2">
    <li><strong>Film Screenings & Festivals:</strong> Enjoy regular film nights, premieres, and in-house film festivals celebrating student work.</li>
    <li><strong>Workshops & Masterclasses:</strong> Learn from industry professionals from across Africa and the world.</li>
    <li><strong>Clubs & Societies:</strong> Join photography clubs, music jam sessions, acting groups, or VFX collectives.</li>
    <li><strong>Cultural Events:</strong> Share your heritage and discover others through cultural days and performances.</li>
  </ul>

  <h3 className="text-2xl font-semibold mb-4 text-red-600"> Student Support & Hospitality</h3>
  <p className="mb-4 text-gray-700">
    We take pride in our <em>warm hospitality</em>. From helping international students settle in, to offering guidance on accommodation and local life, KFTV ensures that every student feels supported. Many graduates speak fondly of the family-like atmosphere that made their time here truly special.
  </p>

  <h3 className="text-2xl font-semibold mb-4 text-red-600"> Life in Kigali – Africa’s Safest and Cleanest City</h3>
  <p className="mb-4 text-gray-700">
    Studying in Kigali means enjoying a vibrant city that’s safe, clean, and full of opportunities. Cafés, art galleries, music venues, and breathtaking scenery are just minutes from campus.
  </p>

  <h3 className="text-2xl font-semibold mb-4 text-red-600"> Memories that Last a Lifetime</h3>
  <p className="mb-4 text-gray-700">
    At KFTV, your journey is about more than graduating with distinction—it’s about building unforgettable memories, mastering your craft, and becoming part of a growing family of creative professionals shaping Africa’s media future.
  </p>

  <a
    href="/apply"
    className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition"
  >
    Apply Now
  </a>
</motion.div>


        {/* Right Column: Videos */}
<motion.div
  className="space-y-6 overflow-y-auto"
  initial={{ opacity: 0, x: 50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 1 }}
>
  {videos.map((video, index) => (
    <div key={index} className="bg-white rounded-lg shadow-md p-2">
      {video.includes("youtube.com") ? (
        <iframe
          className="w-full aspect-video rounded-lg"
          src={video}
          title={`Video ${index + 1}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={video}
          data-instgrm-version="14"
          data-instgrm-dark="true" // <-- makes it dark
          style={{
            background: "#000",      // fallback background
            border: 0,
            borderRadius: "10px",
            margin: "0 auto",
            maxWidth: "540px",
            minWidth: "326px",
            padding: 0,
            width: "100%",
          }}
        ></blockquote>
      )}
    </div>
  ))}
</motion.div>

      </div>
      <video src="https://drive.google.com/file/d/1xKLbtGBCqw5d9qIMeMdvHPnEihdTrLD8/view?usp=drive_link" className="h-4 w-48"> video</video>
    </section>
  );
};

export default StudentLifeSection;
