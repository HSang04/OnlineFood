import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import TrangChu from './pages/Home/TrangChu/TrangChu';
import DangNhap from './pages/Auth/DangNhap/DangNhap';
import DangKy from './pages/Auth/DangKy/DangKy';
import Profile from './pages/Profile/Profile';
const App = () => {
  return (
    <Router>
      <Header />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<TrangChu />} />
          <Route path="/login" element={<DangNhap />} />
          <Route path="/signup" element={<DangKy />} />
           <Route path="/profile" element={<Profile />} />
          
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
