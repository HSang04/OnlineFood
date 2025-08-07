import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../services/axiosInstance";
import "./QuanLyDonHang.css";

const QuanLyDonHang = () => {
  const [donHangs, setDonHangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const jwt = localStorage.getItem("jwt");

 
  const ORDER_STATUS = {
    DANG_XU_LY: "DANG_XU_LY",
    DANG_LAM: "DANG_LAM", 
    DANG_GIAO: "DANG_GIAO",
    HOAN_THANH: "HOAN_THANH",
    DA_HUY: "DA_HUY"
  };

  const STATUS_LABELS = {
    "Đang xử lý": "Đang xử lý",
    "Đang làm": "Đang làm",
    "Đang giao": "Đang giao", 
    "Hoàn thành": "Hoàn thành",
    "Đã hủy": "Đã hủy",
    [ORDER_STATUS.DANG_XU_LY]: "Đang xử lý",
    [ORDER_STATUS.DANG_LAM]: "Đang làm",
    [ORDER_STATUS.DANG_GIAO]: "Đang giao",
    [ORDER_STATUS.HOAN_THANH]: "Hoàn thành",
    [ORDER_STATUS.DA_HUY]: "Đã hủy"
  };

  const STATUS_COLORS = {
    "Đang xử lý": "#ffa500",
    "Đang làm": "#2196f3", 
    "Đang giao": "#9c27b0",
    "Hoàn thành": "#4caf50",
    "Đã hủy": "#f44336",
    [ORDER_STATUS.DANG_XU_LY]: "#ffa500",
    [ORDER_STATUS.DANG_LAM]: "#2196f3",
    [ORDER_STATUS.DANG_GIAO]: "#9c27b0",
    [ORDER_STATUS.HOAN_THANH]: "#4caf50",
    [ORDER_STATUS.DA_HUY]: "#f44336"
  };

 
  const fetchDonHangs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/don-hang", {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      if (response.data) {
        
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.ngayTao) - new Date(a.ngayTao)
        );
        setDonHangs(sortedOrders);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [jwt]);

 
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingDetails(true);
      console.log("Đang lấy chi tiết đơn hàng:", orderId);
      
      const response = await axios.get(`/chi-tiet-don-hang/don-hang/${orderId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      console.log("Chi tiết đơn hàng nhận được:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        
        const chiTietList = response.data;
        const donHangInfo = chiTietList.length > 0 ? chiTietList[0].donHang : null;
        
        if (!donHangInfo) {
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }
        
        
        const processedChiTiet = chiTietList.map(item => ({
          ...item,
          monAnId: item.monAn?.id || item.monAnId,
          gia: item.donGia || item.gia, 
          thanhTien: (item.donGia || item.gia || 0) * (item.soLuong || 0)
        }));
        
     
        const completeOrder = {
          ...donHangInfo,
          chiTietDonHang: processedChiTiet,
          tongTienGoc: processedChiTiet.reduce((sum, item) => 
            sum + (item.thanhTien || 0), 0
          )
        };
        
        console.log("Đơn hàng sau khi xử lý:", completeOrder);
        setSelectedOrder(completeOrder);
      } else {
        console.warn("API trả về dữ liệu không đúng định dạng");
      
        const orderFromList = donHangs.find(order => order.id === orderId);
        if (orderFromList) {
          setSelectedOrder(orderFromList);
          console.log("Sử dụng dữ liệu từ danh sách:", orderFromList);
        } else {
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      
    
      const orderFromList = donHangs.find(order => order.id === orderId);
      if (orderFromList) {
        setSelectedOrder(orderFromList);
        console.log("API lỗi, sử dụng dữ liệu từ danh sách:", orderFromList);
      } else {
        alert("Không thể tải chi tiết đơn hàng. Vui lòng thử lại!");
        setSelectedOrder(null);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (jwt) {
      fetchDonHangs();
    }
  }, [fetchDonHangs, jwt]);

  
  const normalizeStatus = (status) => {
    const statusMap = {
      "Đang xử lý": "dang_xu_ly",
      "Đang làm": "dang_lam",
      "Đang giao": "dang_giao", 
      "Hoàn thành": "hoan_thanh",
      "Đã hủy": "da_huy"
    };
    return statusMap[status] || status.toLowerCase().replace(/\s+/g, '_');
  };

 
  const filteredOrders = donHangs.filter(order => {
    const normalizedStatus = normalizeStatus(order.trangThai);
    const matchesFilter = filter === "all" || normalizedStatus === filter;
    const matchesSearch = searchTerm === "" || 
      order.id.toString().includes(searchTerm) ||
      order.nguoiDung?.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.nguoiDung?.tenNguoiDung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.diaChiGiaoHang?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  
  const getOrderCountByStatus = (status) => {
    if (status === "all") return donHangs.length;
    return donHangs.filter(order => normalizeStatus(order.trangThai) === status).length;
  };


  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      
      
      const response = await axios.patch(`/don-hang/trang-thai/${orderId}`, {
        trangThai: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data) {
        
        setDonHangs(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, trangThai: newStatus }
            : order
        ));
        
     
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, trangThai: newStatus }));
        }
        
        alert(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      
     
      if (err.response?.status === 400) {
        alert("Trạng thái không hợp lệ. Vui lòng thử lại!");
      } else if (err.response?.status === 404) {
        alert("Không tìm thấy đơn hàng. Vui lòng làm mới trang!");
      } else {
        alert("Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại!");
      }
    } finally {
      setUpdating(false);
    }
  };

 
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

 
  const getTimeElapsed = (orderDate) => {
    const now = new Date();
    const created = new Date(orderDate);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    return `${diffMins} phút trước`;
  };

 
  const openOrderModal = async (order) => {
    setShowModal(true);
    await fetchOrderDetails(order.id);
  };


  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="quan-ly-don-hang-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quan-ly-don-hang-container">
        <div className="error-container">
          <h2> Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button onClick={fetchDonHangs} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quan-ly-don-hang-container">
      <header className="page-header">
        <h1 className="page-title">📋 Quản lý đơn hàng</h1>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-number">{donHangs.length}</span>
            <span className="stat-label">Tổng đơn</span>
          </div>
          <div className="stat-card processing">
            <span className="stat-number">
              {getOrderCountByStatus("dang_xu_ly")}
            </span>
            <span className="stat-label">Đang xử lý</span>
          </div>
          <div className="stat-card preparing">
            <span className="stat-number">
              {getOrderCountByStatus("dang_lam")}
            </span>
            <span className="stat-label">Đang làm</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-number">
              {getOrderCountByStatus("hoan_thanh")}
            </span>
            <span className="stat-label">Hoàn thành</span>
          </div>
        </div>
      </header>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng, địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon"></span>
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({getOrderCountByStatus("all")})
          </button>
          <button 
            className={`filter-tab ${filter === "dang_xu_ly" ? "active" : ""}`}
            onClick={() => setFilter("dang_xu_ly")}
          >
            Đang xử lý ({getOrderCountByStatus("dang_xu_ly")})
          </button>
          <button 
            className={`filter-tab ${filter === "dang_lam" ? "active" : ""}`}
            onClick={() => setFilter("dang_lam")}
          >
            Đang làm ({getOrderCountByStatus("dang_lam")})
          </button>
          <button 
            className={`filter-tab ${filter === "hoan_thanh" ? "active" : ""}`}
            onClick={() => setFilter("hoan_thanh")}
          >
            Hoàn thành ({getOrderCountByStatus("hoan_thanh")})
          </button>
        </div>
      </div>

      <div className="orders-section">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>📭 Không có đơn hàng nào</h3>
            <p>
              {searchTerm ? "Không tìm thấy đơn hàng phù hợp với từ khóa tìm kiếm." : "Chưa có đơn hàng nào trong hệ thống."}
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <strong>Đơn hàng #{order.id}</strong>
                    <span className="order-time">{getTimeElapsed(order.ngayTao)}</span>
                  </div>
                  <div 
                    className="order-status"
                    style={{ backgroundColor: STATUS_COLORS[order.trangThai] }}
                  >
                    {STATUS_LABELS[order.trangThai]}
                  </div>
                </div>

                <div className="order-customer">
                  <div className="customer-info">
                    <span className="customer-icon">👤</span>
                    <div>
                      <div className="customer-name">
                        {order.nguoiDung?.hoTen || order.nguoiDung?.tenNguoiDung || "N/A"}
                      </div>
                      <div className="customer-phone">
                        {order.nguoiDung?.soDienThoai || order.nguoiDung?.sdt || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-address">
                  <span className="address-icon">📍</span>
                  <span className="address-text">
                    {order.diaChiGiaoHang || order.nguoiDung?.diaChi || "Chưa có địa chỉ"}
                  </span>
                </div>

                <div className="order-summary">
                  <div className="items-count">
                     Thành tiền:
                  </div>
                  <div className="order-total">
                    {order.tongTien?.toLocaleString() || "0"}₫
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    className="btn-view-details"
                    onClick={() => openOrderModal(order)}
                  >
                    Chi tiết
                  </button>
                  
                  {order.trangThai === "DANG_XU_LY" && (
                    <button 
                      className="btn-accept"
                      onClick={() => updateOrderStatus(order.id, "DANG_LAM")}
                      disabled={updating}
                    >
                      Nhận đơn
                    </button>
                  )}
                  
                  {order.trangThai === "DANG_LAM" && (
                    <button 
                      className="btn-delivering"
                      onClick={() => updateOrderStatus(order.id, "DANG_GIAO")}
                      disabled={updating}
                    >
                      Bắt đầu giao
                    </button>
                  )}
                  
                  {order.trangThai === "DANG_GIAO" && (
                    <button 
                      className="btn-complete"
                      onClick={() => updateOrderStatus(order.id, "HOAN_THANH")}
                      disabled={updating}
                    >
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

     
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder?.id || "..."}</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {loadingDetails ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Đang tải chi tiết đơn hàng...</p>
                </div>
              ) : selectedOrder ? (
                <>
                  <div className="detail-section">
                    <h3>Thông tin khách hàng</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Tên:</span>
                        <span>{selectedOrder.nguoiDung?.hoTen || selectedOrder.nguoiDung?.tenNguoiDung || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">SĐT:</span>
                        <span>{selectedOrder.nguoiDung?.soDienThoai || selectedOrder.nguoiDung?.sdt || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Email:</span>
                        <span>{selectedOrder.nguoiDung?.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Thông tin giao hàng</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Địa chỉ nhận hàng:</span>
                        <span>{selectedOrder.diaChiGiaoHang || selectedOrder.nguoiDung?.diaChi || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Thời gian đặt:</span>
                        <span>{formatDateTime(selectedOrder.ngayTao)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Ghi chú:</span>
                        <span>{selectedOrder.ghiChu || "Không có ghi chú"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Chi tiết món ăn</h3>
                    {selectedOrder.chiTietDonHang && selectedOrder.chiTietDonHang.length > 0 ? (
                      <div className="items-list">
                        {selectedOrder.chiTietDonHang.map((item, index) => (
                          <div key={index} className="item-row">
                            <div className="item-info">
                              {item.monAn?.hinhAnhMonAns?.length > 0 ? (
                                    <img
                                        src={item.monAn.hinhAnhMonAns[0].duongDan}
                                        alt={item.monAn?.tenMonAn || "Món ăn"}
                                        className="item-image"
                                    />
                                    ) : (
                                    <div className="item-no-image">Chưa có ảnh</div>
                                    )}
                              <div className="item-details">
                                <div className="item-name">{item.monAn?.tenMonAn || `Món ăn ID: ${item.monAnId}`}</div>
                                <div className="item-price">
                                  {(item.gia || item.donGia)?.toLocaleString() || "0"}₫ x {item.soLuong || 0}
                                </div>
                                {item.monAn?.khuyenMai && (
                                  <div className="item-discount">
                                    Khuyến mãi: -{item.monAn.khuyenMai.giaGiam?.toLocaleString()}₫
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="item-total">
                              {item.thanhTien?.toLocaleString() || ((item.gia || item.donGia || 0) * (item.soLuong || 0))?.toLocaleString() || "0"}₫
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-items">
                        <p>⚠️ Không có thông tin chi tiết món ăn</p>
                        <p className="note">Dữ liệu chi tiết món ăn chưa được load từ server</p>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Tổng kết</h3>
                    <div className="summary-rows">
                      <div className="summary-row">
                        <span>Tạm tính:</span>
                        <span>{selectedOrder.tongTienGoc?.toLocaleString() || selectedOrder.tongTien?.toLocaleString() || "0"}₫</span>
                      </div>
                      {selectedOrder.giamGia > 0 && (
                        <div className="summary-row discount">
                          <span>Giảm giá:</span>
                          <span>-{selectedOrder.giamGia?.toLocaleString()}₫</span>
                        </div>
                      )}
                      {selectedOrder.voucher && (
                        <div className="summary-row discount">
                          <span>Voucher ({selectedOrder.voucher.maVoucher}):</span>
                          <span>{selectedOrder.voucher.moTa}</span>
                        </div>
                      )}
                      <div className="summary-row total">
                        <span>Tổng cộng:</span>
                        <span>{selectedOrder.tongTien?.toLocaleString() || "0"}₫</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    {selectedOrder.trangThai === "DANG_XU_LY" && (
                      <button 
                        className="btn-modal-accept"
                        onClick={() => updateOrderStatus(selectedOrder.id, "DANG_LAM")}
                        disabled={updating}
                      >
                        {updating ? "Đang xử lý..." : "Nhận đơn hàng"}
                      </button>
                    )}
                    
                    {selectedOrder.trangThai === "DANG_LAM" && (
                      <button 
                        className="btn-modal-delivering"
                        onClick={() => updateOrderStatus(selectedOrder.id, "DANG_GIAO")}
                        disabled={updating}
                      >
                        {updating ? "Đang xử lý..." : "Bắt đầu giao hàng"}
                      </button>
                    )}
                    
                    {selectedOrder.trangThai === "DANG_GIAO" && (
                      <button 
                        className="btn-modal-complete"
                        onClick={() => updateOrderStatus(selectedOrder.id, "HOAN_THANH")}
                        disabled={updating}
                      >
                        {updating ? "Đang xử lý..." : "Hoàn thành giao hàng"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="error-container">
                  <p>Không thể tải chi tiết đơn hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyDonHang;