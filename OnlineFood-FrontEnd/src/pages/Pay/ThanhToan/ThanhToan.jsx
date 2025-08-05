import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../services/axiosInstance";
import "./ThanhToan.css";

const ThanhToan = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [diaChi, setDiaChi] = useState("");
  const [diaChiCu, setDiaChiCu] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [giamGia, setGiamGia] = useState(0);
  const [tongTien, setTongTien] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nguoiDungId = localStorage.getItem("idNguoiDung");
  const jwt = localStorage.getItem("jwt");


  const gioHang = state?.gioHang || [];
  const tongTienGoc = state?.tongTien || 0;

 
  useEffect(() => {
    setTongTien(tongTienGoc);
  }, [tongTienGoc]);


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
  }, [nguoiDungId]);


  if (!state || !state.gioHang || !state.tongTien) {
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


  const tinhGiaThucTe = (monAn) => {
    if (monAn?.khuyenMai?.giaGiam && monAn.khuyenMai.giaGiam > 0) {
      return monAn.khuyenMai.giaGiam;
    }
    return monAn?.gia || 0;
  };


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

 
      if (tongTienGoc < voucherInfo.giaToiThieu) {
        setError(`Voucher chỉ áp dụng cho đơn từ ${voucherInfo.giaToiThieu.toLocaleString()}₫`);
        setLoading(false);
        return;
      }

      let giam = 0;
      if (voucherInfo.loai === "PHAN_TRAM") {
        giam = Math.min((voucherInfo.giaTri / 100) * tongTienGoc, voucherInfo.giaTriToiDa || tongTienGoc);
      } else if (voucherInfo.loai === "TIEN_MAT") {
        giam = voucherInfo.giaTri;
      }

     
      giam = Math.min(giam, tongTienGoc);

      setVoucherData(voucherInfo);
      setGiamGia(giam);
      setTongTien(tongTienGoc - giam);
      setError("");
      alert("Áp dụng voucher thành công!");

    } catch (err) {
      console.error("Lỗi khi kiểm tra voucher:", err);
      setError("Mã voucher không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };


  const handleRemoveVoucher = () => {
    setVoucher("");
    setVoucherData(null);
    setGiamGia(0);
    setTongTien(tongTienGoc);
    setError("");
  };

  const handleDatHang = async () => {
    if (!diaChi.trim()) {
      alert("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
      return;
    }

    try {
      setLoading(true);
      
     
      const donHangData = {
        nguoiDungId: parseInt(nguoiDungId),
        diaChiGiaoHang: diaChi,
        tongTien: tongTien,
        tongTienGoc: tongTienGoc,
        giamGia: giamGia,
        voucherId: voucherData?.id || null,
        chiTietDonHang: gioHang.map(item => ({
          monAnId: item.monAnId,
          soLuong: item.soLuong,
          gia: tinhGiaThucTe(item.monAn),
          thanhTien: item.soLuong * tinhGiaThucTe(item.monAn)
        }))
      };

      
      const response = await axios.post('/don-hang/dat-hang', donHangData);
      
      if (response.data) {
        alert("Đặt hàng thành công!");
       
        await axios.delete(`/gio-hang/${nguoiDungId}/clear`);
        
        navigate('/', { 
          state: { 
            donHangId: response.data.id,
            tongTien: tongTien 
          } 
        });
      }
      
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="thanh-toan-container">
      <h2 className="page-title">🧾 Xác nhận thanh toán</h2>

  
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
                    src={item.monAn?.hinhAnhMonAns?.[0]?.duongDan || "/default.jpg"}
                    alt={item.monAn?.tenMonAn}
                    className="product-image"
                  />
                  <div className="product-details">
                    <div className="product-name">{item.monAn?.tenMonAn}</div>
                    <div className="product-price-quantity">
                      {giaThucTe.toLocaleString()}₫ x {item.soLuong}
                    </div>
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
                <strong>Sử dụng địa chỉ đã lưu:</strong>
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
            <strong>Nhập địa chỉ mới:</strong>
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