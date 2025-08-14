package com.ths.onlinefood.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChiTietDonHangDTO {
    private Long id;
    private String tenMonAn;
    private Integer soLuong;
    private Double gia;
    private Double thanhTien;
}