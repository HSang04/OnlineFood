package com.ths.onlinefood.service;

import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    public List<NguoiDung> getAll() {
        return nguoiDungRepository.findAll();
    }

    public Optional<NguoiDung> getById(Long id) {
        return nguoiDungRepository.findById(id);
    }

    public NguoiDung create(NguoiDung nguoiDung) {
        nguoiDung.setMatKhau(passwordEncoder.encode(nguoiDung.getMatKhau())); 
        nguoiDung.setNgayTao(LocalDateTime.now());
        return nguoiDungRepository.save(nguoiDung);
    }

    public NguoiDung update(Long id, NguoiDung nguoiDungMoi) {
        return nguoiDungRepository.findById(id)
                .map(nd -> {
                    nd.setHoTen(nguoiDungMoi.getHoTen());
                    nd.setEmail(nguoiDungMoi.getEmail());
                    nd.setSoDienThoai(nguoiDungMoi.getSoDienThoai());
                    nd.setDiaChi(nguoiDungMoi.getDiaChi());
                    return nguoiDungRepository.save(nd);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    public void delete(Long id) {
        nguoiDungRepository.deleteById(id);
    }
}
