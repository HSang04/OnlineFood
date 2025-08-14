package com.ths.onlinefood.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DonHangDTO {
    private Long id;
    private LocalDateTime ngayTao;
    private String trangThai; // TrangThaiDonHang_ENUM dưới dạng String
    private Double tongTien;

    private Long nguoiDungId; // Thay vì full object NguoiDung
    private Long voucherId;   // Thay vì full object Voucher
    
    private String diaChiGiaoHang;
    private String ghiChu;
}
