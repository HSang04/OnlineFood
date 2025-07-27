package com.ths.onlinefood.service;

import com.ths.onlinefood.model.DanhGiaMonAn;
import com.ths.onlinefood.repository.DanhGiaMonAnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DanhGiaMonAnService {

    private final DanhGiaMonAnRepository repository;

    public List<DanhGiaMonAn> getAll() {
        return repository.findAll();
    }

    public Optional<DanhGiaMonAn> getById(Long id) {
        return repository.findById(id);
    }

    public DanhGiaMonAn create(DanhGiaMonAn danhGia) {
        danhGia.setThoiGianDanhGia(LocalDateTime.now());
        return repository.save(danhGia);
    }

    public Optional<DanhGiaMonAn> update(Long id, DanhGiaMonAn newDG) {
        return repository.findById(id).map(dg -> {
            dg.setSoSao(newDG.getSoSao());
            dg.setNoiDung(newDG.getNoiDung());
            dg.setMonAn(newDG.getMonAn());
            dg.setNguoiDung(newDG.getNguoiDung());
            return repository.save(dg);
        });
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }
}
