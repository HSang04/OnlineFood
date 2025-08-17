package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.DonHang;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.model.TrangThaiDonHang_ENUM;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonHangRepository extends JpaRepository<DonHang, Long> {
    
     List<DonHang> findByNguoiDungOrderByNgayTaoDesc(NguoiDung nguoiDung);
  
    List<DonHang> findByNguoiDung_IdOrderByNgayTaoDesc(Long nguoiDungId);
    
    List<DonHang> findByNgayTaoBetweenAndTrangThaiNot(
        LocalDateTime tuNgay, 
        LocalDateTime denNgay, 
        TrangThaiDonHang_ENUM trangThai
    );

    long countByTrangThai(TrangThaiDonHang_ENUM trangThai);

    @Query("SELECT v.maVoucher, v.moTa, v.loai, v.giaTri, COUNT(d), " +
           "CASE WHEN v.loai = 'PHAN_TRAM' THEN SUM(d.tongTien * v.giaTri / 100) " +
           "ELSE SUM(v.giaTri) END " +
           "FROM DonHang d JOIN d.voucher v " +
           "WHERE d.ngayTao BETWEEN :tuNgay AND :denNgay " +
           "AND d.trangThai != :excludeStatus " +
           "GROUP BY v.maVoucher, v.moTa, v.loai, v.giaTri " +
           "ORDER BY COUNT(d) DESC")
    List<Object[]> findVoucherUsageStats(
        @Param("tuNgay") LocalDateTime tuNgay,
        @Param("denNgay") LocalDateTime denNgay,
        @Param("excludeStatus") TrangThaiDonHang_ENUM excludeStatus
);
}

