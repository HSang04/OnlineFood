import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from '../../../services/axiosInstance';
import './ThongKe.css';

const ThongKe = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    tuNgay: new Date().toISOString().split('T')[0],
    denNgay: new Date().toISOString().split('T')[0]
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

 
  const [dashboardData, setDashboardData] = useState(null);
  const [doanhThuData, setDoanhThuData] = useState(null);
  const [doanhThuThangData, setDoanhThuThangData] = useState(null);
  const [monBanChayData, setMonBanChayData] = useState(null);
  const [voucherData, setVoucherData] = useState(null);
  // const [comparisonData, setComparisonData] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  const jwt = localStorage.getItem('jwt');


  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/thong-ke/dashboard', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      setDashboardData(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [jwt]);


  const fetchDoanhThuTheoNgay = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/thong-ke/doanh-thu/ngay', {
        params: {
          tuNgay: dateRange.tuNgay,
          denNgay: dateRange.denNgay
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      const data = response.data;
      
      const chartData = Object.entries(data.doanhThuTheoNgay).map(([ngay, doanhThu]) => ({
        ngay,
        doanhThu,
        soDon: data.soDonTheoNgay[ngay] || 0
      }));
      setDoanhThuData({ ...data, chartData });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu doanh thu:', error);
    } finally {
      setLoading(false);
    }
  }, [jwt, dateRange]);


  const fetchDoanhThuTheoThang = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/thong-ke/doanh-thu/thang', {
        params: {
          nam: selectedYear
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      const data = response.data;
      
      const chartData = Object.entries(data.doanhThuTheoThang).map(([thang, doanhThu]) => ({
        thang,
        doanhThu,
        soDon: data.soDonTheoThang[thang] || 0
      }));
      
      setDoanhThuThangData({ ...data, chartData });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu doanh thu tháng:', error);
    } finally {
      setLoading(false);
    }
  }, [jwt, selectedYear]);


  const fetchMonBanChay = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/thong-ke/mon-an/ban-chay', {
        params: {
          tuNgay: dateRange.tuNgay,
          denNgay: dateRange.denNgay,
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      setMonBanChayData(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu món bán chạy:', error);
    } finally {
      setLoading(false);
    }
  }, [jwt, dateRange]);


  const fetchVoucherStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/thong-ke/voucher', {
        params: {
          tuNgay: dateRange.tuNgay,
          denNgay: dateRange.denNgay
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      setVoucherData(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu voucher:', error);
    } finally {
      setLoading(false);
    }
  }, [jwt, dateRange]);


  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

 
  useEffect(() => {
    switch (activeTab) {
      case 'doanhThu':
        fetchDoanhThuTheoNgay();
        break;
      case 'doanhThuThang':
        fetchDoanhThuTheoThang();
        break;
      case 'monBanChay':
        fetchMonBanChay();
        break;
      case 'voucher':
        fetchVoucherStats();
        break;
      default:
        break;
    }
  }, [activeTab, fetchDoanhThuTheoNgay, fetchDoanhThuTheoThang, fetchMonBanChay, fetchVoucherStats]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading && !dashboardData) {
    return (
      <div className="thong-ke-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="thong-ke-container">
      <header className="thong-ke-header">
        <h1> Thống kê & Báo cáo</h1>
        <div className="date-controls">
          <div className="date-range">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.tuNgay}
              onChange={(e) => setDateRange(prev => ({ ...prev, tuNgay: e.target.value }))}
            />
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.denNgay}
              onChange={(e) => setDateRange(prev => ({ ...prev, denNgay: e.target.value }))}
            />
          </div>
          <div className="year-selector">
            <label>Năm:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </header>

      <nav className="thong-ke-tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Tổng quan
        </button>
        <button
          className={`tab ${activeTab === 'doanhThu' ? 'active' : ''}`}
          onClick={() => setActiveTab('doanhThu')}
        >
          💰 Doanh thu theo ngày
        </button>
        <button
          className={`tab ${activeTab === 'doanhThuThang' ? 'active' : ''}`}
          onClick={() => setActiveTab('doanhThuThang')}
        >
          📅 Doanh thu theo tháng
        </button>
        <button
          className={`tab ${activeTab === 'monBanChay' ? 'active' : ''}`}
          onClick={() => setActiveTab('monBanChay')}
        >
          🍽️ Món bán chạy
        </button>
        <button
          className={`tab ${activeTab === 'voucher' ? 'active' : ''}`}
          onClick={() => setActiveTab('voucher')}
        >
          🎫 Voucher
        </button>
      </nav>

      <main className="thong-ke-content">
        {activeTab === 'dashboard' && dashboardData && (
          <div className="dashboard-section">
            <div className="stats-overview">
              <div className="stat-card today">
                <div className="stat-header">
                  <h3>📅 Hôm nay</h3>
                  <span className="stat-icon">💰</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatCurrency(dashboardData.tongQuan.homNay?.tongDoanhThu || 0)}
                  </div>
                  <div className="stat-details">
                    <span>{dashboardData.tongQuan.homNay?.tongSoDon || 0} đơn hàng</span>
                  </div>
                </div>
              </div>

              <div className="stat-card week">
                <div className="stat-header">
                  <h3>📈 Tuần qua</h3>
                  <span className="stat-icon">📊</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatCurrency(dashboardData.tongQuan.tuanQua?.tongDoanhThu || 0)}
                  </div>
                  <div className="stat-details">
                    <span>{dashboardData.tongQuan.tuanQua?.tongSoDon || 0} đơn hàng</span>
                    <span>TB: {formatCurrency(dashboardData.tongQuan.tuanQua?.doanhThuTrungBinh || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card month">
                <div className="stat-header">
                  <h3>📊 Tháng qua</h3>
                  <span className="stat-icon">📈</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatCurrency(dashboardData.tongQuan.thangQua?.tongDoanhThu || 0)}
                  </div>
                  <div className="stat-details">
                    <span>{dashboardData.tongQuan.thangQua?.tongSoDon || 0} đơn hàng</span>
                    <span>TB: {formatCurrency(dashboardData.tongQuan.thangQua?.doanhThuTrungBinh || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card growth">
                <div className="stat-header">
                  <h3>📈 Tăng trưởng</h3>
                  <span className="stat-icon">🎯</span>
                </div>
                <div className="stat-content">
                  <div className="stat-value growth-rate">
                    {getPercentageChange(
                      dashboardData.tongQuan.homNay?.tongDoanhThu || 0,
                      dashboardData.tongQuan.homQua?.tongDoanhThu || 0
                    )}%
                  </div>
                  <div className="stat-details">
                    <span>So với hôm qua</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-charts">
              <div className="chart-section">
                <h3>🏆 Top 5 món bán chạy (7 ngày qua)</h3>
                <div className="top-items-list">
                  {dashboardData.monBanChay?.topMonAn?.slice(0, 5).map((item, index) => (
                    <div key={index} className="top-item">
                      <div className="item-rank">#{index + 1}</div>
                      <div className="item-info">
                        <div className="item-name">{item.tenMonAn}</div>
                        <div className="item-stats">
                          Đã bán: <strong>{formatNumber(item.soLuongBan)}</strong> |
                          Doanh thu: <strong>{formatCurrency(item.doanhThu)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-section">
                <h3>📊 Trạng thái đơn hàng</h3>
                <div className="status-stats">
                  {Object.entries(dashboardData.tongQuan.thongKeTrangThai || {}).map(([status, count]) => (
                    <div key={status} className={`status-item ${status.toLowerCase()}`}>
                      <div className="status-count">{formatNumber(count)}</div>
                      <div className="status-label">
                        {status === 'DANG_XU_LY' && 'Đang xử lý'}
                        {status === 'DANG_LAM' && 'Đang làm'}
                        {status === 'DANG_GIAO' && 'Đang giao'}
                        {status === 'HOAN_THANH' && 'Hoàn thành'}
                        {status === 'DA_HUY' && 'Đã hủy'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doanhThu' && doanhThuData && (
          <div className="revenue-section">
            <div className="section-summary">
              <div className="summary-card">
                <h3>💰 Tổng doanh thu</h3>
                <div className="summary-value">
                  {formatCurrency(doanhThuData.tongDoanhThu)}
                </div>
              </div>
              <div className="summary-card">
                <h3>📦 Tổng đơn hàng</h3>
                <div className="summary-value">
                  {formatNumber(doanhThuData.tongSoDon)}
                </div>
              </div>
              <div className="summary-card">
                <h3>📈 Doanh thu TB/đơn</h3>
                <div className="summary-value">
                  {formatCurrency(doanhThuData.doanhThuTrungBinh)}
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>📊 Biểu đồ doanh thu theo ngày</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={doanhThuData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ngay" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="doanhThu" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    name="Doanh thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>📦 Số lượng đơn hàng theo ngày</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={doanhThuData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ngay" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="soDon" fill="#82ca9d" name="Số đơn hàng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'doanhThuThang' && doanhThuThangData && (
          <div className="monthly-revenue-section">
            <div className="section-summary">
              <div className="summary-card">
                <h3>💰 Tổng doanh thu năm {selectedYear}</h3>
                <div className="summary-value">
                  {formatCurrency(doanhThuThangData.tongDoanhThu)}
                </div>
              </div>
              <div className="summary-card">
                <h3>📦 Tổng đơn hàng</h3>
                <div className="summary-value">
                  {formatNumber(doanhThuThangData.tongSoDon)}
                </div>
              </div>
              <div className="summary-card">
                <h3>📊 TB tháng</h3>
                <div className="summary-value">
                  {formatCurrency(doanhThuThangData.tongDoanhThu / 12)}
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>📊 Doanh thu theo tháng năm {selectedYear}</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={doanhThuThangData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="thang" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="doanhThu" fill="#8884d8" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'monBanChay' && monBanChayData && (
          <div className="bestseller-section">
            <div className="section-summary">
              <div className="summary-card">
                <h3>🍽️ Tổng món ăn khác nhau</h3>
                <div className="summary-value">
                  {monBanChayData.soMonKhacNhau}
                </div>
              </div>
              <div className="summary-card">
                <h3>📦 Tổng số lượng bán</h3>
                <div className="summary-value">
                  {formatNumber(monBanChayData.tongSoLuongBan)}
                </div>
              </div>
              <div className="summary-card">
                <h3>💰 Doanh thu món ăn</h3>
                <div className="summary-value">
                  {formatCurrency(monBanChayData.tongDoanhThuMonAn)}
                </div>
              </div>
            </div>

            <div className="bestseller-list">
              <h3>🏆 Top món ăn bán chạy nhất</h3>
              <div className="items-table">
                <div className="table-header">
                  <div>Hạng</div>
                  <div>Tên món ăn</div>
                  <div>Số lượng bán</div>
                  <div>Doanh thu</div>
                  <div>Đơn giá TB</div>
                </div>
                {monBanChayData.topMonAn?.map((item, index) => (
                  <div key={index} className="table-row">
                    <div className="rank">#{index + 1}</div>
                    <div className="item-name">{item.tenMonAn}</div>
                    <div className="quantity">{formatNumber(item.soLuongBan)}</div>
                    <div className="revenue">{formatCurrency(item.doanhThu)}</div>
                    <div className="avg-price">{formatCurrency(item.donGiaTrungBinh)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container">
              <h3>📊 Biểu đồ tròn top 8 món bán chạy</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={monBanChayData.topMonAn?.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tenMonAn, percent }) => `${tenMonAn} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="soLuongBan"
                  >
                    {monBanChayData.topMonAn?.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'voucher' && voucherData && (
          <div className="voucher-section">
            <div className="section-summary">
              <div className="summary-card">
                <h3>🎫 Voucher khác nhau</h3>
                <div className="summary-value">
                  {voucherData.soVoucherKhacNhau}
                </div>
              </div>
              <div className="summary-card">
                <h3>🔥 Tổng lượt sử dụng</h3>
                <div className="summary-value">
                  {formatNumber(voucherData.tongLuotSuDung)}
                </div>
              </div>
              <div className="summary-card">
                <h3>💸 Tổng tiền giảm</h3>
                <div className="summary-value discount">
                  {formatCurrency(voucherData.tongTienGiam)}
                </div>
              </div>
            </div>

            <div className="voucher-list">
              <h3>📊 Thống kê voucher đã sử dụng</h3>
              <div className="voucher-table">
                <div className="table-header">
                  <div>Mã voucher</div>
                  <div>Loại</div>
                  <div>Giá trị</div>
                  <div>Lượt dùng</div>
                  <div>Tổng tiền giảm</div>
                </div>
                {voucherData.voucherData?.map((voucher, index) => (
                  <div key={index} className="table-row">
                    <div className="voucher-code">{voucher.maVoucher}</div>
                    <div className="voucher-type">
                      {voucher.loai === 'PHAN_TRAM' ? '% Giảm' : '₫ Giảm'}
                    </div>
                    <div className="voucher-value">
                      {voucher.loai === 'PHAN_TRAM' 
                        ? `${voucher.giaTri}%` 
                        : formatCurrency(voucher.giaTri)
                      }
                    </div>
                    <div className="usage-count">{formatNumber(voucher.soLuotSuDung)}</div>
                    <div className="total-discount">{formatCurrency(voucher.tongTienGiam)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}
    </div>
  );
};

export default ThongKe;