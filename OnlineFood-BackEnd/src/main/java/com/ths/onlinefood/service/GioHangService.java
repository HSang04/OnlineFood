package com.ths.onlinefood.service;

import com.ths.onlinefood.dto.GioHangDTO;
import com.ths.onlinefood.model.GioHang;
import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.repository.GioHangRepository;
import com.ths.onlinefood.repository.MonAnRepository;
import com.ths.onlinefood.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GioHangService {
    private final GioHangRepository gioHangRepo;
    private final MonAnRepository monAnRepo;
    private final NguoiDungRepository nguoiDungRepo;

    public GioHangService(GioHangRepository gioHangRepo, MonAnRepository monAnRepo, NguoiDungRepository nguoiDungRepo) {
        this.gioHangRepo = gioHangRepo;
        this.monAnRepo = monAnRepo;
        this.nguoiDungRepo = nguoiDungRepo;
    }

    public List<GioHangDTO> getGioHangByNguoiDungId(Long nguoiDungId) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        List<GioHang> gioHangList = gioHangRepo.findByNguoiDung(nguoiDung);
        return gioHangList.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public GioHangDTO addToCart(Long nguoiDungId, Long monAnId, Integer soLuong) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        MonAn monAn = monAnRepo.findById(monAnId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));

        if (monAn.getTrangThai() != 1) {
            throw new RuntimeException("Món ăn đã ngừng bán");
        }

        GioHang item = gioHangRepo.findByNguoiDungAndMonAn_Id(nguoiDung, monAnId)
                .map(existing -> {
                    existing.setSoLuong(existing.getSoLuong() + soLuong);
                    return existing;
                })
                .orElse(GioHang.builder()
                        .nguoiDung(nguoiDung)
                        .monAn(monAn)
                        .soLuong(soLuong)
                        .build());

        return toDTO(gioHangRepo.save(item));
    }

    public GioHangDTO increaseQuantity(Long nguoiDungId, Long gioHangId) {
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        item.setSoLuong(item.getSoLuong() + 1);
        return toDTO(gioHangRepo.save(item));
    }

    public GioHangDTO decreaseQuantity(Long nguoiDungId, Long gioHangId) {
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        if (item.getSoLuong() <= 1) {
            throw new RuntimeException("Số lượng không thể nhỏ hơn 1");
        }
        item.setSoLuong(item.getSoLuong() - 1);
        return toDTO(gioHangRepo.save(item));
    }

    public GioHangDTO updateQuantity(Long nguoiDungId, Long gioHangId, Integer soLuong) {
        if (soLuong < 1) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        item.setSoLuong(soLuong);
        return toDTO(gioHangRepo.save(item));
    }

    public void removeFromCart(Long nguoiDungId, Long gioHangId) {
        GioHang item = validateGioHangAccess(nguoiDungId, gioHangId);
        gioHangRepo.delete(item);
    }

    
    public void clearCart(Long nguoiDungId) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        gioHangRepo.deleteAllByNguoiDung(nguoiDung);
    }

    private GioHang validateGioHangAccess(Long nguoiDungId, Long gioHangId) {
        NguoiDung nguoiDung = nguoiDungRepo.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        GioHang item = gioHangRepo.findById(gioHangId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục giỏ hàng"));
        
        if (!item.getNguoiDung().getId().equals(nguoiDung.getId())) {
            throw new RuntimeException("Không có quyền truy cập mục này");
        }
        
        return item;
    }

    private GioHangDTO toDTO(GioHang gioHang) {
    GioHangDTO dto = new GioHangDTO();
    dto.setId(gioHang.getId());
    dto.setMonAnId(gioHang.getMonAn().getId());
    dto.setNguoiDungId(gioHang.getNguoiDung().getId());
    dto.setSoLuong(gioHang.getSoLuong());
    return dto;
    }
 }
