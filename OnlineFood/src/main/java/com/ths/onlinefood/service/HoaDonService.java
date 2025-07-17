package com.ths.onlinefood.service;

import com.ths.onlinefood.model.HoaDon;
import com.ths.onlinefood.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;

    public List<HoaDon> getAll() {
        return hoaDonRepository.findAll();
    }

    public Optional<HoaDon> getById(Long id) {
        return hoaDonRepository.findById(id);
    }

    public HoaDon create(HoaDon hoaDon) {
        return hoaDonRepository.save(hoaDon);
    }

    public HoaDon update(Long id, HoaDon newHoaDon) {
        return hoaDonRepository.findById(id).map(hd -> {
            hd.setNguoiDung(newHoaDon.getNguoiDung());
            hd.setDonHang(newHoaDon.getDonHang());
            hd.setPhuongThuc(newHoaDon.getPhuongThuc());
            hd.setThoiGianThanhToan(newHoaDon.getThoiGianThanhToan());
            hd.setTrangThai(newHoaDon.getTrangThai());
            hd.setMaGD(newHoaDon.getMaGD());
            return hoaDonRepository.save(hd);
        }).orElse(null);
    }

    public boolean delete(Long id) {
        if (!hoaDonRepository.existsById(id)) return false;
        hoaDonRepository.deleteById(id);
        return true;
    }
}
