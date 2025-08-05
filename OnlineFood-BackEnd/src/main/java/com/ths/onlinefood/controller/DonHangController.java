package com.ths.onlinefood.controller;

import com.ths.onlinefood.model.DonHang;
import com.ths.onlinefood.request.DonHangRequest;
import com.ths.onlinefood.service.DonHangService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/don-hang")
@RequiredArgsConstructor
public class DonHangController {

    private final DonHangService donHangService;

    @GetMapping
    public List<DonHang> getAll() {
        return donHangService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonHang> getById(@PathVariable Long id) {
        return donHangService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

  
  @PostMapping("/dat-hang")
    @Transactional
    public ResponseEntity<DonHang> create(@RequestBody DonHangRequest request) {
        try {
            DonHang donHang = donHangService.createFromRequest(request);
            return ResponseEntity.ok(donHang);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonHang> update(@PathVariable Long id, @RequestBody DonHang donHang) {
        DonHang updated = donHangService.update(id, donHang);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return donHangService.delete(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}
