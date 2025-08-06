package com.ths.onlinefood.controller;

import com.ths.onlinefood.service.GeoLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/khoang-cach")
@RequiredArgsConstructor
public class APIKhoangCachController {

    private final GeoLocationService geoLocationService;

    @GetMapping("/dia-chi")
    public ResponseEntity<?> tinhKhoangCachTuDiaChi(@RequestParam String diaChi) {
        try {
            double[] latlng = geoLocationService.getLatLngFromAddress(diaChi);
            double khoangCach = geoLocationService.tinhKhoangCach(latlng[0], latlng[1]);
            return ResponseEntity.ok(
                    java.util.Map.of(
                            "lat", latlng[0],
                            "lng", latlng[1],
                            "khoangCach_km", khoangCach
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", e.getMessage()
            ));
        }
    }
}
