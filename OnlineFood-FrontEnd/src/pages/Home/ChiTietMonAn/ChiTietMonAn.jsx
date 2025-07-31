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
      const res = await axios.get(`/mon-an/${id}`);
      setMonAn(res.data);
      
      // Lấy món ăn liên quan cùng danh mục
      if (res.data.danhMuc?.id) {
        const relatedRes = await axios.get(`/mon-an/search?danhMuc=${res.data.danhMuc.id}`);
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

  const handleAddToCart = () => {
    // Logic thêm vào giỏ hàng
    console.log(`Thêm ${quantity} ${monAn.tenMonAn} vào giỏ hàng`);
    alert(`Đã thêm ${quantity} ${monAn.tenMonAn} vào giỏ hàng!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/menu')} className="breadcrumb-item">
          Menu
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">{monAn.tenMonAn}</span>
      </div>

      <div className="chi-tiet-content">
        {/* Hình ảnh món ăn */}
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

        {/* Thông tin món ăn */}
        <div className="info-section">
          <div className="dish-header">
            <h1 className="dish-title">{monAn.tenMonAn}</h1>
            <span className="category-tag">
              {monAn.danhMuc?.tenDanhMuc || "Khác"}
            </span>
          </div>

          <div className="price-section">
            <span className="current-price">{formatPrice(monAn.gia)}</span>
          </div>

          <div className="description-section">
            <h3>Mô tả món ăn</h3>
            <p className="description-text">
              {monAn.moTa || "Chưa có mô tả cho món ăn này."}
            </p>
          </div>

          {/* Quantity và Add to Cart */}
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
              <span className="total-amount">{formatPrice(monAn.gia * quantity)}</span>
            </div>

            <div className="action-buttons">
              <button onClick={handleAddToCart} className="add-to-cart-btn">
                <i className="fas fa-cart-plus"></i>
                Thêm vào giỏ hàng
              </button>
              <button className="buy-now-btn">
                <i className="fas fa-bolt"></i>
                Đặt ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Món ăn liên quan */}
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
                  <span className="related-price">{formatPrice(mon.gia)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back to menu button */}
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