package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.ChiTietDonHang;
import com.ths.onlinefood.model.TrangThaiDonHang_ENUM;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, Long> {
     List<ChiTietDonHang> findByDonHangId(Long donHangId);
     
     @Query("SELECT m.tenMonAn, SUM(ct.soLuong), SUM(ct.soLuong * ct.donGia), AVG(ct.donGia) " +
       "FROM ChiTietDonHang ct " +
       "JOIN ct.monAn m " +
       "JOIN ct.donHang d " +
       "WHERE d.ngayTao BETWEEN :tuNgay AND :denNgay " +
       "AND d.trangThai != :excludeStatus " +
       "GROUP BY m.id, m.tenMonAn " +
       "ORDER BY SUM(ct.soLuong) DESC")
        List<Object[]> findTopSellingItems(
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgay") LocalDateTime denNgay,
            @Param("excludeStatus") TrangThaiDonHang_ENUM excludeStatus
        );

        @Query("SELECT SUM(ct.soLuong * ct.donGia) " +
               "FROM ChiTietDonHang ct " +
               "JOIN ct.donHang d " +
               "WHERE d.ngayTao BETWEEN :tuNgay AND :denNgay " +
               "AND d.trangThai != :excludeStatus")
        Double getTotalRevenueByDateRange(
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgay") LocalDateTime denNgay,
            @Param("excludeStatus") TrangThaiDonHang_ENUM excludeStatus
        );

}