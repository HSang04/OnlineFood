package com.ths.onlinefood.dto;

import com.ths.onlinefood.model.DanhMuc;
import com.ths.onlinefood.model.HinhAnhMonAn;
import lombok.Data;
import java.util.List;

@Data
public class MonAnDTO {
    private Long id;
    private String tenMonAn;
    private double gia; // Giá gốc
    private String moTa;
    private int trangThai;
    private DanhMuc danhMuc;
    private List<Long> keptImageIds;
    
    // Thông tin hình ảnh
    private List<HinhAnhMonAn> hinhAnhMonAns;
    
    // Thông tin về khuyến mãi
    private double giaKhuyenMai; // Giá sau khi áp dụng khuyến mãi (giá thực tế cần thanh toán)
    private boolean coKhuyenMai; // Có đang được khuyến mãi không
    private int phanTramGiamGia; // Phần trăm giảm giá (0-100)
    
    /**
     * Phương thức tiện ích để lấy giá hiển thị chính
     * @return giá cần hiển thị (có thể là giá khuyến mãi hoặc giá gốc)
     */
    public double getGiaHienThi() {
        return coKhuyenMai ? giaKhuyenMai : gia;
    }
    
    /**
     * Phương thức tiện ích để lấy số tiền tiết kiệm được
     * @return số tiền tiết kiệm được nhờ khuyến mãi
     */
    public double getSoTienTietKiem() {
        return coKhuyenMai ? (gia - giaKhuyenMai) : 0;
    }
}