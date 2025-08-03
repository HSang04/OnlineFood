package com.ths.onlinefood.service;

import com.ths.onlinefood.request.ChangePasswordRequest;
import com.ths.onlinefood.dto.NguoiDungDTO;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.repository.NguoiDungRepository;
import com.ths.onlinefood.request.ChangePasswordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
   
    public Optional<NguoiDung> getByUsername(String username) {
        return nguoiDungRepository.findByUsername(username);
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
                    nd.setSoDienThoai(nguoiDungMoi.getSoDienThoai());
                    nd.setDiaChi(nguoiDungMoi.getDiaChi());
                    return nguoiDungRepository.save(nd);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
   
    public NguoiDungDTO updateProfile(Long id, NguoiDungDTO updateRequest, String currentUsername) {
        return nguoiDungRepository.findById(id)
                .map(existingUser -> {
                    // Kiểm tra quyền truy cập
                    if (!existingUser.getUsername().equals(currentUsername)) {
                        throw new RuntimeException("Không có quyền cập nhật thông tin này");
                    }
                 
                    // ✅ BỎ PHẦN CẬP NHẬT MẬT KHẨU RA KHỎI ĐÂY
                    // Chỉ cập nhật thông tin cá nhân
                    if (StringUtils.hasText(updateRequest.getHoTen())) {
                        existingUser.setHoTen(updateRequest.getHoTen());
                    }
                    if (StringUtils.hasText(updateRequest.getSoDienThoai())) {
                        existingUser.setSoDienThoai(updateRequest.getSoDienThoai());
                    }
                    if (StringUtils.hasText(updateRequest.getDiaChi())) {
                        existingUser.setDiaChi(updateRequest.getDiaChi());
                    }
                    
                    NguoiDung savedUser = nguoiDungRepository.save(existingUser);
                    
                    // Chuyển đổi sang DTO để trả về (không bao gồm mật khẩu)
                    return new NguoiDungDTO(
                        savedUser.getId(),
                        savedUser.getUsername(),
                        null, 
                        savedUser.getHoTen(),
                        savedUser.getEmail(),
                        savedUser.getSoDienThoai(),
                        savedUser.getDiaChi(),
                        savedUser.getVaiTro()
                    );
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
    
   
    public void changePassword(Long id, ChangePasswordRequest request, String currentUsername) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        if (!user.getUsername().equals(currentUsername)) {
            throw new RuntimeException("Không có quyền thay đổi mật khẩu này");
        }
        if (!StringUtils.hasText(request.getMatKhauCu())) {
            throw new RuntimeException("Vui lòng nhập mật khẩu cũ");
        }
        if (!StringUtils.hasText(request.getMatKhauMoi())) {
            throw new RuntimeException("Vui lòng nhập mật khẩu mới");
        }
        if (request.getMatKhauMoi().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
        if (!passwordEncoder.matches(request.getMatKhauCu(), user.getMatKhau())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }
        user.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDungRepository.save(user);
    }
    
    public void delete(Long id) {
        nguoiDungRepository.deleteById(id);
    }
}