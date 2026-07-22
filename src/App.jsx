import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Media from './pages/Media';
import Contact from './pages/Contact';
import StudentLife from './pages/StudentLife';
import Scholarship from './pages/Scholarship';
import Donate from './pages/Donate';
import PayLater from './pages/PayLater';


function App() {
  return (
    <Router>
     
      <ConditionalHeader />
      <Routes>
        
        <Route path="/" element={<Home/>} />
         <Route path="/kigaliFilmsandTelevisionSchool" element={<Home/>} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/media" element={<Media />} />
        <Route path="/donate" element={<Donate />} />
          <Route path="/Life" element={<StudentLife />} />
        <Route path="/contact" element={<Contact />} />
         <Route path="/studyNow" element={<PayLater />} />
         <Route path="/scholarship" element={<Scholarship/>} />
       
      </Routes>
      <ConditionalFooter />
     
      
    </Router>
  );
}

// Helper component to conditionally render Footer
function ConditionalFooter() {
  const location = useLocation();
  const hideFooterOnRoutes = ["/adm/auth/login","/adm/msgs"]; // Add all paths where you want to hide the footer

  if (hideFooterOnRoutes.includes(location.pathname)) {
    return null; // Don't render the footer
  }

  return <Footer />; // Render the footer
}


function ConditionalHeader() {
  const location = useLocation();
  const hideFooterOnRoutes = ["/adm/auth/login","/adm/msgs"]; // Add all paths where you want to hide the footer

  if (hideFooterOnRoutes.includes(location.pathname)) {
    return null; // Don't render the footer
  }

  return <Header/>; // Render the footer
}

export default App;
