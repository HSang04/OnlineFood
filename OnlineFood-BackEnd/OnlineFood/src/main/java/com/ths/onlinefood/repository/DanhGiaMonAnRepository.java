package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.DanhGiaMonAn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaMonAnRepository extends JpaRepository<DanhGiaMonAn, Long> {
    List<DanhGiaMonAn> findByMonAnId(Long idMonAn);
    List<DanhGiaMonAn> findByNguoiDungId(Long idNguoiDung);
}
