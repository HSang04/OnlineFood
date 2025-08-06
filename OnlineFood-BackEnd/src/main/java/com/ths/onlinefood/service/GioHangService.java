package com.ths.onlinefood.service;

import com.ths.onlinefood.dto.GioHangDTO;
import com.ths.onlinefood.model.GioHang;
import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.repository.GioHangRepository;
import com.ths.onlinefood.repository.MonAnRepository;
import com.ths.onlinefood.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GioHangService {
    
    private final GioHangRepository gioHangRepo;
    private final MonAnRepository monAnRepo;
    private final NguoiDungRepository nguoiDungRepo;
    private final MonAnService monAnService;

    public List<GioHangDTO> getGioHangByNguoiDungId(Long nguoiDungId) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        List<GioHang> gioHangList = gioHangRepo.findByNguoiDung(nguoiDung);
        
        return gioHangList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GioHangDTO addToCart(Long nguoiDungId, Long monAnId, Integer soLuong) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        MonAn monAn = monAnRepo.findById(monAnId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));

        if (monAn.getTrangThai() != 1) {
            throw new RuntimeException("Món ăn đã ngừng bán");
        }

        GioHang item = gioHangRepo.findByNguoiDungAndMonAn_Id(nguoiDung, monAnId)
                .map(existing -> {
                    existing.setSoLuong(existing.getSoLuong() + soLuong);
                    return existing;
                })
                .orElse(GioHang.builder()
                        .nguoiDung(nguoiDung)
                        .monAn(monAn)
                        .soLuong(soLuong)
                        .build());

        return convertToDTO(gioHangRepo.save(item));
    }

    public GioHangDTO increaseQuantity(Long nguoiDungId, Long gioHangId) {
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        item.setSoLuong(item.getSoLuong() + 1);
        return convertToDTO(gioHangRepo.save(item));
    }

    public GioHangDTO decreaseQuantity(Long nguoiDungId, Long gioHangId) {
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        if (item.getSoLuong() <= 1) {
            throw new RuntimeException("Số lượng không thể nhỏ hơn 1");
        }
        item.setSoLuong(item.getSoLuong() - 1);
        return convertToDTO(gioHangRepo.save(item));
    }

    public GioHangDTO updateQuantity(Long nguoiDungId, Long gioHangId, Integer soLuong) {
        if (soLuong < 1) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        item.setSoLuong(soLuong);
        return convertToDTO(gioHangRepo.save(item));
    }

    public void removeFromCart(Long nguoiDungId, Long gioHangId) {
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        gioHangRepo.delete(item);
    }

    public void clearCart(Long nguoiDungId) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        gioHangRepo.deleteAllByNguoiDung(nguoiDung);
    }

  
    public double getTongTienGioHang(Long nguoiDungId) {
        return getGioHangByNguoiDungId(nguoiDungId)
                .stream()
                .mapToDouble(GioHangDTO::getThanhTien)
                .sum();
    }

   
    public double getTongTietKiem(Long nguoiDungId) {
        return getGioHangByNguoiDungId(nguoiDungId)
                .stream()
                .mapToDouble(GioHangDTO::getTietKiem)
                .sum();
    }

  
    public GioHangThongKeDTO getThongKeGioHang(Long nguoiDungId) {
        List<GioHangDTO> gioHang = getGioHangByNguoiDungId(nguoiDungId);
        
        double tongTien = gioHang.stream().mapToDouble(GioHangDTO::getThanhTien).sum();
        double tongTietKiem = gioHang.stream().mapToDouble(GioHangDTO::getTietKiem).sum();
        int soLuongMonAn = gioHang.size();
        int tongSoLuong = gioHang.stream().mapToInt(GioHangDTO::getSoLuong).sum();
        
        return new GioHangThongKeDTO(tongTien, tongTietKiem, soLuongMonAn, tongSoLuong);
    }

    private GioHang validateGioHangAccess(Long nguoiDungId, Long gioHangId) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        GioHang item = gioHangRepo.findById(gioHangId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục giỏ hàng"));
        
        if (!item.getNguoiDung().getId().equals(nguoiDung.getId())) {
            throw new RuntimeException("Không có quyền truy cập mục này");
        }
        
        return item;
    }

  
    private GioHangDTO convertToDTO(GioHang gioHang) {
        MonAn monAn = gioHang.getMonAn();
        
     
        if (monAn.getHinhAnhMonAns() != null) {
            monAn.getHinhAnhMonAns().size();
        }
        
       
        double giaHienThi = monAnService.getGiaBan(monAn);
        boolean coKhuyenMai = monAnService.isOnSale(monAn);
        int phanTramGiamGia = monAnService.getPhanTramGiamGia(monAn);
        double soTienGiam = coKhuyenMai ? (monAn.getGia() - giaHienThi) : 0;
        
        
        double thanhTien = giaHienThi * gioHang.getSoLuong();
        double tietKiem = soTienGiam * gioHang.getSoLuong();
        
      
        GioHangDTO.MonAnGioHangDTO monAnDTO = new GioHangDTO.MonAnGioHangDTO();
        monAnDTO.setId(monAn.getId());
        monAnDTO.setTenMonAn(monAn.getTenMonAn());
        monAnDTO.setGiaGoc(monAn.getGia());
        monAnDTO.setGiaHienThi(giaHienThi);
        monAnDTO.setMoTa(monAn.getMoTa());
        monAnDTO.setTrangThai(monAn.getTrangThai());
        monAnDTO.setCoKhuyenMai(coKhuyenMai);
        monAnDTO.setPhanTramGiamGia(phanTramGiamGia);
        monAnDTO.setSoTienGiam(soTienGiam);
        
    
        if (monAn.getHinhAnhMonAns() != null && !monAn.getHinhAnhMonAns().isEmpty()) {
            monAnDTO.setHinhAnhUrl(monAn.getHinhAnhMonAns().get(0).getDuongDan());
            monAnDTO.setTatCaHinhAnh(monAn.getHinhAnhMonAns());
        }
        
     
        GioHangDTO dto = new GioHangDTO();
        dto.setId(gioHang.getId());
        dto.setNguoiDungId(gioHang.getNguoiDung().getId());
        dto.setSoLuong(gioHang.getSoLuong());
        dto.setMonAn(monAnDTO);
        dto.setThanhTien(thanhTien);
        dto.setTietKiem(tietKiem);
        
        return dto;
    }

   
    public static class GioHangThongKeDTO {
        private double tongTien;
        private double tongTietKiem;
        private int soLuongMonAn;
        private int tongSoLuong;

        public GioHangThongKeDTO(double tongTien, double tongTietKiem, int soLuongMonAn, int tongSoLuong) {
            this.tongTien = tongTien;
            this.tongTietKiem = tongTietKiem;
            this.soLuongMonAn = soLuongMonAn;
            this.tongSoLuong = tongSoLuong;
        }

       
        public double getTongTien() { return tongTien; }
        public void setTongTien(double tongTien) { this.tongTien = tongTien; }
        
        public double getTongTietKiem() { return tongTietKiem; }
        public void setTongTietKiem(double tongTietKiem) { this.tongTietKiem = tongTietKiem; }
        
        public int getSoLuongMonAn() { return soLuongMonAn; }
        public void setSoLuongMonAn(int soLuongMonAn) { this.soLuongMonAn = soLuongMonAn; }
        
        public int getTongSoLuong() { return tongSoLuong; }
        public void setTongSoLuong(int tongSoLuong) { this.tongSoLuong = tongSoLuong; }
    }
}