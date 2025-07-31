import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../services/axiosInstance";
import './MenuMonAn.css';

const MenuMonAn = () => {
  const [dsMonAn, setDsMonAn] = useState([]);
  const [dsMonAnGoc, setDsMonAnGoc] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

 
    const tinhPhanTramGiamGia = (giaGoc, giaGiam) => {
      if (!giaGoc || !giaGiam || giaGiam <= 0 || giaGiam >= giaGoc) {
        return 0;
      }
      return Math.round(100 - (giaGiam / giaGoc)*100 );
    };


  const fetchMonAn = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/mon-an');
      const activeItems = res.data.filter(mon => mon.trangThai === 1); 
      setDsMonAn(activeItems);
      setDsMonAnGoc(activeItems);
    } catch (err) {
      console.error("Lỗi lấy danh sách món ăn:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDanhMuc = async () => {
    try {
      const res = await axios.get('/danh-muc');
      setDsDanhMuc(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    fetchMonAn();
    fetchDanhMuc();
  }, []);

  const applyFilters = useCallback(() => {
    let filteredData = [...dsMonAnGoc];

    if (keyword.trim()) {
      filteredData = filteredData.filter(mon =>
        mon.tenMonAn.toLowerCase().includes(keyword.toLowerCase()) ||
        mon.moTa?.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (selectedCategory) {
      filteredData = filteredData.filter(mon => 
        mon.danhMuc?.id === selectedCategory || mon.danhMucId === selectedCategory ||
        mon.danhMuc?.id === parseInt(selectedCategory) || mon.danhMucId === parseInt(selectedCategory)
      );
    }

    if (sortBy) {
      filteredData = filteredData.sort((a, b) => {
        switch (sortBy) {
          case "gia-tang":
            return a.gia - b.gia;
          case "gia-giam":
            return b.gia - a.gia;
          case "ten-az":
            return a.tenMonAn.localeCompare(b.tenMonAn);
          case "ten-za":
            return b.tenMonAn.localeCompare(a.tenMonAn);
          default:
            return 0;
        }
      });
    }

    setDsMonAn(filteredData);
  }, [dsMonAnGoc, keyword, selectedCategory, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSidebarOpen(false);
  };

  const resetFilter = () => {
    setKeyword("");
    setSelectedCategory("");
    setSortBy("");
  };

  // const formatPrice = (price) => {
  //   return new Intl.NumberFormat('vi-VN', {
  //     style: 'currency',
  //     currency: 'VND'
  //   }).format(price);
  // };

  return (
    <div className="restaurant-layout">
      {/* Header với thanh tìm kiếm */}
      <div className="top-header">
        <div className="container">
          <div className="header-content">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
              <span>DANH MỤC MÓN ĂN</span>
            </button>
            
            <div className="search-bar">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm món ăn..."
                  className="main-search"
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="container">
          <div className="filter-controls">
            <div className="filter-options">
              <button className="filter-btn">
                <i className="fas fa-filter"></i>
                Bộ lọc
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="">Sắp xếp theo</option>
                <option value="gia-tang">Giá: Thấp đến cao</option>
                <option value="gia-giam">Giá: Cao đến thấp</option>
                <option value="ten-az">Tên: A-Z</option>
                <option value="ten-za">Tên: Z-A</option>
              </select>

              {(selectedCategory || sortBy || keyword) && (
                <button onClick={resetFilter} className="reset-btn">
                  <i className="fas fa-times"></i>
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="container">
          <div className="content-wrapper">
            <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
              <div className="sidebar-header">
                <h3>
                  <i className="fas fa-utensils"></i>
                  DANH MỤC MÓN ĂN
                </h3>
              </div>
              
              <div className="category-list">
                <div 
                  className={`category-item ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => handleCategorySelect("")}
                >
                  <span>TẤT CẢ MÓN ĂN</span>
                </div>
                
                {dsDanhMuc.map((category) => (
                  <div 
                    key={category.id}
                    className={`category-item ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(category.id.toString())}
                  >
                    <span>{category.tenDanhMuc.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay cho mobile */}
            {sidebarOpen && (
              <div 
                className="sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}

            <div className="main-section">
              {loading && (
                <div className="loading-wrapper">
                  <div className="loading-spinner"></div>
                  <p>Đang tải...</p>
                </div>
              )}

              <div className="products-grid">
                {dsMonAn.length > 0 ? (
                  dsMonAn.map((mon) => {
                    
                    const discountPercentage = tinhPhanTramGiamGia(mon.gia, mon.khuyenMai?.giaGiam);
                    
                    return (
                      <div key={mon.id} className="product-card">
                        {discountPercentage > 0 && (
                          <div className="sale-badge">
                            Giảm {discountPercentage}%
                          </div>
                        )}
                        
                        <div 
                          className="product-image"
                          onClick={() => navigate(`/chi-tiet-mon-an/${mon.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {mon.hinhAnhMonAns?.length > 0 ? (
                            <img
                              src={mon.hinhAnhMonAns[0].duongDan}
                              alt={mon.tenMonAn}
                              className="dish-image"
                            />
                          ) : (
                            <div className="no-image">
                              <i className="fas fa-utensils"></i>
                            </div>
                          )}
                        </div>
                        
                        <div className="product-info">
                          <div className="product-labels">
                            <span className="label">{mon.danhMuc?.tenDanhMuc || "Món ăn"}</span>
                          </div>
                          
                          <h3 
                            className="product-name"
                            onClick={() => navigate(`/chi-tiet-mon-an/${mon.id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            {mon.tenMonAn}
                          </h3>
                          
                     <div className="price-section" style={{ textAlign: "center" }}>
                            {mon.khuyenMai?.giaGiam ? (
                              <div>
                                <div style={{ color: "red", fontWeight: "bold", fontSize: "26px" }}>
                                  {mon.khuyenMai.giaGiam.toLocaleString()} đ
                                </div>
                                <div style={{ textDecoration: "line-through", color: "gray", fontSize: "15px" }}>
                                  {mon.gia.toLocaleString()} đ
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: "30px" ,color: "gray"}}>{mon.gia.toLocaleString()} đ</div>
                            )}
                          </div>

                          {mon.moTa && (
                            <p className="product-description">{mon.moTa}</p>
                          )}
                          
                          <button 
                            className="buy-btn"
                            onClick={() => navigate(`/chi-tiet-mon-an/${mon.id}`)}
                          >
                            XEM CHI TIẾT
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  !loading && (
                    <div className="no-results">
                      <i className="fas fa-search"></i>
                      <h3>Không tìm thấy món ăn nào</h3>
                      <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                    </div>
                  )
                )}
              </div>

              {/* Hiển thị số lượng kết quả */}
              {dsMonAn.length > 0 && (
                <div className="results-info">
                  <p>Hiển thị {dsMonAn.length} món ăn</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuMonAn;