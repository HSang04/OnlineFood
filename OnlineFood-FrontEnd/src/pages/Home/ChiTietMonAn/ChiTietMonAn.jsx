import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../services/axiosInstance";
import './ChiTietMonAn.css';

const ChiTietMonAn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [monAn, setMonAn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [dsMonAnLienQuan, setDsMonAnLienQuan] = useState([]);

  const fetchChiTietMonAn = useCallback(async () => {
    setLoading(true);
    try {
    
      const res = await axios.get(`/mon-an/${id}/dto`);
      setMonAn(res.data);
      
     
      if (res.data.danhMuc?.id) {
        const relatedRes = await axios.get(`/mon-an/category/${res.data.danhMuc.id}`);
        setDsMonAnLienQuan(relatedRes.data.filter(item => item.id !== parseInt(id)).slice(0, 4));
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết món ăn:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChiTietMonAn();
  }, [fetchChiTietMonAn]);

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => prev > 1 ? prev - 1 : 1);
    }
  };

  const handleAddToCart = async () => {
    const idNguoiDung = localStorage.getItem("idNguoiDung");

    if (!idNguoiDung) {
      alert("Bạn cần đăng nhập trước khi thêm vào giỏ hàng.");
      return;
    }

    try {
      await axios.post(`/gio-hang/${idNguoiDung}/add`, null, {
        params: {
          monAnId: monAn.id,
          soLuong: quantity
        }
      });

      alert(`Đã thêm ${quantity} "${monAn.tenMonAn}" vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi thêm vào giỏ:", error);
      alert("Thêm vào giỏ hàng thất bại.");
    }
  };


  const handleBuyNow = async () => {
    const idNguoiDung = localStorage.getItem("idNguoiDung");

    if (!idNguoiDung) {
      alert("Bạn cần đăng nhập trước khi đặt hàng.");
      return;
    }

    try {
     
      await axios.post(`/gio-hang/${idNguoiDung}/add`, null, {
        params: {
          monAnId: monAn.id,
          soLuong: quantity
        }
      });

     
      navigate('/cart');
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Đặt hàng thất bại.");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  
  const calculateTotalPrice = () => {
    const giaHienThi = monAn.coKhuyenMai ? monAn.giaKhuyenMai : monAn.gia;
    return giaHienThi * quantity;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin món ăn...</p>
      </div>
    );
  }

  if (!monAn) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Không tìm thấy món ăn</h2>
        <button onClick={() => navigate('/menu')} className="back-btn">
          Quay lại menu
        </button>
      </div>
    );
  }

  return (
    <div className="chi-tiet-container">
   
      <div className="breadcrumb">
        <span onClick={() => navigate('/menu')} className="breadcrumb-item">
          Menu
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">{monAn.tenMonAn}</span>
      </div>

      <div className="chi-tiet-content">
     
        <div className="image-section">
          <div className="main-image">
            {monAn.hinhAnhMonAns && monAn.hinhAnhMonAns.length > 0 ? (
              <img
                src={monAn.hinhAnhMonAns[selectedImage]?.duongDan}
                alt={monAn.tenMonAn}
                className="main-dish-img"
              />
            ) : (
              <div className="no-main-image">
                <i className="fas fa-utensils"></i>
                <span>Không có ảnh</span>
              </div>
            )}
          </div>
          
          {monAn.hinhAnhMonAns && monAn.hinhAnhMonAns.length > 1 && (
            <div className="thumbnail-list">
              {monAn.hinhAnhMonAns.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img.duongDan} alt={`${monAn.tenMonAn} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

    
        <div className="info-section">
          <div className="dish-header">
            <h1 className="dish-title">{monAn.tenMonAn}</h1>
            <span className="category-tag">
              {monAn.danhMuc?.tenDanhMuc || "Khác"}
            </span>
          </div>

      
          <div className="price-section">
            {monAn.coKhuyenMai ? (
              <div className="price-with-promotion">
                <div className="price-row">
                  <span className="current-price">
                    {formatPrice(monAn.giaKhuyenMai)}
                  </span>
                  <span className="original-price">
                    {formatPrice(monAn.gia)}
                  </span>
                </div>
                <div className="discount-info">
                  <span className="discount-badge">
                    -{monAn.phanTramGiamGia}%
                  </span>
                  <span className="savings-text">
                    Tiết kiệm: {formatPrice(monAn.soTienTietKiem || (monAn.gia - monAn.giaKhuyenMai))}
                  </span>
                </div>
              </div>
            ) : (
              <span className="current-price">
                {formatPrice(monAn.gia)}
              </span>
            )}
          </div>

          <div className="description-section">
            <h3>Mô tả món ăn</h3>
            <p className="description-text">
              {monAn.moTa || "Chưa có mô tả cho món ăn này."}
            </p>
          </div>

       
          <div className="order-section">
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="quantity-controls">
                <button 
                    onClick={() => handleQuantityChange('decrease')}
                    className="quantity-btn decrease"
                    disabled={quantity <= 1}
                >
                    –
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                    onClick={() => handleQuantityChange('increase')}
                    className="quantity-btn increase"
                >
                    +
                </button>
              </div>
            </div>

            <div className="total-price">
              <span>Tổng cộng: </span>
              <span className="total-amount">{formatPrice(calculateTotalPrice())}</span>
              {monAn.coKhuyenMai && (
                <div className="total-savings" style={{ fontSize: "0.9rem", color: "#28a745", marginTop: "5px" }}>
                  (Tiết kiệm: {formatPrice((monAn.gia - monAn.giaKhuyenMai) * quantity)})
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button onClick={handleAddToCart} className="add-to-cart-btn">
                <i className="fas fa-cart-plus"></i>
                Thêm vào giỏ hàng
              </button>
              <button onClick={handleBuyNow} className="buy-now-btn">
                <i className="fas fa-bolt"></i>
                Đặt ngay
              </button>
            </div>
          </div>
        </div>
      </div>

    
      {dsMonAnLienQuan.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">Món ăn liên quan</h2>
          <div className="related-grid">
            {dsMonAnLienQuan.map((mon) => (
              <div 
                key={mon.id} 
                className="related-card"
                onClick={() => navigate(`/chi-tiet-mon-an/${mon.id}`)}
              >
                <div className="related-image">
                  {mon.hinhAnhMonAns?.length > 0 ? (
                    <img
                      src={mon.hinhAnhMonAns[0].duongDan}
                      alt={mon.tenMonAn}
                    />
                  ) : (
                    <div className="no-related-image">
                      <i className="fas fa-utensils"></i>
                    </div>
                  )}
                </div>
                <div className="related-info">
                  <h4 className="related-name">{mon.tenMonAn}</h4>
                  <div className="related-price-section">
                    {mon.coKhuyenMai ? (
                      <>
                        <span className="related-current-price" style={{ color: "red", fontWeight: "bold" }}>
                          {formatPrice(mon.giaKhuyenMai)}
                        </span>
                        <span className="related-original-price" style={{ 
                          textDecoration: "line-through", 
                          color: "gray", 
                          marginLeft: "5px", 
                          fontSize: "12px" 
                        }}>
                          {formatPrice(mon.gia)}
                        </span>
                      </>
                    ) : (
                      <span className="related-price">{formatPrice(mon.gia)}</span>
                    )}
                  </div>
                  {mon.coKhuyenMai && (
                    <div className="related-discount-badge" style={{ 
                      backgroundColor: "red", 
                      color: "white", 
                      padding: "2px 6px", 
                      borderRadius: "3px", 
                      fontSize: "10px",
                      marginTop: "4px",
                      display: "inline-block"
                    }}>
                      -{mon.phanTramGiamGia}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    
      <div className="back-to-menu">
        <button 
          onClick={() => navigate('/menu')} 
          className="back-menu-btn"
        >
          <i className="fas fa-arrow-left"></i>
          Quay lại menu
        </button>
      </div>
    </div>
  );
};

export default ChiTietMonAn;