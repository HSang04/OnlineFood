package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    
    Optional<NguoiDung> findByUsername(String username);
    Optional<NguoiDung> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}