package com.ths.onlinefood.controller;

import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.service.MonAnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mon-an")
@RequiredArgsConstructor
public class MonAnController {

    private final MonAnService monAnService;

    @GetMapping
    public List<MonAn> getAll() {
        return monAnService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MonAn> getById(@PathVariable Long id) {
        return monAnService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MonAn> create(@RequestBody MonAn monAn) {
        return ResponseEntity.ok(monAnService.create(monAn));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MonAn> update(@PathVariable Long id, @RequestBody MonAn monAn) {
        MonAn updated = monAnService.update(id, monAn);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return monAnService.delete(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public List<MonAn> search(@RequestParam String keyword) {
        return monAnService.searchByTenMon(keyword);
    }
}
