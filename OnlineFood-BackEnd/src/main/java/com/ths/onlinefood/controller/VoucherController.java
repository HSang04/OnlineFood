package com.ths.onlinefood.controller;

import com.ths.onlinefood.model.Voucher;
import com.ths.onlinefood.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {
    
    @Autowired
    private VoucherService voucherService;

    @GetMapping
    public List<Voucher> getAllVouchers() {
        return voucherService.getAllVouchers();
    }

    @GetMapping("/{id}")
    public Voucher getVoucherById(@PathVariable Long id) {
        return voucherService.getVoucherById(id);
    }

    @PostMapping
    public Voucher createVoucher(@RequestBody Voucher voucher) {
        return voucherService.createVoucher(voucher);
    }

    @PutMapping("/{id}")
    public Voucher updateVoucher(@PathVariable Long id, @RequestBody Voucher voucher) {
        return voucherService.updateVoucher(id, voucher);
    }

    @DeleteMapping("/{id}")
    public void deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
    }

 
    @GetMapping("/find")
    public ResponseEntity<Map<String, Object>> getVoucherByCode(
            @RequestParam String ma,
            @RequestParam(required = false, defaultValue = "0") double tongTien) {
        
        Map<String, Object> response = voucherService.findAndValidateVoucher(ma, tongTien);
        
        boolean isValid = (boolean) response.get("valid");
        if (isValid) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}