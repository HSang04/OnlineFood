package com.ths.onlinefood.controller;

import com.ths.onlinefood.config.JwtProvider;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.model.USER_ROLE;
import com.ths.onlinefood.repository.NguoiDungRepository;
import com.ths.onlinefood.request.RequestLogin;
import com.ths.onlinefood.response.AuthResponse;
import com.ths.onlinefood.service.CustomerUserDetailsService;
import com.ths.onlinefood.service.NguoiDungService;
import com.ths.onlinefood.dto.NguoiDungDTO;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Collections;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final NguoiDungRepository nguoiDungRepository;
    private final JwtProvider jwtProvider;
    private final CustomerUserDetailsService customerUserDetailsService;
    private final NguoiDungService nguoiDungService;

    public AuthController(
            NguoiDungRepository nguoiDungRepository,
            JwtProvider jwtProvider,
            CustomerUserDetailsService customerUserDetailsService,
            NguoiDungService nguoiDungService
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.jwtProvider = jwtProvider;
        this.customerUserDetailsService = customerUserDetailsService;
        this.nguoiDungService = nguoiDungService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> createUserHandler(@RequestBody NguoiDungDTO userRequest) {
        try {
            NguoiDung savedUser = nguoiDungService.createUserByPublic(userRequest);

            String jwt = generateJwtForUser(savedUser);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setJwt(jwt);
            authResponse.setMessage("Đăng ký thành công");
            authResponse.setRole(savedUser.getVaiTro());
            authResponse.setId(savedUser.getId());

            return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/signup-by-admin")
    public ResponseEntity<?> createUserByAdmin(@RequestBody NguoiDungDTO userRequest) {
        try {
            NguoiDung savedUser = nguoiDungService.createUserByAdmin(userRequest);

            String jwt = generateJwtForUser(savedUser);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setJwt(jwt);
            authResponse.setMessage("Đăng ký thành công");
            authResponse.setRole(savedUser.getVaiTro());
            authResponse.setId(savedUser.getId());

            return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> signin(@RequestBody RequestLogin requestLogin) {
        try {
            Authentication authentication = authenticate(
                requestLogin.getUsername(), 
                requestLogin.getMatKhau()
            );

            NguoiDung nguoiDung = nguoiDungRepository.findByUsername(requestLogin.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

         
            if (!nguoiDung.getTrangThai()) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("message", "Tài khoản đã bị vô hiệu hóa."));
            }

            String jwt = jwtProvider.generateToken(authentication);
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            String role = authorities.isEmpty() ? null : authorities.iterator().next().getAuthority();

            AuthResponse response = new AuthResponse();
            response.setJwt(jwt);
            response.setId(nguoiDung.getId());
            response.setRole(USER_ROLE.valueOf(role));
            response.setMessage("Đăng nhập thành công");

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Tài khoản hoặc mật khẩu không chính xác."));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("message", "Lỗi hệ thống"));
        }
    }

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customerUserDetailsService.loadUserByUsername(username);
        if (userDetails == null) {
            throw new BadCredentialsException("Tài khoản không tồn tại.");
        }

        if (!nguoiDungService.checkPassword(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Mật khẩu không chính xác.");
        }

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;
    }

    private String generateJwtForUser(NguoiDung user) {
        UserDetails userDetails = customerUserDetailsService.loadUserByUsername(user.getUsername());
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);
        
        return jwtProvider.generateToken(authToken);
    }
}