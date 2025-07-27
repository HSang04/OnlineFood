package com.ths.onlinefood.service;

import com.cloudinary.Cloudinary;
import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.repository.MonAnRepository;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MonAnService {
    
    @Autowired
    private final MonAnRepository monAnRepository;
     @Autowired
    private Cloudinary cloudinary;
    
    
    public List<MonAn> getAll() {
        return monAnRepository.findAll();
    }

    public Optional<MonAn> getById(Long id) {
        return monAnRepository.findById(id);
    }

   public MonAn create(MonAn monAn, MultipartFile imageFile) {
    try {
        Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), Map.of());
        String imageUrl = (String) uploadResult.get("secure_url");
        monAn.setHinhAnh(imageUrl);
    } catch (IOException e) {
        throw new RuntimeException("Upload thất bại: " + e.getMessage());
    }

    return monAnRepository.save(monAn);
}

    public MonAn update(Long id, MonAn newMonAn) {
        return monAnRepository.findById(id).map(ma -> {
            ma.setTenMonAn(newMonAn.getTenMonAn());
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
        return monAnRepository.findByTenMonAnContainingIgnoreCase(keyword);
    }
}
