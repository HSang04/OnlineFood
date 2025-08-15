import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../services/axiosInstance';
import './HoaDon.css';

const HoaDon = () => {
  const { donHangId } = useParams();
  const navigate = useNavigate();
  const [hoaDon, setHoaDon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHoaDon = async () => {
      try {
        const response = await axios.get(`/hoa-don/don-hang/${donHangId}`);
        setHoaDon(response.data);
      } catch (err) {
        console.error('Lỗi khi tải hóa đơn:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy hóa đơn cho đơn hàng này');
        } else {
          setError('Có lỗi xảy ra khi tải hóa đơn');
        }
      } finally {
        setLoading(false);
      }
    };

    if (donHangId) {
      fetchHoaDon();
    }
  }, [donHangId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dt = new Date(dateString);
    if (isNaN(dt)) return "";
    return dt.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPhuongThucText = (phuongThuc) => {
    switch (phuongThuc) {
      case 'COD':
        return 'Tiền mặt khi nhận hàng';
      case 'VNPAY':
        return 'Thanh toán VNPay';
      default:
        return phuongThuc;
    }
  };

  const getTrangThaiThanhToan = (trangThai) => {
    switch (trangThai) {
      case 'DA_THANH_TOAN':
        return 'Đã thanh toán';
      case 'CHUA_THANH_TOAN':
        return 'Chưa thanh toán';
      case 'HUY':
        return 'Đã hủy';
      default:
        return trangThai;
    }
  };

  const calculateThanhTien = (item) => {
    return item.donGia * item.soLuong;
  };

  const calculateGiamGia = () => {
    if (!hoaDon?.donHang?.chiTietDonHang) return 0;
    
    let tongGiaGoc = 0;
    hoaDon.donHang.chiTietDonHang.forEach(item => {
      const giaGoc = item.monAn?.gia || 0;
      tongGiaGoc += giaGoc * item.soLuong;
    });
    
    return tongGiaGoc - hoaDon.tongTien;
  };

  if (loading) return <div className="loading">Đang tải hóa đơn...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  if (!hoaDon) return <div className="error">📋 Không tìm thấy hóa đơn</div>;

  const giamGia = calculateGiamGia();

  return (
    <div className="hoa-don-container">
      <div className="hoa-don-content">
  
        <div className="invoice-header">
          <h1 className="invoice-title">HÓA ĐƠN ĐIỆN TỬ</h1>
          <p>OU Food</p>
          <p> 40E Ngô Đức Kế, Phường Sài Gòn, TP.HCM | 📞 1900 2403</p>
        </div>

        <div className="invoice-info">
          <div>
            <strong>Số hóa đơn:</strong> #{hoaDon.id}<br/>
            <strong>Ngày tạo:</strong> {formatDate(hoaDon.thoiGianThanhToan)}
          </div>
          <div>
            <strong>Mã giao dịch:</strong> {hoaDon.maGD || 'N/A'}<br/>
            <strong>Phương thức:</strong> {getPhuongThucText(hoaDon.phuongThuc)}
          </div>
        </div>

      
        <div className="invoice-details">
          <h4>Thông tin khách hàng</h4>
          <div className="detail-row">
            <span> Họ tên:</span>
            <span>{hoaDon.hoTen}</span>
          </div>
          <div className="detail-row">
            <span> Số điện thoại:</span>
            <span>{hoaDon.soDienThoai}</span>
          </div>
          <div className="detail-row">
            <span> Địa chỉ giao hàng:</span>
            <span>{hoaDon.diaChi}</span>
          </div>
        </div>

       
        <div className="invoice-details">
          <h4>Thông tin đơn hàng</h4>
          <div className="detail-row">
            <span> Mã đơn hàng:</span>
            <span>#{hoaDon.donHang.id}</span>
          </div>
          <div className="detail-row">
            <span>📅 Ngày đặt hàng:</span>
            <span>{formatDate(hoaDon.donHang.ngayTao)}</span>
          </div>
        </div>

     
        <div className="invoice-details">
          <h4>Chi tiết đơn hàng</h4>
          <table className="order-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên món ăn</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {hoaDon.donHang.chiTietDonHang?.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.monAn?.tenMonAn || 'N/A'}</td>
                  <td>{item.soLuong}</td>
                  <td>{item.donGia?.toLocaleString()}₫</td>
                  <td>{calculateThanhTien(item)?.toLocaleString()}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       
        <div className="total-section">
          <div className="detail-row">
            <span>Tạm tính:</span>
            <span>{(hoaDon.tongTien + giamGia).toLocaleString()}₫</span>
          </div>
          {giamGia > 0 && (
            <div className="detail-row">
              <span>Giảm giá:</span>
              <span style={{ color: '#e74c3c' }}>-{giamGia.toLocaleString()}₫</span>
            </div>
          )}
          <div className="detail-row total-amount">
            <span> Tổng tiền thanh toán:</span>
            <span>{hoaDon.tongTien.toLocaleString()}₫</span>
          </div>
          <div className="detail-row">
            <span>Trạng thái thanh toán:</span>
            <span>{getTrangThaiThanhToan(hoaDon.trangThai)}</span>
          </div>
          <div className="detail-row">
            <span> Thời gian thanh toán:</span>
            <span>{formatDate(hoaDon.thoiGianThanhToan)}</span>
          </div>
        </div>

     
        <div className="invoice-footer">
          <p><strong>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</strong></p>
          <p>Hóa đơn được tạo tự động bởi hệ thống - {new Date().toLocaleString('vi-VN')}</p>
        </div>

      
        <div className="action-buttons no-print">
          <button onClick={handlePrint} className="print-button">
             In hóa đơn
          </button>
          <button onClick={() => navigate('/lich-su-giao-dich')} className="secondary-button">
             Xem đơn hàng
          </button>
          <button onClick={() => navigate('/')} className="primary-button">
             Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoaDon;