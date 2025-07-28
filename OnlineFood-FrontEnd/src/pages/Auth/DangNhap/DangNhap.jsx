import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "../../../config/API";
import { endpoints } from "../../../config/API";
import './DangNhap.css';

const DangNhap = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    matKhau: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    }

    if (!formData.matKhau) {
      newErrors.matKhau = 'Mật khẩu không được để trống';
    } else if (formData.matKhau.length < 6) {
      newErrors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(endpoints.LOGIN, {
        email: formData.email,
        matKhau: formData.matKhau
      });

      const data = response.data;

      
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("idNguoiDung", data.id);  
      

      alert(data.message || "Đăng nhập thành công!");

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Có lỗi xảy ra. Vui lòng thử lại." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dangnhap-container">
      <div className="dangnhap-wrapper">
        <div className="dangnhap-card">
          <div className="dangnhap-header">
            <h2>Đăng Nhập</h2>
            <p>Chào mừng bạn quay trở lại!</p>
          </div>

          <form onSubmit={handleSubmit} className="dangnhap-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Nhập email của bạn"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="matKhau">Mật khẩu</label>
              <input
                type="password"
                id="matKhau"
                name="matKhau"
                value={formData.matKhau}
                onChange={handleChange}
                className={errors.matKhau ? 'error' : ''}
                placeholder="Nhập mật khẩu"
              />
              {errors.matKhau && <span className="error-message">{errors.matKhau}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Ghi nhớ đăng nhập
              </label>
              <Link to="/quen-mat-khau" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

            <button
              type="submit"
              className="dangnhap-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="dangnhap-footer">
            <p>
              Chưa có tài khoản?
              <Link to="/signup" className="signup-link"> Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangNhap;
