package com.ths.onlinefood.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ths.onlinefood.dto.MonAnDTO;
import com.ths.onlinefood.model.MonAn;
import com.ths.onlinefood.service.MonAnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
            .map(monAn -> {
          
                monAn.getHinhAnhMonAns().size();
                return ResponseEntity.ok(monAn);
            })
            .orElse(ResponseEntity.notFound().build());
}


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MonAn> create(
            @RequestPart("monAn") String monAnJson,
            @RequestPart(value = "images", required = false) MultipartFile[] imageFiles) {
        try {
        
            ObjectMapper objectMapper = new ObjectMapper();
            MonAn monAn = objectMapper.readValue(monAnJson, MonAn.class);
            return ResponseEntity.ok(monAnService.create(monAn, imageFiles));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

 @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<MonAn> update(
    @PathVariable Long id,
    @RequestPart("monAn") String monAnJson,
    @RequestPart(value = "images", required = false) MultipartFile[] imageFiles) {
  try {
      ObjectMapper objectMapper = new ObjectMapper();
      MonAnDTO dto = objectMapper.readValue(monAnJson, MonAnDTO.class);
      MonAn updated = monAnService.update(id, dto, imageFiles);
      return ResponseEntity.ok(updated);
  } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest().build();
  }
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
