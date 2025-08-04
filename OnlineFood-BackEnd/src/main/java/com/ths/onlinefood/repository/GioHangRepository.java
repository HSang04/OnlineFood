package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.GioHang;
import com.ths.onlinefood.model.NguoiDung;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;

public interface GioHangRepository extends JpaRepository<GioHang, Long> {
    List<GioHang> findByNguoiDung(NguoiDung nguoiDung);
    Optional<GioHang> findByNguoiDungAndMonAn_Id(NguoiDung nguoiDung, Long monAnId);
//    void deleteByNguoiDung(NguoiDung nguoiDung);
    
    @Transactional
    @Modifying
    void deleteAllByNguoiDung(NguoiDung nguoiDung);
}
