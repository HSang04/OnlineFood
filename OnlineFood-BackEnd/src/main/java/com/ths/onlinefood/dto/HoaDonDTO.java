
package com.ths.onlinefood.dto;


import lombok.Data;
import java.util.Date;

@Data
public class HoaDonDTO {
    private Long id;
    private String hoTen;
    private String diaChi;
    private String soDienThoai;
    private Double tongTien;
    private String phuongThuc;
    private Date thoiGianThanhToan;
    private String trangThai;
    private String maGD;
    private DonHangDTO donHang;
}