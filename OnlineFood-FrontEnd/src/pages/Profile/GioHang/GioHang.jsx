import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./GioHang.css";

const GioHang = () => {
  const navigate = useNavigate();

  const [gioHang, setGioHang] = useState([]);
  const [thongKe, setThongKe] = useState({
    tongTien: 0,
    tongTietKiem: 0,
    soLuongMonAn: 0,
    tongSoLuong: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set()); 

  const nguoiDungId = localStorage.getItem("idNguoiDung");
  const debounceTimers = useRef({}); 

  // Tính giá thực tế cho món ăn (giống như ThanhToan)
  const tinhGiaThucTe = (monAn) => {
    if (monAn?.khuyenMai?.giaGiam && monAn.khuyenMai.giaGiam > 0) {
      return monAn.khuyenMai.giaGiam;
    }
    return monAn?.gia || 0;
  };

  const calculateThongKe = useCallback((gioHangData) => {
    return {
      tongTien: gioHangData.reduce((sum, item) => {
        const gia = tinhGiaThucTe(item.monAn);
        return sum + (gia * item.soLuong);
      }, 0),
      tongTietKiem: gioHangData.reduce((sum, item) => sum + (item.tietKiem || 0), 0),
      soLuongMonAn: gioHangData.length,
      tongSoLuong: gioHangData.reduce((sum, item) => sum + item.soLuong, 0)
    };
  }, []);

  const fetchGioHang = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const gioHangRes = await axios.get(`/gio-hang/${nguoiDungId}`);
      const gioHangData = Array.isArray(gioHangRes.data) ? gioHangRes.data : [];
      
      // Đảm bảo dữ liệu monAn đầy đủ cho mỗi item
      const processedData = gioHangData.map(item => ({
        ...item,
        id: item.id || `${item.monAnId}-${Date.now()}`, // Đảm bảo có ID duy nhất
        monAnId: item.monAnId || item.monAn?.id,
        monAn: {
          ...item.monAn,
          id: item.monAn?.id || item.monAnId,
          tenMonAn: item.monAn?.tenMonAn || "Món ăn",
          gia: item.monAn?.gia || item.monAn?.giaHienThi || 0,
          hinhAnhMonAns: item.monAn?.hinhAnhMonAns || 
            (item.monAn?.hinhAnhUrl ? [{ duongDan: item.monAn.hinhAnhUrl }] : []),
          khuyenMai: item.monAn?.khuyenMai || null
        }
      }));
      
      setGioHang(processedData);
      setThongKe(calculateThongKe(processedData));

    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
      setError("Không thể tải giỏ hàng");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [nguoiDungId, calculateThongKe]);

  const updateQuantityOptimistic = (itemId, newQuantity) => {
    setGioHang(prevGioHang => {
      const newGioHang = prevGioHang.map(item => {
        if (item.id === itemId) {
          const gia = tinhGiaThucTe(item.monAn);
          const updatedItem = { 
            ...item, 
            soLuong: newQuantity,
            thanhTien: gia * newQuantity,
            tietKiem: (item.monAn?.soTienGiam || 0) * newQuantity
          };
          return updatedItem;
        }
        return item;
      });
      
      setThongKe(calculateThongKe(newGioHang));
      return newGioHang;
    });
  };

  const debouncedApiCall = (itemId, apiCall, delay = 300) => {
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId]);
    }
    
    debounceTimers.current[itemId] = setTimeout(async () => {
      setUpdatingItems(prev => new Set([...prev, itemId]));
      try {
        await apiCall();
        await fetchGioHang(true);
      } catch (err) {
        console.error("Lỗi khi cập nhật:", err);
        await fetchGioHang(true);
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    }, delay);
  };

  useEffect(() => {
    if (!nguoiDungId) {
      setError("Chưa đăng nhập");
      setLoading(false);
      return;
    }
    fetchGioHang();
  }, [nguoiDungId, fetchGioHang]);

  const handleRemove = async (id) => {
    const itemToRemove = gioHang.find(item => item.id === id);
    if (!itemToRemove) return;

    const newGioHang = gioHang.filter(item => item.id !== id);
    setGioHang(newGioHang);
    setThongKe(calculateThongKe(newGioHang));

    try {
      await axios.delete(`/gio-hang/${nguoiDungId}/remove/${id}`);
    } catch (err) {
      console.error("Lỗi khi xóa item:", err);
      await fetchGioHang(true);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tất cả món trong giỏ hàng?")) {
      return;
    }

    setGioHang([]);
    setThongKe({ tongTien: 0, tongTietKiem: 0, soLuongMonAn: 0, tongSoLuong: 0 });

    try {
      await axios.delete(`/gio-hang/${nguoiDungId}/clear`);
    } catch (err) {
      console.error("Lỗi khi xóa tất cả:", err);
      await fetchGioHang(true);
    }
  };

  const handleIncrease = (id) => {
    const currentItem = gioHang.find(item => item.id === id);
    if (!currentItem) return;

    const newQuantity = currentItem.soLuong + 1;
    updateQuantityOptimistic(id, newQuantity);
    debouncedApiCall(id, () => axios.put(`/gio-hang/${nguoiDungId}/increase/${id}`));
  };

  const handleDecrease = (id) => {
    const currentItem = gioHang.find(item => item.id === id);
    if (!currentItem || currentItem.soLuong <= 1) return;

    const newQuantity = currentItem.soLuong - 1;
    updateQuantityOptimistic(id, newQuantity);
    debouncedApiCall(id, () => axios.put(`/gio-hang/${nguoiDungId}/decrease/${id}`));
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const currentItem = gioHang.find(item => item.id === id);
    if (!currentItem || currentItem.soLuong === newQuantity) return;

    updateQuantityOptimistic(id, newQuantity);
    debouncedApiCall(id, () => 
      axios.put(`/gio-hang/${nguoiDungId}/update-quantity/${id}`, {
        soLuong: newQuantity,
      }), 500
    );
  };

  const handleDatHang = () => {
    // Validate dữ liệu trước khi chuyển trang
    if (!gioHang || gioHang.length === 0) {
      alert("Giỏ hàng trống, không thể đặt hàng");
      return;
    }

    // Đảm bảo mọi món đều có đầy đủ thông tin cần thiết
    const isValidData = gioHang.every(item => 
      item.monAnId && 
      item.monAn && 
      item.monAn.tenMonAn && 
      item.soLuong > 0 &&
      (item.monAn.gia > 0 || (item.monAn.khuyenMai && item.monAn.khuyenMai.giaGiam > 0))
    );

    if (!isValidData) {
      alert("Có lỗi với dữ liệu giỏ hàng, vui lòng tải lại trang");
      return;
    }

    // Chuẩn bị dữ liệu gửi đến trang thanh toán
    const dataToSend = {
      gioHang: gioHang.map(item => ({
        id: item.id,
        monAnId: item.monAnId,
        soLuong: item.soLuong,
        thanhTien: tinhGiaThucTe(item.monAn) * item.soLuong,
        tietKiem: item.tietKiem || 0,
        monAn: {
          id: item.monAn.id,
          tenMonAn: item.monAn.tenMonAn,
          gia: item.monAn.gia,
          hinhAnhMonAns: item.monAn.hinhAnhMonAns || [],
          hinhAnhUrl: item.monAn.hinhAnhUrl || null,
          khuyenMai: item.monAn.khuyenMai || null
        }
      })),
      thongKe: {
        tongTien: thongKe.tongTien,
        tongTietKiem: thongKe.tongTietKiem,
        soLuongMonAn: thongKe.soLuongMonAn,
        tongSoLuong: thongKe.tongSoLuong
      },
      // Backward compatibility - keep old structure
      tongTien: thongKe.tongTien,
      tongTietKiem: thongKe.tongTietKiem,
      soLuongMonAn: thongKe.soLuongMonAn,
      tongSoLuong: thongKe.tongSoLuong
    };

    console.log("Dữ liệu gửi đến trang thanh toán:", dataToSend);
    navigate("/pay", { state: dataToSend });
  };

  if (loading) return <div className="loading">Đang tải giỏ hàng...</div>;

  if (error) {
    return (
      <div className="gio-hang-container">
        <h2>🛒 Giỏ hàng của bạn</h2>
        <p style={{ color: "red" }}>{error}</p>
        {error === "Chưa đăng nhập" && (
          <button onClick={() => window.location.href = "/login"}>
            Đăng nhập
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="gio-hang-container">
      <h2>🛒 Giỏ hàng của bạn</h2>

      {gioHang.length === 0 ? (
        <div className="gio-hang-empty">
          <p>Không có món nào trong giỏ hàng.</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate("/menu")}
          >
            Đi đặt món ngay
          </button>
        </div>
      ) : (
        <>
          <div className="gio-hang-summary">
            <div className="summary-item">
              <span>Số loại món:</span>
              <span>{thongKe.soLuongMonAn}</span>
            </div>
            <div className="summary-item">
              <span>Tổng số lượng:</span>
              <span>{thongKe.tongSoLuong}</span>
            </div>
            {thongKe.tongTietKiem > 0 && (
              <div className="summary-item savings">
                <span>Tiết kiệm được:</span>
                <span>-{thongKe.tongTietKiem.toLocaleString()}₫</span>
              </div>
            )}
          </div>

          <table className="gio-hang-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên món</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Tiết kiệm</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {gioHang.map((item) => {
                const giaThucTe = tinhGiaThucTe(item.monAn);
                return (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.monAn?.hinhAnhMonAns?.[0]?.duongDan || item.monAn?.hinhAnhUrl || "/default.jpg"}
                        alt={item.monAn?.tenMonAn}
                        className="gio-hang-img"
                      />
                    </td>
                    
                    <td>
                      <div className="mon-an-info">
                        <span className="ten-mon">{item.monAn?.tenMonAn || "N/A"}</span>
                        {item.monAn?.khuyenMai && (
                          <span className="khuyen-mai-badge">
                            Khuyến mãi
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <div className="gia-info">
                        <span className="gia-hien-tai">
                          {giaThucTe.toLocaleString()}₫
                        </span>
                        {item.monAn?.khuyenMai && item.monAn?.gia > giaThucTe && (
                          <span className="gia-goc">
                            {item.monAn.gia.toLocaleString()}₫
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <div className="quantity-controls">
                        <button
                          className="btn-quantity"
                          onClick={() => handleDecrease(item.id)}
                          disabled={item.soLuong <= 1 || updatingItems.has(item.id)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.soLuong}
                          onChange={(e) =>
                            handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                          }
                          className={`quantity-input ${updatingItems.has(item.id) ? 'updating' : ''}`}
                          min="1"
                          disabled={updatingItems.has(item.id)}
                        />
                        <button
                          className="btn-quantity"
                          onClick={() => handleIncrease(item.id)}
                          disabled={updatingItems.has(item.id)}
                        >
                          +
                        </button>
                        {updatingItems.has(item.id) && (
                          <div className="quantity-updating">
                            <span className="spinner"></span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <span className="thanh-tien">
                        {(giaThucTe * item.soLuong).toLocaleString()}₫
                      </span>
                    </td>
                    
                    <td>
                      {item.tietKiem > 0 ? (
                        <span className="tiet-kiem">
                          -{item.tietKiem.toLocaleString()}₫
                        </span>
                      ) : (
                        <span className="no-saving">-</span>
                      )}
                    </td>
                    
                    <td>
                      <button
                        className="btn-xoa"
                        onClick={() => handleRemove(item.id)}
                        title="Xóa khỏi giỏ hàng"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="gio-hang-footer">
            <div className="tong-ket">
              <div className="tong-tien-section">
                {thongKe.tongTietKiem > 0 && (
                  <div className="tiet-kiem-tong">
                    <span>💰 Tổng tiết kiệm: </span>
                    <span className="so-tien-tiet-kiem">
                      -{thongKe.tongTietKiem.toLocaleString()}₫
                    </span>
                  </div>
                )}
                
                <div className="tong-thanh-toan">
                  <span>Tổng thanh toán: </span>
                  <span className="so-tien-tong">
                    {thongKe.tongTien.toLocaleString()}₫
                  </span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="btn-xoa-all" 
                  onClick={handleClear}
                  title="Xóa tất cả món trong giỏ hàng"
                >
                  Xóa tất cả
                </button>
                <button 
                  className="btn-dat-hang" 
                  onClick={handleDatHang}
                  disabled={gioHang.length === 0}
                >
                  Đặt hàng ({thongKe.soLuongMonAn} món)
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GioHang;