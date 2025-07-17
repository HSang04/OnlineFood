package com.ths.onlinefood.service;

import com.ths.onlinefood.model.Voucher;
import com.ths.onlinefood.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    public Voucher getVoucherById(Long id) {
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
            return voucherRepository.save(v);
        }
        return null;
    }

    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
    }

    public Optional<Voucher> findByMaVoucher(String maVoucher) {
        return voucherRepository.findByMaVoucher(maVoucher);
    }
}
