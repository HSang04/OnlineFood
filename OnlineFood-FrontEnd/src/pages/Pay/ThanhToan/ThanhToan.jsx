import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../services/axiosInstance";
import "./ThanhToan.css";

const ThanhToan = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [gioHang, setGioHang] = useState([]);
  const [tongTienGoc, setTongTienGoc] = useState(0); // Tổng tiền gốc (chưa giảm)
  const [diaChi, setDiaChi] = useState("");
  const [diaChiCu, setDiaChiCu] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [giamGia, setGiamGia] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nguoiDungId = localStorage.getItem("idNguoiDung");
  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (state?.gioHang) {
      setGioHang(state.gioHang);
    }
    if (state?.tongTien || state?.thongKe?.tongTien) {
      setTongTienGoc(state?.tongTien || state?.thongKe?.tongTien);
    }
  }, [state]);

  const tinhGiaThucTe = useCallback((monAn) => {
    if (monAn?.khuyenMai?.giaGiam && monAn.khuyenMai.giaGiam > 0) {
      return monAn.khuyenMai.giaGiam;
    }
    return monAn?.gia || 0;
  }, []);

  // Tính tổng tiền gốc từ giỏ hàng nếu chưa có
  useEffect(() => {
    if (tongTienGoc === 0 && gioHang.length > 0) {
      const calculatedTotal = gioHang.reduce((sum, item) => {
        const gia = tinhGiaThucTe(item.monAn);
        return sum + (gia * item.soLuong);
      }, 0);
      setTongTienGoc(calculatedTotal);
    }
  }, [gioHang, tinhGiaThucTe, tongTienGoc]);

  useEffect(() => {
    const fetchDiaChiCu = async () => {
      try {
        const res = await axios.get(`/nguoi-dung/${nguoiDungId}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        const diaChiCuData = res.data?.diaChi || "";
        setDiaChiCu(diaChiCuData);
        setDiaChi(diaChiCuData); 
      } catch (err) {
        console.error("Lỗi khi lấy địa chỉ:", err);
      }
    };
    
    if (nguoiDungId) {
      fetchDiaChiCu();
    }
  }, [nguoiDungId, jwt]);

  if (!state || !gioHang || gioHang.length === 0) {
    return (
      <div className="thanh-toan-container">
        <div className="error-container">
          <h2>⚠️ Không có dữ liệu đơn hàng</h2>
          <p>Vui lòng quay lại giỏ hàng và thử lại.</p>
          <button 
            className="btn-back-to-cart" 
            onClick={() => navigate("/gio-hang")}
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  const hasValidItems = gioHang.every(item => 
    item.monAnId && 
    item.monAn && 
    item.monAn.tenMonAn && 
    item.soLuong > 0 &&
    (item.monAn.gia > 0 || (item.monAn.khuyenMai && item.monAn.khuyenMai.giaGiam > 0))
  );

  if (!hasValidItems) {
    return (
      <div className="thanh-toan-container">
        <div className="error-container">
          <h2>⚠️ Dữ liệu giỏ hàng không hợp lệ</h2>
          <p>Có lỗi với dữ liệu giỏ hàng. Vui lòng quay lại và thử lại.</p>
          <button 
            className="btn-back-to-cart" 
            onClick={() => navigate("/gio-hang")}
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  const handleCheckVoucher = async () => {
    if (!voucher.trim()) {
      setError("Vui lòng nhập mã voucher");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Gọi API với tổng tiền để backend kiểm tra và tính toán
      const res = await axios.get(`/vouchers/find`, {
        params: {
          ma: voucher,
          tongTien: tongTienGoc
        }
      });

      const data = res.data;

      // Backend đã kiểm tra tất cả, chỉ cần dùng kết quả
      if (data.valid) {
        setVoucherData(data.voucher);
        setGiamGia(data.discountAmount || 0);
        setError("");
        alert("Áp dụng voucher thành công!");
      } else {
        setError(data.message);
      }

    } catch (err) {
      console.error("Lỗi khi kiểm tra voucher:", err);
      
      if (err.response?.status === 400) {
        // Lỗi validation từ backend
        const errorData = err.response.data;
        setError(errorData.message || "Mã voucher không hợp lệ!");
      } else {
        setError("Có lỗi xảy ra khi kiểm tra voucher!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucher("");
    setVoucherData(null);
    setGiamGia(0);
    setError("");
  };

  // Tính tổng tiền cuối cùng
  const tongTienCuoi = tongTienGoc - giamGia;

  const handleDatHang = async () => {
    if (!diaChi.trim()) {
      alert("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
      return;
    }

    setLoading(true);

    try {
      console.log("Đang kiểm tra khoảng cách giao hàng...");
      const distanceRes = await axios.get("/khoang-cach/dia-chi", {
        params: { diaChi: diaChi },
      });

      if (!distanceRes.data || distanceRes.data.khoangCach_km === undefined) {
        alert("Không thể xác định khoảng cách giao hàng. Vui lòng kiểm tra lại địa chỉ.");
        setLoading(false);
        return;
      }

      const khoangCach = distanceRes.data.khoangCach_km;
      console.log(`Khoảng cách: ${khoangCach} km`);

      if (khoangCach > 20) {
        alert(
          `Rất tiếc, địa chỉ của quý khách (cách ${khoangCach.toFixed(1)} km) nằm ngoài phạm vi giao hàng của chúng tôi.\n\n` +
          "Để đảm bảo chất lượng và độ tươi ngon tốt nhất của thực phẩm, chúng tôi chỉ phục vụ trong bán kính 20km.\n\n" +
          "Xin quý khách vui lòng thông cảm và cân nhắc đặt hàng tại địa chỉ gần hơn!"
        );
        setLoading(false);
        return;
      }

      const confirmOrder = window.confirm(
        `Xác nhận đặt hàng:\n\n` +
        `• Địa chỉ giao hàng: ${diaChi}\n` +
        `• Khoảng cách: ${khoangCach.toFixed(1)} km\n` +
        `• Thời gian giao hàng dự kiến: ${Math.ceil(khoangCach * 2 + 20)} phút\n` +
        `${ghiChu.trim() ? `• Ghi chú: ${ghiChu}\n` : ''}` +
        `• Tổng tiền: ${tongTienCuoi.toLocaleString()}₫\n\n` +
        `Bạn có muốn tiếp tục đặt hàng không?`
      );

      if (!confirmOrder) {
        setLoading(false);
        return;
      }

      const donHangData = {
        nguoiDungId: parseInt(nguoiDungId),
        diaChiGiaoHang: diaChi,
        ghiChu: ghiChu.trim() || null,
        tongTien: tongTienCuoi, // Tổng tiền sau khi giảm
        tongTienGoc: tongTienGoc, // Tổng tiền gốc
        giamGia: giamGia,
        voucherId: voucherData?.id || null,
        khoangCach: khoangCach,
        chiTietDonHang: gioHang.map(item => ({
          monAnId: item.monAnId,
          soLuong: item.soLuong,
          gia: tinhGiaThucTe(item.monAn),
          thanhTien: item.soLuong * tinhGiaThucTe(item.monAn)
        }))
      };

      console.log("Dữ liệu đặt hàng:", donHangData);
      
      const response = await axios.post('/don-hang/dat-hang', donHangData);
      
      if (response.data) {
        alert("Đặt hàng thành công!");
        
        // Xóa giỏ hàng
        try {
          await axios.delete(`/gio-hang/${nguoiDungId}/clear`);
        } catch (clearError) {
          console.error("Lỗi khi xóa giỏ hàng:", clearError);
        }
        
        navigate('/', { 
          state: { 
            donHangId: response.data.id,
            tongTien: tongTienCuoi 
          } 
        });
      }
      
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes("khoảng cách")) {
        alert("Lỗi khi tính khoảng cách giao hàng. Vui lòng kiểm tra lại địa chỉ.");
      } else {
        const errorMessage = err.response?.data?.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="thanh-toan-container">
      <h2 className="page-title">🧾 Xác nhận thanh toán</h2>

      {/* Product List Section */}
      <div className="section">
        <h3 className="section-title">Sản phẩm đã chọn</h3>
        <div className="product-list">
          {gioHang.map((item) => {
            const giaThucTe = tinhGiaThucTe(item.monAn);
            const thanhTien = item.soLuong * giaThucTe;
            
            return (
              <div key={item.id} className="product-item">
                <div className="product-info">
                  <img 
                    src={item.monAn?.hinhAnhMonAns?.[0]?.duongDan || item.monAn?.hinhAnhUrl || "/default.jpg"}
                    alt={item.monAn?.tenMonAn}
                    className="product-image"
                  />
                  <div className="product-details">
                    <div className="product-name">{item.monAn?.tenMonAn}</div>
                    <div className="product-price-quantity">
                      {giaThucTe.toLocaleString()}₫ x {item.soLuong}
                    </div>
                    {item.monAn?.khuyenMai && (
                      <div className="discount-badge">Có khuyến mãi</div>
                    )}
                  </div>
                </div>
                <div className="item-total">
                  {thanhTien.toLocaleString()}₫
                </div>
              </div>
            );
          })}
          
          <div className="subtotal">
            <span>Tạm tính:</span>
            <span>{tongTienGoc.toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="section">
        <h3 className="section-title">Địa chỉ nhận hàng</h3>
        <div className="address-section">
          {diaChiCu && (
            <label className="address-option">
              <input
                type="radio"
                name="diaChi"
                value={diaChiCu}
                onChange={(e) => setDiaChi(e.target.value)}
                checked={diaChi === diaChiCu}
                className="radio-input"
              />
              <div className="address-label">
                <span>Sử dụng địa chỉ mặc định:</span>
                <span className="saved-address">{diaChiCu}</span>
              </div>
            </label>
          )}
          
          <label className="address-option">
            <input
              type="radio"
              name="diaChi"
              value="new"
              onChange={() => setDiaChi("")}
              checked={diaChi !== diaChiCu}
              className="radio-input"
            />
            <span>Nhập địa chỉ mới:</span>
          </label>
          
          <input
            type="text"
            value={diaChi !== diaChiCu ? diaChi : ""}
            onChange={(e) => setDiaChi(e.target.value)}
            placeholder="Nhập địa chỉ giao hàng mới"
            disabled={diaChi === diaChiCu}
            className={`address-input ${diaChi === diaChiCu ? 'disabled' : ''}`}
          />
        </div>
      </div>

      {/* Note Section */}
      <div className="section">
        <h3 className="section-title">📝 Ghi chú đơn hàng</h3>
        <div className="note-section">
          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
            className="note-textarea"
            maxLength={500}
            rows={4}
          />
        </div>
      </div>

      {/* Delivery Note Section */}
      <div className="section">
        <h3 className="section-title">📦 Thông tin giao hàng</h3>
        <div className="delivery-info">
          <div className="delivery-note">
            <div className="note-item">
              <span className="note-icon">🚚</span>
              <span>Phạm vi giao hàng: Trong bán kính 20km từ cửa hàng</span>
            </div>
            <div className="note-item">
              <span className="note-icon">⏰</span>
              <span>Thời gian giao hàng: Từ 30-60 phút tùy khoảng cách</span>
            </div>
            <div className="note-item">
              <span className="note-icon">💡</span>
              <span>Khoảng cách và thời gian giao hàng sẽ được tính toán khi đặt hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Section */}
      <div className="section">
        <h3 className="section-title">Mã giảm giá</h3>
        <div className="voucher-section">
          <div className="voucher-input-group">
            <input
              type="text"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="voucher-input"
              disabled={loading}
            />
            <button 
              onClick={handleCheckVoucher}
              disabled={loading || !voucher.trim()}
              className="btn-apply-voucher"
            >
              {loading ? "Đang kiểm tra..." : "Áp dụng"}
            </button>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {voucherData && (
            <div className="voucher-applied">
              <div className="voucher-info">
                <span className="voucher-name">✅ {voucherData.maVoucher}</span>
                <span className="voucher-discount">-{giamGia.toLocaleString()}₫</span>
              </div>
              <button 
                onClick={handleRemoveVoucher}
                className="btn-remove-voucher"
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Total and Order Section */}
      <div className="section">
        <div className="total-section">
          <div className="total-row">
            <span>Tạm tính:</span>
            <span>{tongTienGoc.toLocaleString()}₫</span>
          </div>
          
          {giamGia > 0 && (
            <div className="total-row discount">
              <span>Giảm giá:</span>
              <span>-{giamGia.toLocaleString()}₫</span>
            </div>
          )}
          
          <div className="total-row final-total">
            <span>Tổng cộng:</span>
            <span>{tongTienCuoi.toLocaleString()}₫</span>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate("/gio-hang")}
            className="btn-back"
          >
            Quay lại giỏ hàng
          </button>
          <button 
            onClick={handleDatHang}
            disabled={loading || !diaChi.trim()}
            className="btn-order"
            title={
              loading 
                ? "Đang xử lý..." 
                : !diaChi.trim()
                  ? "Vui lòng chọn địa chỉ giao hàng"
                  : "Xác nhận đặt hàng"
            }
          >
            {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThanhToan;