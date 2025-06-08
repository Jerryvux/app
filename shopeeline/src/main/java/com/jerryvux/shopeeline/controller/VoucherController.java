package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.model.Voucher;
import com.jerryvux.shopeeline.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {
    @Autowired
    private VoucherService voucherService;

    @GetMapping("/available")
    public ResponseEntity<List<Voucher>> getAvailableVouchers(@RequestParam(required = false) Integer userId) {
        List<Voucher> availableVouchers = userId != null 
            ? voucherService.getAvailableVouchers(userId) 
            : voucherService.getActiveVouchers();
        return ResponseEntity.ok(availableVouchers);
    }
    
}