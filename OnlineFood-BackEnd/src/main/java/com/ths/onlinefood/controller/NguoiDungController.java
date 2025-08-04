package com.ths.onlinefood.controller;

import com.cloudinary.api.ApiResponse;
import com.ths.onlinefood.request.ApiResponseRequest;
import com.ths.onlinefood.dto.NguoiDungDTO;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.request.ChangePasswordRequest;
import com.ths.onlinefood.service.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {
    
    private final NguoiDungService nguoiDungService;

    // Endpoints công khai (không cần authentication)
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        nguoiDungService.delete(id);
        return ResponseEntity.noContent().build();
    }

    
    @GetMapping("/secure/{id}")
    public ResponseEntity<NguoiDung> getSecureById(@PathVariable Long id, Principal principal) {
        
        String currentUsername = principal.getName();
        System.out.println("Current user: " + currentUsername);
        
        return nguoiDungService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/secure/{id}")
    public ResponseEntity<NguoiDungDTO> updateProfile(
            @PathVariable Long id, 
            @RequestBody NguoiDungDTO updateRequest,
            Principal principal) {
        
        try {
   
            String currentUsername = principal.getName();
            
            NguoiDungDTO updatedUser = nguoiDungService.updateProfile(id, updateRequest, currentUsername);
            return ResponseEntity.ok(updatedUser);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

     @PutMapping("/secure/{id}/change-password")
    public ResponseEntity<ApiResponseRequest> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request,
            Principal principal) {
        
        try {
            String currentUsername = principal.getName();
            nguoiDungService.changePassword(id, request, currentUsername);
            
            return ResponseEntity.ok(new ApiResponseRequest(true, "Đổi mật khẩu thành công"));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseRequest(false, e.getMessage()));
        }
    }
    
    @DeleteMapping("/secure/{id}")
    public ResponseEntity<Void> secureDelete(@PathVariable Long id, Principal principal) {
  
        String currentUsername = principal.getName();
        nguoiDungService.delete(id);
        return ResponseEntity.noContent().build();
    }

 
    @GetMapping("/secure/profile")
    public ResponseEntity<NguoiDung> getCurrentUserProfile(Principal principal) {
        String currentUsername = principal.getName();
        
     
        return nguoiDungService.getByUsername(currentUsername)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}