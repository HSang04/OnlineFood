package com.ths.onlinefood.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ths.onlinefood.dto.MonAnDTO;
import com.ths.onlinefood.model.HinhAnhMonAn;
import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.repository.HinhAnhMonAnRepository;
import com.ths.onlinefood.repository.MonAnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MonAnService {

    private final MonAnRepository monAnRepository;
    private final HinhAnhMonAnRepository hinhAnhMonAnRepository;
    private final Cloudinary cloudinary;

    public List<MonAn> getAll() {
        return monAnRepository.findAll();
    }

    public Optional<MonAn> getById(Long id) {
        return monAnRepository.findById(id);
    }

    public MonAn create(MonAn monAn, MultipartFile[] imageFiles) throws IOException {
        MonAn saved = monAnRepository.save(monAn);

        if (imageFiles != null) {
            for (MultipartFile file : imageFiles) {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                String url = (String) uploadResult.get("secure_url");

                HinhAnhMonAn hinhAnh = new HinhAnhMonAn();
                hinhAnh.setMonAn(saved);
                hinhAnh.setDuongDan(url);

                hinhAnhMonAnRepository.save(hinhAnh);
            }
        }

        return saved;
    }

    public MonAn update(Long id, MonAnDTO dto, MultipartFile[] imageFiles) throws IOException {
        Optional<MonAn> optional = monAnRepository.findById(id);
        if (optional.isEmpty()) return null;

        MonAn existing = optional.get();

        existing.setTenMonAn(dto.getTenMonAn());
        existing.setGia(dto.getGia());
        existing.setMoTa(dto.getMoTa());
        existing.setDanhMuc(dto.getDanhMuc());
        existing.setTrangThai(dto.getTrangThai());

        List<Long> keptIds = dto.getKeptImageIds() != null ? dto.getKeptImageIds() : List.of();
        List<HinhAnhMonAn> oldImages = hinhAnhMonAnRepository.findByMonAnId(id);

        for (HinhAnhMonAn img : oldImages) {
            if (!keptIds.contains(img.getId())) {
                hinhAnhMonAnRepository.delete(img);
            }
        }

        if (imageFiles != null && imageFiles.length > 0) {
            for (MultipartFile file : imageFiles) {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                String url = (String) uploadResult.get("secure_url");

                HinhAnhMonAn newImage = new HinhAnhMonAn();
                newImage.setMonAn(existing);
                newImage.setDuongDan(url);
                hinhAnhMonAnRepository.save(newImage);
            }
        }

        return monAnRepository.save(existing);
    }

    public boolean delete(Long id) {
        if (monAnRepository.existsById(id)) {
            List<HinhAnhMonAn> images = hinhAnhMonAnRepository.findByMonAnId(id);
            hinhAnhMonAnRepository.deleteAll(images);
            monAnRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<MonAn> searchByTenMon(String keyword) {
        return monAnRepository.findByTenMonAnContainingIgnoreCase(keyword);
    }

    public Optional<MonAn> getImagesByMonAnId(Long monAnId) {
        return monAnRepository.findWithHinhAnhMonAnsAndKhuyenMaiById(monAnId);
    }

    public HinhAnhMonAn saveImage(Long monAnId, MultipartFile imageFile) throws IOException {
        Optional<MonAn> monAn = monAnRepository.findById(monAnId);
        if (monAn.isEmpty()) return null;

        Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.emptyMap());
        String url = (String) uploadResult.get("secure_url");

        HinhAnhMonAn img = new HinhAnhMonAn();
        img.setMonAn(monAn.get());
        img.setDuongDan(url);
        return hinhAnhMonAnRepository.save(img);
    }

    public void deleteImage(Long imageId) {
        hinhAnhMonAnRepository.deleteById(imageId);
    }

 
    public double getGiaBan(MonAn monAn) {
        // Kiểm tra xem có khuyến mãi không và khuyến mãi có hợp lệ không
        if (monAn.getKhuyenMai() != null && 
            monAn.getKhuyenMai().getGiaGiam() > 0 && 
            monAn.getKhuyenMai().getGiaGiam() < monAn.getGia()) {
            return monAn.getKhuyenMai().getGiaGiam();
        }
        return monAn.getGia();
    }
    
 
    public boolean isOnSale(MonAn monAn) {
        return monAn.getKhuyenMai() != null && 
               monAn.getKhuyenMai().getGiaGiam() > 0 && 
               monAn.getKhuyenMai().getGiaGiam() < monAn.getGia();
    }

    public int getPhanTramGiamGia(MonAn monAn) {
        if (!isOnSale(monAn)) {
            return 0;
        }
        
        double giaGoc = monAn.getGia();
        double giaGiam = monAn.getKhuyenMai().getGiaGiam();
        return (int) Math.round(((giaGoc - giaGiam) / giaGoc) * 100);
    }
    
 
    public MonAnDTO convertToDto(MonAn monAn) {
        MonAnDTO dto = new MonAnDTO();
        dto.setId(monAn.getId());
        dto.setTenMonAn(monAn.getTenMonAn());
        dto.setGia(monAn.getGia()); 
        dto.setMoTa(monAn.getMoTa());
        dto.setTrangThai(monAn.getTrangThai());
        dto.setDanhMuc(monAn.getDanhMuc());
        
        
        dto.setHinhAnhMonAns(monAn.getHinhAnhMonAns());
        
   
        dto.setGiaKhuyenMai(getGiaBan(monAn)); 
        dto.setCoKhuyenMai(isOnSale(monAn));
        dto.setPhanTramGiamGia(getPhanTramGiamGia(monAn));
        
        return dto;
    }
    
   
    public List<MonAnDTO> getAllDTOs() {
        return monAnRepository.findAll()
                .stream()
                .map(monAn -> {
                    // Trigger lazy loading cho hình ảnh
                    monAn.getHinhAnhMonAns().size();
                    return convertToDto(monAn);
                })
                .toList();
    }
    
   
    public List<MonAnDTO> getActiveDTOs() {
        return monAnRepository.findAll()
                .stream()
                .filter(monAn -> monAn.getTrangThai() == 1)
                .map(monAn -> {
                    // Trigger lazy loading cho hình ảnh
                    monAn.getHinhAnhMonAns().size();
                    return convertToDto(monAn);
                })
                .toList();
    }
    
 
    public Optional<MonAnDTO> getDTOById(Long id) {
        return monAnRepository.findById(id)
                .map(this::convertToDto);
    }
}