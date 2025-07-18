package com.ths.onlinefood.repository;

import com.ths.onlinefood.model.MonAn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MonAnRepository extends JpaRepository<MonAn, Long> {
    List<MonAn> findByTenMonAnContainingIgnoreCase(String keyword);
}
