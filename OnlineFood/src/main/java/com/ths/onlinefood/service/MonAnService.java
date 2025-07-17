package com.ths.onlinefood.service;

import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.repository.MonAnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MonAnService {

    private final MonAnRepository monAnRepository;

    public List<MonAn> getAll() {
        return monAnRepository.findAll();
    }

    public Optional<MonAn> getById(Long id) {
        return monAnRepository.findById(id);
    }

    public MonAn create(MonAn monAn) {
        return monAnRepository.save(monAn);
    }

    public MonAn update(Long id, MonAn newMonAn) {
        return monAnRepository.findById(id).map(ma -> {
            ma.setTenMon(newMonAn.getTenMon());
            ma.setMoTa(newMonAn.getMoTa());
            ma.setHinhAnh(newMonAn.getHinhAnh());
            ma.setGia(newMonAn.getGia());
            ma.setTrangThai(newMonAn.getTrangThai());
            ma.setDanhMuc(newMonAn.getDanhMuc());
            return monAnRepository.save(ma);
        }).orElse(null);
    }

    public boolean delete(Long id) {
        if (!monAnRepository.existsById(id)) return false;
        monAnRepository.deleteById(id);
        return true;
    }

    public List<MonAn> searchByTenMon(String keyword) {
        return monAnRepository.findByTenMonContainingIgnoreCase(keyword);
    }
}
