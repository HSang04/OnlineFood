package com.ths.onlinefood.service;

import com.ths.onlinefood.model.HoaDon;
import com.ths.onlinefood.model.DonHang;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.repository.HoaDonRepository;
import com.ths.onlinefood.repository.DonHangRepository;
import com.ths.onlinefood.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HoaDonService {
    
    private final HoaDonRepository hoaDonRepository;
    private final DonHangRepository donHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    
    public List<HoaDon> getAll() {
        return hoaDonRepository.findAll();
    }
    
   public Optional<HoaDon> getById(Long id) {
        return hoaDonRepository.findByIdWithDetails(id);
    }

    public Optional<HoaDon> getByDonHangId(Long donHangId) {
        return hoaDonRepository.findByDonHangIdWithDetails(donHangId);
    }
   
    @Transactional
    public HoaDon taoHoaDonTuDonHang(Long donHangId, String phuongThucThanhToan, String maGiaoDich) {
        try {
            System.out.println("=== Bắt đầu tạo hóa đơn ===");
            System.out.println("Đơn hàng ID: " + donHangId);
            System.out.println("Phương thức thanh toán: " + phuongThucThanhToan);
            System.out.println("Mã giao dịch: " + maGiaoDich);
            
            // Lấy thông tin đơn hàng
            DonHang donHang = donHangRepository.findById(donHangId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + donHangId));
            
            System.out.println("Tìm thấy đơn hàng - Tổng tiền: " + donHang.getTongTien());
            
            // Kiểm tra xem đơn hàng đã có hóa đơn chưa
            Optional<HoaDon> existingHoaDon = hoaDonRepository.findByDonHangId(donHangId);
            if (existingHoaDon.isPresent()) {
                System.out.println("Đơn hàng đã có hóa đơn ID: " + existingHoaDon.get().getId());
                throw new RuntimeException("Đơn hàng đã có hóa đơn");
            }
            
            
            NguoiDung nguoiDung = donHang.getNguoiDung();
            if (nguoiDung == null) {
                throw new RuntimeException("Không tìm thấy người dùng cho đơn hàng");
            }
            
            System.out.println("Người dùng: " + nguoiDung.getHoTen());
            System.out.println("SĐT: " + nguoiDung.getSoDienThoai());
            
            // Tạo hóa đơn mới
            HoaDon hoaDon = new HoaDon();
            hoaDon.setDonHang(donHang);
            
           
            hoaDon.setHoTen(nguoiDung.getHoTen());
            hoaDon.setDiaChi(donHang.getDiaChiGiaoHang());
            hoaDon.setSoDienThoai(nguoiDung.getSoDienThoai());
            
           
            Double tongTien = donHang.getTongTien();
            if (tongTien == null || tongTien <= 0) {
                throw new RuntimeException("Tổng tiền đơn hàng không hợp lệ: " + tongTien);
            }
            hoaDon.setTongTien(tongTien); 
            
            hoaDon.setPhuongThuc(phuongThucThanhToan);
            hoaDon.setThoiGianThanhToan(new Date());
            
            // Trạng thái tùy theo phương thức thanh toán
            if ("COD".equals(phuongThucThanhToan)) {
                hoaDon.setTrangThai("CHUA_THANH_TOAN"); // COD chưa thanh toán
            } else {
                hoaDon.setTrangThai("DA_THANH_TOAN"); // VNPay đã thanh toán
            }
            
            hoaDon.setMaGD(maGiaoDich);
            
            // Lưu hóa đơn
            HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
            
            System.out.println("=== Tạo hóa đơn thành công ===");
            System.out.println("ID hóa đơn: " + savedHoaDon.getId());
            System.out.println("Tổng tiền: " + savedHoaDon.getTongTien());
            System.out.println("Trạng thái: " + savedHoaDon.getTrangThai());
            System.out.println("============================");
            
            return savedHoaDon;
            
        } catch (Exception e) {
            System.err.println("LỖI khi tạo hóa đơn: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể tạo hóa đơn: " + e.getMessage());
        }
    }
    
    public HoaDon taoHoaDonCOD(Long donHangId) {
        String maGiaoDichCOD = "COD_" + System.currentTimeMillis() + "_" + donHangId;
        return taoHoaDonTuDonHang(donHangId, "COD", maGiaoDichCOD);
    }
  
    public HoaDon taoHoaDonVNPay(Long donHangId, String vnpTransactionNo) {
        if (vnpTransactionNo == null || vnpTransactionNo.trim().isEmpty()) {
            throw new RuntimeException("Mã giao dịch VNPay không được để trống");
        }
        return taoHoaDonTuDonHang(donHangId, "VNPAY", vnpTransactionNo);
    }
    
    public HoaDon create(HoaDon hoaDon) {
        hoaDon.setThoiGianThanhToan(new Date());
        return hoaDonRepository.save(hoaDon);
    }
    
    public HoaDon update(Long id, HoaDon newHoaDon) {
        return hoaDonRepository.findById(id).map(hd -> {
            hd.setHoTen(newHoaDon.getHoTen());
            hd.setDiaChi(newHoaDon.getDiaChi());
            hd.setSoDienThoai(newHoaDon.getSoDienThoai());
            hd.setPhuongThuc(newHoaDon.getPhuongThuc());
            hd.setThoiGianThanhToan(newHoaDon.getThoiGianThanhToan());
            hd.setTrangThai(newHoaDon.getTrangThai());
            hd.setMaGD(newHoaDon.getMaGD());
            
            // ✅ FIX: Cập nhật tổng tiền đúng cách
            if (newHoaDon.getTongTien() != null && newHoaDon.getTongTien() > 0) {
                hd.setTongTien(newHoaDon.getTongTien());
            }
            
            return hoaDonRepository.save(hd);
        }).orElse(null);
    }
    
    @Transactional
    public void capNhatThanhToanCOD(Long hoaDonId) {
        try {
            HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với ID: " + hoaDonId));
            
            if ("COD".equals(hoaDon.getPhuongThuc()) && "CHUA_THANH_TOAN".equals(hoaDon.getTrangThai())) {
                hoaDon.setTrangThai("DA_THANH_TOAN");
                hoaDon.setThoiGianThanhToan(new Date());
                hoaDonRepository.save(hoaDon);
                
                System.out.println("Đã cập nhật trạng thái thanh toán COD cho hóa đơn: " + hoaDonId);
            } else {
                System.out.println("Hóa đơn không phải COD hoặc đã thanh toán: " + hoaDonId);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi cập nhật COD: " + e.getMessage());
            throw new RuntimeException("Không thể cập nhật trạng thái thanh toán: " + e.getMessage());
        }
    }
    
    public boolean delete(Long id) {
        if (!hoaDonRepository.existsById(id)) return false;
        hoaDonRepository.deleteById(id);
        return true;
    }
}