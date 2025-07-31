/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ths.onlinefood.dto;

import com.ths.onlinefood.model.DanhMuc;
import lombok.Data;

import java.util.List;

@Data
public class MonAnDTO {
    private String tenMonAn;
    private double gia;
    private String moTa;
    private int trangThai;
    private DanhMuc danhMuc;
    private List<Long> keptImageIds;
}