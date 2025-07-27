package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.NguoiDung;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    // tim theo email, sdt
     Optional<NguoiDung> findByEmail(String email);
}
