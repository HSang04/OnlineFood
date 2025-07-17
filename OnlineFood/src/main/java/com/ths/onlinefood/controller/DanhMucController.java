package com.ths.onlinefood.controller;

import com.ths.onlinefood.model.DanhMuc;
import com.ths.onlinefood.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")
@RequiredArgsConstructor
public class DanhMucController {

    private final DanhMucService service;

    @GetMapping
    public List<DanhMuc> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DanhMuc> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DanhMuc create(@RequestBody DanhMuc dm) {
        return service.save(dm);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DanhMuc> update(@PathVariable Long id, @RequestBody DanhMuc dm) {
        return service.update(id, dm)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.delete(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
