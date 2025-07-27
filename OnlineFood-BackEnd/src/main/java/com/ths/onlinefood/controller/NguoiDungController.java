package com.ths.onlinefood.controller;

import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.service.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    public ResponseEntity<List<NguoiDung>> getAll() {
        return ResponseEntity.ok(nguoiDungService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NguoiDung> getById(@PathVariable Long id) {
        return nguoiDungService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NguoiDung> create(@RequestBody NguoiDung nguoiDung) {
        return ResponseEntity.ok(nguoiDungService.create(nguoiDung));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NguoiDung> update(@PathVariable Long id, @RequestBody NguoiDung nguoiDung) {
        return ResponseEntity.ok(nguoiDungService.update(id, nguoiDung));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        nguoiDungService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
