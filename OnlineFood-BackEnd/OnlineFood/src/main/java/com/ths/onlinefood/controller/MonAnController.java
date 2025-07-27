package com.ths.onlinefood.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.service.MonAnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

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

//   @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<MonAn> create(
//        @RequestPart("monAn") MonAn monAn,
//        @RequestPart("image") MultipartFile imageFile) {
//
//    return ResponseEntity.ok(monAnService.create(monAn, imageFile));
//}
   @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MonAn> create(
            @RequestPart("monAn") String monAnJson,
            @RequestPart("image") MultipartFile imageFile) {
        try {
            //System.out.println("JSON: " + monAnJson); 
            ObjectMapper objectMapper = new ObjectMapper();
            MonAn monAn = objectMapper.readValue(monAnJson, MonAn.class);
            return ResponseEntity.ok(monAnService.create(monAn, imageFile));
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.badRequest().build();
        }
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
