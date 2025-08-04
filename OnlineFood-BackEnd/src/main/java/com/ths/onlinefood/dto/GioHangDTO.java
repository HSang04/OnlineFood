package com.ths.onlinefood.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GioHangDTO {
    private Long id;
    private Long monAnId;
    private Long nguoiDungId;
    private Integer soLuong;
}
