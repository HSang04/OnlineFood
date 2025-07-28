import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DangKy.css';

const DangKy = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    xacNhanMatKhau: '',
    vaiTro: 'CUSTOMER' // Mặc định là CUSTOMER
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Họ tên không được để trống';
    } else if (formData.hoTen.trim().length < 2) {
      newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.matKhau) {
      newErrors.matKhau = 'Mật khẩu không được để trống';
    } else if (formData.matKhau.length < 6) {
      newErrors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.matKhau)) {
      newErrors.matKhau = 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }

    if (!formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.matKhau !== formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản sử dụng';
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
      // Gọi API đăng ký - khớp với backend endpoint /auth/signup
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hoTen: formData.hoTen.trim(),
          email: formData.email,
          matKhau: formData.matKhau,
          vaiTro: formData.vaiTro
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Lưu JWT token và thông tin user vào localStorage
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userEmail', formData.email);
        
        // Hiển thị thông báo thành công
        alert(data.message || 'Đăng ký thành công!');
        
        // Chuyển hướng dựa trên role hoặc về trang chủ
        if (data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Đăng ký thất bại' });
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ submit: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dangky-container">
      <div className="dangky-wrapper">
        <div className="dangky-card">
          <div className="dangky-header">
            <h2>Đăng Ký</h2>
            <p>Tạo tài khoản mới để bắt đầu</p>
          </div>

          <form onSubmit={handleSubmit} className="dangky-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hoTen">Họ và tên *</label>
                <input
                  type="text"
                  id="hoTen"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleChange}
                  className={errors.hoTen ? 'error' : ''}
                  placeholder="Nhập họ và tên"
                />
                {errors.hoTen && <span className="error-message">{errors.hoTen}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="matKhau">Mật khẩu *</label>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="xacNhanMatKhau">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  id="xacNhanMatKhau"
                  name="xacNhanMatKhau"
                  value={formData.xacNhanMatKhau}
                  onChange={handleChange}
                  className={errors.xacNhanMatKhau ? 'error' : ''}
                  placeholder="Nhập lại mật khẩu"
                />
                {errors.xacNhanMatKhau && <span className="error-message">{errors.xacNhanMatKhau}</span>}
              </div>
            </div>

            <div className="form-terms">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                />
                <span className="checkmark"></span>
                Tôi đồng ý với <Link to="/dieu-khoan" target="_blank">Điều khoản sử dụng</Link> và 
                <Link to="/chinh-sach" target="_blank"> Chính sách bảo mật</Link>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

            <button 
              type="submit" 
              className="dangky-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
          </form>

          <div className="dangky-footer">
            <p>
              Đã có tài khoản? 
              <Link to="/dang-nhap" className="login-link"> Đăng nhập ngay</Link>
            </p>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default DangKy;