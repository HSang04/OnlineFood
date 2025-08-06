import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../services/axiosInstance";
import "./ThanhToan.css";

const ThanhToan = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [gioHang, setGioHang] = useState([]);
  const [tongTienGoc, setTongTienGoc] = useState(0);
  const [diaChi, setDiaChi] = useState("");
  const [diaChiCu, setDiaChiCu] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [giamGia, setGiamGia] = useState(0);
  const [tongTien, setTongTien] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [khoangCach, setKhoangCach] = useState(null);

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

  useEffect(() => {
    if (tongTienGoc > 0) {
      setTongTien(tongTienGoc);
    } else if (gioHang.length > 0) {
   
      const calculatedTotal = gioHang.reduce((sum, item) => {
        const gia = tinhGiaThucTe(item.monAn);
        return sum + (gia * item.soLuong);
      }, 0);
      setTongTien(calculatedTotal);
    }
  }, [tongTienGoc, gioHang, tinhGiaThucTe]);


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
      const res = await axios.get(`/vouchers/find?ma=${voucher}`);
      const voucherInfo = res.data;

      if (!voucherInfo) {
        setError("Mã voucher không tồn tại!");
        setLoading(false);
        return;
      }

      if (voucherInfo.soLuong <= voucherInfo.daSuDung) {
        setError("Voucher đã hết lượt sử dụng");
        setLoading(false);
        return;
      }

      const currentTongTien = tongTienGoc || tongTien;
      if (currentTongTien < voucherInfo.giaToiThieu) {
        setError(`Voucher chỉ áp dụng cho đơn từ ${voucherInfo.giaToiThieu.toLocaleString()}₫`);
        setLoading(false);
        return;
      }

      let giam = 0;
      if (voucherInfo.loai === "PHAN_TRAM") {
        giam = Math.min((voucherInfo.giaTri / 100) * currentTongTien, voucherInfo.giaTriToiDa || currentTongTien);
      } else if (voucherInfo.loai === "TIEN_MAT") {
        giam = voucherInfo.giaTri;
      }

      giam = Math.min(giam, currentTongTien);

      setVoucherData(voucherInfo);
      setGiamGia(giam);
      setTongTien(currentTongTien - giam);
      setError("");
      alert("Áp dụng voucher thành công!");

    } catch (err) {
      console.error("Lỗi khi kiểm tra voucher:", err);
      setError("Mã voucher không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };
const handleTinhKhoangCach = async () => {
  if (!diaChi.trim()) {
    alert("Vui lòng nhập địa chỉ");
    return;
  }

  try {
   console.log( diaChi);
    const res = await axios.get("/khoang-cach/dia-chi", {
      params: { diaChi: diaChi },
    });
    console.log( res.data);

    if (res.data && res.data.khoangCach_km !== undefined) {
      setKhoangCach(res.data.khoangCach_km);
    } else {
      setKhoangCach(null);
      alert("Không thể tính khoảng cách. Vui lòng thử lại.");
    }
  } catch (err) {
    console.error("Lỗi khi tính khoảng cách:", err);
    alert("Đã xảy ra lỗi khi tính khoảng cách.");
    setKhoangCach(null);
  }
};


  const handleRemoveVoucher = () => {
    setVoucher("");
    setVoucherData(null);
    setGiamGia(0);
    setTongTien(tongTienGoc || tongTien + giamGia);
    setError("");
  };

  const handleDatHang = async () => {
    if (!diaChi.trim()) {
      alert("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
      return;
    }

    try {
      setLoading(true);
      
      const finalTongTienGoc = tongTienGoc || gioHang.reduce((sum, item) => {
        const gia = tinhGiaThucTe(item.monAn);
        return sum + (gia * item.soLuong);
      }, 0);
      
      const donHangData = {
        nguoiDungId: parseInt(nguoiDungId),
        diaChiGiaoHang: diaChi,
        tongTien: tongTien,
        tongTienGoc: finalTongTienGoc,
        giamGia: giamGia,
        voucherId: voucherData?.id || null,
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
        
        // Clear cart
        try {
          await axios.delete(`/gio-hang/${nguoiDungId}/clear`);
        } catch (clearError) {
          console.error("Lỗi khi xóa giỏ hàng:", clearError);
        }
        
        navigate('/', { 
          state: { 
            donHangId: response.data.id,
            tongTien: tongTien 
          } 
        });
      }
      
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="thanh-toan-container">
      <h2 className="page-title">🧾 Xác nhận thanh toán</h2>

      {/* Product list section */}
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
            <span>{(tongTienGoc || tongTien + giamGia).toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      {/* Address section */}
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

      <div className="distance-section">
          <button 
            className="btn-calc-distance"
            onClick={handleTinhKhoangCach}
            disabled={!diaChi.trim()}
          >
            Tính khoảng cách đến quán
          </button>

          {khoangCach !== null && (
            <p className="distance-result">
              Khoảng cách đến quán: <strong>{khoangCach.toFixed(2)} km</strong>
            </p>
          )}
        </div>


      {/* Voucher section */}
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
                <span className="voucher-name">✅ {voucherData.tenVoucher}</span>
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

      {/* Total and action buttons */}
      <div className="section">
        <div className="total-section">
          <div className="total-row">
            <span>Tạm tính:</span>
            <span>{(tongTienGoc || tongTien + giamGia).toLocaleString()}₫</span>
          </div>
          
          {giamGia > 0 && (
            <div className="total-row discount">
              <span>Giảm giá:</span>
              <span>-{giamGia.toLocaleString()}₫</span>
            </div>
          )}
          
          <div className="total-row final-total">
            <span>Tổng cộng:</span>
            <span>{tongTien.toLocaleString()}₫</span>
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
          >
            {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThanhToan;