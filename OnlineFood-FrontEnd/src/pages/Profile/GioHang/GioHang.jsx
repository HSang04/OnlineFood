import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./GioHang.css";

const GioHang = () => {

  const navigate = useNavigate();

  const [gioHang, setGioHang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nguoiDungId = localStorage.getItem("idNguoiDung");


  // Function tính giá thực tế (có tính khuyến mãi)
  const tinhGiaThucTe = (monAn) => {
    if (monAn?.khuyenMai?.giaGiam && monAn.khuyenMai.giaGiam > 0) {
      return monAn.khuyenMai.giaGiam;
    }
    return monAn?.gia || 0;
  };

const fetchGioHang = useCallback(async () => {
  try {
    const res = await axios.get(`/gio-hang/${nguoiDungId}`);
    const gioHangData = Array.isArray(res.data) ? res.data : res.data?.gioHang || [];

    // Fetch thông tin chi tiết của mỗi món ăn từ monAnId
    const monAnPromises = gioHangData.map(item =>
      axios.get(`/mon-an/${item.monAnId}`).then(res => res.data)
    );
    const monAnList = await Promise.all(monAnPromises);

    // Gộp dữ liệu món ăn vào mỗi item giỏ hàng
    const merged = gioHangData.map((item, index) => ({
      ...item,
      monAn: monAnList[index]
    }));

    setGioHang(merged);
  } catch (err) {
    console.error("Lỗi khi tải giỏ hàng:", err);
    setError("Không thể tải giỏ hàng");
  } finally {
    setLoading(false);
  }
}, [nguoiDungId]);


  useEffect(() => {
    if (!nguoiDungId) {
      setError("Chưa đăng nhập");
      setLoading(false);
      return;
    }
    fetchGioHang();
  }, [nguoiDungId, fetchGioHang]);

  const handleRemove = async (id) => {
    try {
      await axios.delete(`/gio-hang/${nguoiDungId}/remove/${id}`);
      fetchGioHang();
    } catch (err) {
      console.error("Lỗi khi xóa item:", err);
    }
  };

  const handleClear = async () => {
    try {
      console.log("Xóa giỏ hàng cho người dùng:", nguoiDungId);
      await axios.delete(`/gio-hang/${nguoiDungId}/clear`);
      
      fetchGioHang();
    } catch (err) {
      console.error("Lỗi khi xóa tất cả:", err);
    }
  };

  const handleIncrease = async (id) => {
    try {
      await axios.put(`/gio-hang/${nguoiDungId}/increase/${id}`);
      fetchGioHang();
    } catch (err) {
      console.error("Lỗi khi tăng số lượng:", err);
    }
  };

  const handleDecrease = async (id) => {
    try {
      await axios.put(`/gio-hang/${nguoiDungId}/decrease/${id}`);
      fetchGioHang();
    } catch (err) {
      console.error("Lỗi khi giảm số lượng:", err);
    }
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`/gio-hang/${nguoiDungId}/update-quantity/${id}`, {
        soLuong: newQuantity,
      });
      fetchGioHang();
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
    }
  };

  const handleDatHang = () => {
    const tongTien = tinhTong();
    const data = {
      gioHang,
      tongTien,
    };

    navigate("/pay", { state: data });
  };


  
  const tinhTong = () => {
    return gioHang.reduce((sum, item) => {
      const giaThucTe = tinhGiaThucTe(item.monAn);
      const soLuong = item.soLuong || 1;
      return sum + giaThucTe * soLuong;
    }, 0);
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;

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
        <p>Không có món nào trong giỏ hàng.</p>
      ) : (
        <>
          <table className="gio-hang-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên món</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {gioHang.map((item) => {
                const giaThucTe = tinhGiaThucTe(item.monAn);
                const soLuong = item.soLuong || 1;

                return (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.monAn?.hinhAnhMonAns?.[0]?.duongDan || "/default.jpg"}
                        alt={item.monAn?.tenMonAn}
                        className="gio-hang-img"
                      />
                    </td>
                    <td>{item.monAn?.tenMonAn || "N/A"}</td>
                    <td>
                      {/* Hiển thị giá có khuyến mãi */}
                      {item.monAn?.khuyenMai?.giaGiam ? (
                        <div>
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            {item.monAn.khuyenMai.giaGiam.toLocaleString()}₫
                          </span>
                          <br />
                          <span style={{ textDecoration: "line-through", color: "gray", fontSize: "12px" }}>
                            {item.monAn.gia.toLocaleString()}₫
                          </span>
                        </div>
                      ) : (
                        <span>{giaThucTe.toLocaleString()}₫</span>
                      )}
                    </td>
                    <td>
                      <div className="quantity-controls">
                        <button
                          className="btn-quantity"
                          onClick={() => handleDecrease(item.id)}
                          disabled={soLuong <= 1}
                        >−</button>
                        <input
                          type="number"
                          value={soLuong}
                          onChange={(e) =>
                            handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                          }
                          className="quantity-input"
                          min="1"
                        />
                        <button
                          className="btn-quantity"
                          onClick={() => handleIncrease(item.id)}
                        >+</button>
                      </div>
                    </td>
                    <td>{(giaThucTe * soLuong).toLocaleString()}₫</td>
                    <td>
                      <button
                        className="btn-xoa"
                        onClick={() => handleRemove(item.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="gio-hang-footer">
            <h3>Tổng cộng: {tinhTong().toLocaleString()}₫</h3>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-xoa-all" onClick={handleClear}>
                Xóa tất cả
              </button>
              <button className="btn-dat-hang" onClick={handleDatHang}>
                Đặt hàng
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default GioHang;