package com.ths.onlinefood.controller;

import com.ths.onlinefood.dto.GioHangDTO;
import com.ths.onlinefood.service.GioHangService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gio-hang")
@CrossOrigin(origins = "*") // Thêm để cho phép CORS nếu cần
public class GioHangController {
    private final GioHangService gioHangService;

    public GioHangController(GioHangService gioHangService) {
        this.gioHangService = gioHangService;
    }

   
    @GetMapping("/{nguoiDungId}")
    public ResponseEntity<List<GioHangDTO>> getGioHang(@PathVariable Long nguoiDungId) {
        try {
            List<GioHangDTO> gioHang = gioHangService.getGioHangByNguoiDungId(nguoiDungId);
            return ResponseEntity.ok(gioHang);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

 
    @PostMapping("/{nguoiDungId}/add")
    public ResponseEntity<GioHangDTO> addToCart(
            @PathVariable Long nguoiDungId,
            @RequestParam Long monAnId,
            @RequestParam Integer soLuong
    ) {
        try {
            GioHangDTO result = gioHangService.addToCart(nguoiDungId, monAnId, soLuong);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

  
    @PutMapping("/{nguoiDungId}/increase/{gioHangId}")
    public ResponseEntity<GioHangDTO> increaseQuantity(
            @PathVariable Long nguoiDungId,
            @PathVariable Long gioHangId
    ) {
        try {
            GioHangDTO result = gioHangService.increaseQuantity(nguoiDungId, gioHangId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

   
    @PutMapping("/{nguoiDungId}/decrease/{gioHangId}")
    public ResponseEntity<GioHangDTO> decreaseQuantity(
            @PathVariable Long nguoiDungId,
            @PathVariable Long gioHangId
    ) {
        try {
            GioHangDTO result = gioHangService.decreaseQuantity(nguoiDungId, gioHangId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

   
    @PutMapping("/{nguoiDungId}/update-quantity/{gioHangId}")
    public ResponseEntity<GioHangDTO> updateQuantity(
            @PathVariable Long nguoiDungId,
            @PathVariable Long gioHangId,
            @RequestBody Map<String, Integer> request
    ) {
        try {
            Integer soLuong = request.get("soLuong");
            if (soLuong == null || soLuong < 1) {
                return ResponseEntity.badRequest().build();
            }
            GioHangDTO result = gioHangService.updateQuantity(nguoiDungId, gioHangId, soLuong);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

  
    @DeleteMapping("/{nguoiDungId}/remove/{gioHangId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long nguoiDungId,
            @PathVariable Long gioHangId
    ) {
        try {
            gioHangService.removeFromCart(nguoiDungId, gioHangId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    
    @DeleteMapping("/{nguoiDungId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long nguoiDungId) {
        try {
            gioHangService.clearCart(nguoiDungId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}