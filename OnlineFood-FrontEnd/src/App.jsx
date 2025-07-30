import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import TrangChu from './pages/Home/TrangChu/TrangChu';
import DangNhap from './pages/Auth/DangNhap/DangNhap';
import DangKy from './pages/Auth/DangKy/DangKy';
import Profile from './pages/Profile/Profile';
import QuanLyDanhMuc from './pages/Admin/QuanLyDanhMuc/QuanLyDanhMuc';
import RequireAdmin from './routes/RequireAdmin';
import Unauthorized from './pages/Unauthorized/Unauthorized';
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
            <Route path="/unauthorized" element={<Unauthorized />} />
           

          <Route path="/quan-ly-danh-muc" element={ <RequireAdmin>  <QuanLyDanhMuc /> </RequireAdmin> } />
          
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
