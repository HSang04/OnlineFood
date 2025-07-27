package com.ths.onlinefood.service;

import com.ths.onlinefood.model.DonHang;
import com.ths.onlinefood.repository.DonHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DonHangService {
    private final DonHangRepository repository;

    public List<DonHang> getAll() {
        return repository.findAll();
    }

    public Optional<DonHang> getById(Long id) {
        return repository.findById(id);
    }

    public DonHang create(DonHang donHang) {
        return repository.save(donHang);
    }

    public DonHang update(Long id, DonHang newDH) {
        return repository.findById(id)
                .map(dh -> {
                    dh.setNgayTao(newDH.getNgayTao());
                    dh.setTrangThai(newDH.getTrangThai());
                    dh.setTongTien(newDH.getTongTien());
                    dh.setNguoiDung(newDH.getNguoiDung());
                    dh.setVoucher(newDH.getVoucher());
                    return repository.save(dh);
                })
                .orElse(null);
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }
}
