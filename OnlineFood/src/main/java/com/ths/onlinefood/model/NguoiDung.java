package com.ths.onlinefood.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "nguoi_dung")
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Type.UUID sinh random id k trung lap
    private Long id;

    private String hoTen;
    private String email;
    private String matKhau;
    private String soDienThoai;
    private String diaChi;

    @Enumerated(EnumType.STRING)
    private USER_ROLE vaiTro;

    private LocalDateTime ngayTao;
}
