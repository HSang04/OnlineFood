package com.ths.onlinefood.controller;

import com.ths.onlinefood.model.DonHang;
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

    private final DonHangService service;

    @GetMapping
    public List<DonHang> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonHang> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DonHang create(@RequestBody DonHang donHang) {
        return service.create(donHang);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonHang> update(@PathVariable Long id, @RequestBody DonHang donHang) {
        DonHang updated = service.update(id, donHang);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.delete(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
