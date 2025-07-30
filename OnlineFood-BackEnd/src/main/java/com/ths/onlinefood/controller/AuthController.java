package com.ths.onlinefood.controller;

import com.ths.onlinefood.config.JwtProvider;
import com.ths.onlinefood.model.NguoiDung;
import com.ths.onlinefood.model.USER_ROLE;
import com.ths.onlinefood.repository.NguoiDungRepository;
import com.ths.onlinefood.request.RequestLogin;
import com.ths.onlinefood.response.AuthResponse;
import com.ths.onlinefood.service.CustomerUserDetailsService;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomerUserDetailsService customerUserDetailsService;

    public AuthController(
            NguoiDungRepository nguoiDungRepository,
            PasswordEncoder passwordEncoder,
            JwtProvider jwtProvider,
            CustomerUserDetailsService customerUserDetailsService
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
        this.customerUserDetailsService = customerUserDetailsService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@RequestBody NguoiDung user) throws Exception {
        
         Optional<NguoiDung> existingUsername = nguoiDungRepository.findByUsername(user.getUsername());
        if (existingUsername.isPresent()) {
            throw new Exception("Username đã được sử dụng.");
        }
        
        Optional<NguoiDung> existingUser = nguoiDungRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new Exception("Email đã được sử dụng.");
        }


       NguoiDung newUser = new NguoiDung();
        newUser.setUsername(user.getUsername());
        newUser.setEmail(user.getEmail());
        newUser.setHoTen(user.getHoTen());
//        newUser.setVaiTro(user.getVaiTro());
        newUser.setVaiTro(USER_ROLE.KHACHHANG);
        
        newUser.setMatKhau(passwordEncoder.encode(user.getMatKhau()));
        newUser.setSoDienThoai(user.getSoDienThoai());
        newUser.setDiaChi(user.getDiaChi());
        newUser.setNgayTao(LocalDateTime.now());


        NguoiDung savedUser = nguoiDungRepository.save(newUser);

        // Tạo JWT
          UserDetails userDetails = customerUserDetailsService.loadUserByUsername(savedUser.getUsername());
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        String jwt = jwtProvider.generateToken(authToken);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(jwt);
        authResponse.setMessage("Đăng ký thành công");
        authResponse.setRole(savedUser.getVaiTro());

        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }
    
    @PostMapping("/signup-by-admin")
    public ResponseEntity<?> createUserByAdmin(@RequestBody NguoiDung user) throws Exception {
    Optional<NguoiDung> existingUsername = nguoiDungRepository.findByUsername(user.getUsername());
        if (existingUsername.isPresent()) {
            throw new Exception("Username đã được sử dụng.");
        }
        
        Optional<NguoiDung> existingUser = nguoiDungRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new Exception("Email đã được sử dụng.");
        }

       NguoiDung newUser = new NguoiDung();
        newUser.setUsername(user.getUsername());
        newUser.setEmail(user.getEmail());
        newUser.setHoTen(user.getHoTen());
        newUser.setVaiTro(user.getVaiTro());

        newUser.setMatKhau(passwordEncoder.encode(user.getMatKhau()));
        newUser.setSoDienThoai(user.getSoDienThoai());
        newUser.setDiaChi(user.getDiaChi());
        newUser.setNgayTao(LocalDateTime.now());
        NguoiDung savedUser = nguoiDungRepository.save(newUser);

        // Tạo JWT
          UserDetails userDetails = customerUserDetailsService.loadUserByUsername(savedUser.getUsername());
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        String jwt = jwtProvider.generateToken(authToken);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(jwt);
        authResponse.setMessage("Đăng ký thành công");
        authResponse.setRole(savedUser.getVaiTro());

        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
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
            throw new BadCredentialsException("Email không tồn tại.");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Mật khẩu không chính xác.");
        }

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;
    }
}
