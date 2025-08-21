
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import TrangChu from './pages/Home/TrangChu/TrangChu';
import DangNhap from './pages/Auth/DangNhap/DangNhap';
import DangKy from './pages/Auth/DangKy/DangKy';
import ThongTinCaNhan from './pages/Profile/ThongTinCaNhan/ThongTinCaNhan';
import QuanLyDanhMuc from './pages/Admin/QuanLyDanhMuc/QuanLyDanhMuc';
import RequireAdmin from './routes/RequireAdmin';
import Unauthorized from './pages/Unauthorized/Unauthorized';
import QuanLyMonAn from './pages/Admin/QuanLyMonAn/QuanLyMonAn';
import ThemSuaMonAn from './pages/Admin/QuanLyMonAn/ThemSuaMonAn';
import MenuMonAn from './pages/Home/MenuMonAn/MenuMonAn'
import ChiTietMonAn from './pages/Home/ChiTietMonAn/ChiTietMonAn'
import GioHang from './pages/Profile/GioHang/GioHang';
import ThanhToan from './pages/Pay/ThanhToan/ThanhToan'
import QuanLyDonHang from './pages/Admin/QuanLyDonHang/QuanLyDonHang'
import QuanLyNguoiDung from './pages/Admin/QuanLyNguoiDung/QuanLyNguoiDung';
import ChiTietNguoiDung from './pages/Admin/QuanLyNguoiDung/ChiTietNguoiDung';
import QuanLyVoucher from './pages/Admin/QuanLyVoucher/QuanLyVoucher';
import ThemSuaVoucher from './pages/Admin/QuanLyVoucher/ThemSuaVoucher';
import LichSuGiaoDich from './pages/Profile/LichSuGiaoDich/LichSuGiaoDich';
import QuenMatKhau from './pages/Auth/QuenMatKhau/QuenMatKhau';
import ResetPassword from './pages/Auth/QuenMatKhau/ResetMatKhau';

import VNPayResult from './pages/Pay/KetQua/VNPayResult';
import HoaDon from './pages/Profile/HoaDon/HoaDon';
import ThongKe from './pages/Admin/ThongKe/ThongKe';

import TinNhan from './pages/Profile/TinNhan/TinNhan';

const App = () => {
  return (
    <Router>
      <Header />
      <div className="container mt-4">


        
        <Routes>
          <Route path="/" element={<TrangChu />} />
          <Route path="/login" element={<DangNhap />} />
          <Route path="/signup" element={<DangKy />} />
          <Route path="/profile" element={<ThongTinCaNhan />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/menu" element={<MenuMonAn />} />
          <Route path="/chi-tiet-mon-an/:id" element={<ChiTietMonAn />} />
           <Route path="/cart" element={<GioHang />} />
           <Route path="/pay"element={<ThanhToan />} />
           <Route path="/lich-su-giao-dich"element={<LichSuGiaoDich />} />
           <Route path="/forgot-password" element={<QuenMatKhau />} />
           <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/chat" element={<TinNhan />} />

          <Route path="/vnpay-result" element={<VNPayResult />} />
          <Route path="/payment-result" element={<VNPayResult />} />
          <Route path="/hoa-don/:donHangId" element={<HoaDon />} />
          {/* <Route path="/invoice/:donHangId" element={<HoaDon />} /> */}
           
          
           

          <Route path="/quan-ly-danh-muc" element={ <RequireAdmin>  <QuanLyDanhMuc /> </RequireAdmin> } />
          <Route path="/quan-ly-mon-an" element={ <RequireAdmin>  <QuanLyMonAn /> </RequireAdmin> } />
          <Route path="/quan-ly-don-hang" element={ <RequireAdmin>  <QuanLyDonHang /> </RequireAdmin> } />
       

          <Route path="/nguoi-dung" element={ <RequireAdmin>  <ChiTietNguoiDung /> </RequireAdmin> } />
          <Route path="/nguoi-dung/:id" element={ <RequireAdmin>  <ChiTietNguoiDung /> </RequireAdmin> } />
          <Route path="/quan-ly-nguoi-dung" element={ <RequireAdmin>  <QuanLyNguoiDung /> </RequireAdmin> } />

          
          <Route path="/quan-ly-voucher" element={ <RequireAdmin>  <QuanLyVoucher /> </RequireAdmin> } />
           <Route path="/voucher/them" element={ <RequireAdmin>  <ThemSuaVoucher /> </RequireAdmin> } />
          <Route path="/voucher/sua/:id" element={ <RequireAdmin>  <ThemSuaVoucher /> </RequireAdmin> } />
          
          
        
          <Route path="/them-sua-mon-an" element={ <RequireAdmin>  <ThemSuaMonAn /> </RequireAdmin> } />
          <Route path="/them-sua-mon-an/:id" element={ <RequireAdmin>  <ThemSuaMonAn /> </RequireAdmin> } />
           <Route path="/thong-ke" element={ <RequireAdmin>  <ThongKe /> </RequireAdmin> } />
          
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
