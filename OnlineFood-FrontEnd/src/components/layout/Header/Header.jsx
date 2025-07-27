import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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
          <li className="nav-item">
            <Link className="nav-link nav-hover" to="/login">Đăng nhập</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;