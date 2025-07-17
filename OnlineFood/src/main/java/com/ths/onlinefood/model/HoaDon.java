package com.ths.onlinefood.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "hoa_don")
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_nguoi_dung")
    private NguoiDung nguoiDung;

    @OneToOne
    @JoinColumn(name = "id_don_hang")
    private DonHang donHang;

    private String phuongThuc; 

    private Date thoiGianThanhToan;

    private String trangThai;

    private String maGD; // Mã giao dịch từ cổng thanh toán (nếu có)
}
