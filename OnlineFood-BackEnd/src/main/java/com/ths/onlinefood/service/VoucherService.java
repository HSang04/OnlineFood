package com.ths.onlinefood.service;

import com.ths.onlinefood.model.Voucher;
import com.ths.onlinefood.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class VoucherService {
    
    private static final Logger logger = LoggerFactory.getLogger(VoucherService.class);
    
    @Autowired
    private VoucherRepository voucherRepository;

  

    public void checkAndUpdateAllExpiredVouchers() {
        try {
            List<Voucher> allVouchers = voucherRepository.findAll();
            LocalDate today = LocalDate.now();
            boolean hasChanges = false;
            
            for (Voucher voucher : allVouchers) {
                if (voucher == null || voucher.getHanSuDung() == null) continue;
                
                LocalDate expireDate = getExpireDate(voucher.getHanSuDung());
                if (expireDate == null) continue;
                
                if (expireDate.isBefore(today) && voucher.getTrangThai()) {
                    voucher.setTrangThai(false);
                    hasChanges = true;
                }
                
                if (voucher.getDaSuDung() >= voucher.getSoLuong() && voucher.getSoLuong() > 0 && voucher.getTrangThai()) {
                    voucher.setTrangThai(false);
                    hasChanges = true;
                }
            }
            
            if (hasChanges) {
                voucherRepository.saveAll(allVouchers);
                logger.info("Đã cập nhật trạng thái voucher hết hạn");
            }
            
        } catch (Exception e) {
            logger.error("Lỗi khi kiểm tra voucher hết hạn: {}", e.getMessage());
        }
    }
    
    private LocalDate getExpireDate(Object hanSuDung) {
        try {
            if (hanSuDung instanceof java.time.LocalDate localDate) {
                return localDate;
            } else if (hanSuDung instanceof java.time.LocalDateTime localDateTime) {
                return localDateTime.toLocalDate();
            } else if (hanSuDung instanceof java.util.Date date) {
                return date.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
            } else if (hanSuDung instanceof java.sql.Date date) {
                return date.toLocalDate();
            }
        } catch (Exception e) {
            logger.warn("Lỗi khi chuyển đổi ngày hết hạn: {}", e.getMessage());
        }
        return null;
    }

    public List<Voucher> getAllVouchers() {
        checkAndUpdateAllExpiredVouchers();
        return voucherRepository.findAll();
    }

    public Voucher getVoucherById(Long id) {
        checkAndUpdateAllExpiredVouchers();
        return voucherRepository.findById(id).orElse(null);
    }

    public Voucher createVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }

    public Voucher updateVoucher(Long id, Voucher updatedVoucher) {
        Optional<Voucher> existing = voucherRepository.findById(id);
        if (existing.isPresent()) {
            Voucher v = existing.get();
            v.setMaVoucher(updatedVoucher.getMaVoucher());
            v.setLoai(updatedVoucher.getLoai());
            v.setGiaTri(updatedVoucher.getGiaTri());
            v.setHanSuDung(updatedVoucher.getHanSuDung());
            v.setSoLuong(updatedVoucher.getSoLuong());
            v.setMoTa(updatedVoucher.getMoTa());
            v.setDaSuDung(updatedVoucher.getDaSuDung());
            v.setTrangThai(updatedVoucher.getTrangThai());
            return voucherRepository.save(v);
        }
        return null;
    }

    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
    }

    public Optional<Voucher> findByMaVoucher(String maVoucher) {
        checkAndUpdateAllExpiredVouchers();
        return voucherRepository.findByMaVoucher(maVoucher);
    }
    
    public List<Voucher> getVoucherTrue() {
        checkAndUpdateAllExpiredVouchers();
        return voucherRepository.findByTrangThai(true);
    }
    
    
    public Map<String, Object> findAndValidateVoucher(String maVoucher, double tongTien) {
        Map<String, Object> result = new HashMap<>();
        
        checkAndUpdateAllExpiredVouchers();

        // 1. Tìm voucher
        Optional<Voucher> optionalVoucher = voucherRepository.findByMaVoucher(maVoucher);
        if (optionalVoucher.isEmpty()) {
            logger.warn("Voucher {} không tồn tại", maVoucher);
            result.put("valid", false);
            result.put("message", "Mã voucher không tồn tại");
            result.put("errorCode", "VOUCHER_NOT_FOUND");
            return result;
        }

        Voucher voucher = optionalVoucher.get();
        result.put("voucher", voucher);

        // 2. Kiểm tra trạng thái
        if (voucher.getTrangThai() == null || !voucher.getTrangThai()) {
            logger.warn("Voucher {} không khả dụng", maVoucher);
            result.put("valid", false);
            result.put("message", "Voucher không khả dụng hoặc đã hết hạn");
            result.put("errorCode", "VOUCHER_INACTIVE");
            return result;
        }

        // 3. Kiểm tra số lượng còn lại
        if (voucher.getSoLuong() > 0 && voucher.getDaSuDung() >= voucher.getSoLuong()) {
            logger.warn("Voucher {} đã hết lượt sử dụng", maVoucher);
            result.put("valid", false);
            result.put("message", "Voucher đã hết lượt sử dụng");
            result.put("errorCode", "VOUCHER_OUT_OF_STOCK");
            return result;
        }

        // 4. Kiểm tra hạn sử dụng
        LocalDate expireDate = getExpireDate(voucher.getHanSuDung());
        if (expireDate != null && expireDate.isBefore(LocalDate.now())) {
            logger.warn("Voucher {} đã hết hạn", maVoucher);
            result.put("valid", false);
            result.put("message", "Voucher đã hết hạn sử dụng");
            result.put("errorCode", "VOUCHER_EXPIRED");
            return result;
        }

        // 5. Nếu có tổng tiền, kiểm tra điều kiện và tính giảm giá
        if (tongTien > 0) {
            // Kiểm tra số tiền tối thiểu
            if (tongTien < voucher.getGiaToiThieu()) {
                logger.warn("Đơn hàng không đạt giá tối thiểu để áp dụng voucher {}", maVoucher);
                result.put("valid", false);
                result.put("message", String.format("Đơn hàng phải từ %,.0f₫ trở lên để sử dụng voucher này", voucher.getGiaToiThieu()));
                result.put("errorCode", "MINIMUM_AMOUNT_NOT_REACHED");
                return result;
            }

            // Tính số tiền giảm
            double discount = calculateDiscount(voucher, tongTien);
            double finalAmount = tongTien - discount;

            result.put("discountAmount", discount);
            result.put("finalAmount", finalAmount);
            result.put("originalAmount", tongTien);
        }

        // Voucher hợp lệ
        result.put("valid", true);
        result.put("message", "Voucher hợp lệ và có thể sử dụng");
        
        logger.info("Voucher {} hợp lệ", maVoucher);
        return result;
    }

   
    private double calculateDiscount(Voucher voucher, double tongTien) {
        double discount = 0.0;
        
        if (voucher.getLoai() == Voucher.LoaiVoucher.PHAN_TRAM) {
            discount = tongTien * (voucher.getGiaTri() / 100.0);
        } else if (voucher.getLoai() == Voucher.LoaiVoucher.TIEN_MAT) {
            discount = voucher.getGiaTri();
        }

        // Đảm bảo không giảm quá số tiền đơn hàng
        return Math.min(discount, tongTien);
    }

    public double useVoucher(double totalAmount, String maVoucher) {
        checkAndUpdateAllExpiredVouchers();

        Optional<Voucher> optionalVoucher = voucherRepository.findByMaVoucher(maVoucher);
        if (optionalVoucher.isEmpty()) {
            logger.warn("Voucher {} không tồn tại", maVoucher);
            return 0.0;
        }

        Voucher voucher = optionalVoucher.get();

        if (voucher.getTrangThai() == null || !voucher.getTrangThai()) {
            logger.warn("Voucher {} không khả dụng", maVoucher);
            return 0.0;
        }

        if (voucher.getSoLuong() > 0 && voucher.getDaSuDung() >= voucher.getSoLuong()) {
            logger.warn("Voucher {} đã hết lượt sử dụng", maVoucher);
            return 0.0;
        }

        if (totalAmount < voucher.getGiaToiThieu()) {
            logger.warn("Đơn hàng không đạt giá tối thiểu để áp dụng voucher {}", maVoucher);
            return 0.0;
        }

        double discount = calculateDiscount(voucher, totalAmount);

        // Cập nhật lượt sử dụng
        voucher.setDaSuDung(voucher.getDaSuDung() + 1);
        voucherRepository.save(voucher);

        logger.info("Voucher {} áp dụng thành công. Giảm: {}", maVoucher, discount);
        return discount;
    }
}