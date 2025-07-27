package com.ths.onlinefood.controller;

import com.ths.onlinefood.model.DanhGiaMonAn;
import com.ths.onlinefood.service.DanhGiaMonAnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/danh-gia-mon-an")
@RequiredArgsConstructor
public class DanhGiaMonAnController {

    private final DanhGiaMonAnService service;

    @GetMapping
    public List<DanhGiaMonAn> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DanhGiaMonAn> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DanhGiaMonAn create(@RequestBody DanhGiaMonAn danhGiaMonAn) {
        return service.create(danhGiaMonAn);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DanhGiaMonAn> update(@PathVariable Long id, @RequestBody DanhGiaMonAn newDG) {
        return service.update(id, newDG)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.delete(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}

