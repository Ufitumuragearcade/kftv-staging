import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
import Login from './pages/Login';
import Apply from './pages/Apply';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/media" element={<Media />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/Life" element={<StudentLife />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/studyNow" element={<PayLater />} />
        <Route path="/scholarship" element={<Scholarship/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/apply" element={<Apply/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy/>} />
        <Route path="/terms-and-conditions" element={<TermsConditions/>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;