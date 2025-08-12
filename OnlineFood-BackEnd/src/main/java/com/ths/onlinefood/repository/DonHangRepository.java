package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.DonHang;
import com.ths.onlinefood.model.NguoiDung;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonHangRepository extends JpaRepository<DonHang, Long> {
    
     List<DonHang> findByNguoiDungOrderByNgayTaoDesc(NguoiDung nguoiDung);
  
    List<DonHang> findByNguoiDung_IdOrderByNgayTaoDesc(Long nguoiDungId);
}

