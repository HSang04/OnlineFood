import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  // Kiểm tra xem đã đăng nhập chưa
  const isLoggedIn = localStorage.getItem('jwt') !== null;

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('jwt');  // hoặc xoá thông tin user khác nếu bạn lưu
    navigate('/login'); // chuyển về trang login
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar px-4">
      <Link className="navbar-brand" to="/">OU RESTAURANT</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link nav-hover" to="/">Trang chủ</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-hover" to="/menu">Thực đơn</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-hover" to="/cart">Giỏ hàng</Link>
          </li>

          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link className="nav-link nav-hover" to="/profile">Hồ sơ</Link>
              </li>
              <li className="nav-item">
                <span className="nav-link nav-hover" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                  Đăng xuất
                </span>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="nav-link nav-hover" to="/login">Đăng nhập</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
