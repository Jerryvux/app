package com.jerryvux.shopeeline.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.jerryvux.shopeeline.model.Voucher;
import com.jerryvux.shopeeline.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private static final Logger logger = LoggerFactory.getLogger(VoucherService.class);

    @Autowired
    private VoucherRepository voucherRepository;

    public List<Voucher> getActiveVouchers() {
        List<Voucher> vouchers = voucherRepository.findAll();
        vouchers.forEach(voucher -> {
            System.out.println("Voucher Code: " + voucher.getCode() + ", Discount Value: " + voucher.getDiscountValue());
        });
        return vouchers;
    }

    public List<Voucher> getAvailableVouchers(Integer userId) {
        ZonedDateTime nowWithZone = ZonedDateTime.now(ZoneId.systemDefault());
        LocalDateTime now = nowWithZone.toLocalDateTime();
        return voucherRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(now, now)
                .stream()
                .filter(voucher -> voucher.getUserId() == null || voucher.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Voucher createVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }

    public Voucher createVoucherFromDto(com.jerryvux.shopeeline.dto.VoucherDto voucherDto) {
        logger.debug("Processing createVoucherFromDto with DTO: {}", voucherDto);
        Voucher voucher = new Voucher();

        if (voucherDto.getCode() == null || voucherDto.getCode().trim().isEmpty()) {
            String errorMessage = "Voucher code cannot be empty.";
            logger.warn("Validation failed for DTO {}: {}", voucherDto, errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
        voucher.setCode(voucherDto.getCode().trim());

        if (voucherDto.getType() == null || voucherDto.getType().trim().isEmpty()) {
            String errorMessage = "Voucher type cannot be empty.";
            logger.warn("Validation failed for DTO {}: {}", voucherDto, errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
        voucher.setType(voucherDto.getType().trim());

        if (voucherDto.getDiscount() == null || voucherDto.getDiscount().trim().isEmpty()) {
            String errorMessage = "Discount value cannot be empty.";
            logger.warn("Validation failed for DTO {}: {}", voucherDto, errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
        try {
            voucher.setDiscountValue(Integer.parseInt(voucherDto.getDiscount().trim()));
        } catch (NumberFormatException e) {
            String errorMessage = "Invalid number format for discount value: '" + voucherDto.getDiscount() + "'.";
            logger.warn("Parsing failed for DTO {}: {}", voucherDto, errorMessage, e);
            throw new IllegalArgumentException(errorMessage, e);
        }

        if (voucherDto.getMinPurchase() != null && !voucherDto.getMinPurchase().trim().isEmpty()) {
            try {
                voucher.setMinOrderValue(Integer.parseInt(voucherDto.getMinPurchase().trim()));
            } catch (NumberFormatException e) {
                String errorMessage = "Invalid number format for minimum purchase value: '" + voucherDto.getMinPurchase() + "'.";
                logger.warn("Parsing failed for DTO {}: {}", voucherDto, errorMessage, e);
                throw new IllegalArgumentException(errorMessage, e);
            }
        } else {
            voucher.setMinOrderValue(0);
        }

        voucher.setIsPercent(voucherDto.getIsPercent() != null && voucherDto.getIsPercent());

        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ISO_LOCAL_DATE;
        if (voucherDto.getStartDate() == null || voucherDto.getStartDate().trim().isEmpty()) {
            String errorMessage = "Start date cannot be empty.";
            logger.warn("Validation failed for DTO {}: {}", voucherDto, errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
        try {
            java.time.LocalDate startDate = java.time.LocalDate.parse(voucherDto.getStartDate().trim(), dateFormatter);
            voucher.setStartDate(startDate.atStartOfDay());
        } catch (java.time.format.DateTimeParseException e) {
            String errorMessage = "Invalid start date format: '" + voucherDto.getStartDate() + "'. Please use YYYY-MM-DD.";
            logger.warn("Parsing failed for DTO {}: {}", voucherDto, errorMessage, e);
            throw new IllegalArgumentException(errorMessage, e);
        }

        if (voucherDto.getEndDate() == null || voucherDto.getEndDate().trim().isEmpty()) {
            String errorMessage = "End date cannot be empty.";
            logger.warn("Validation failed for DTO {}: {}", voucherDto, errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
        try {
            java.time.LocalDate endDate = java.time.LocalDate.parse(voucherDto.getEndDate().trim(), dateFormatter);
            voucher.setEndDate(endDate.atTime(java.time.LocalTime.MAX));
        } catch (java.time.format.DateTimeParseException e) {
            String errorMessage = "Invalid end date format: '" + voucherDto.getEndDate() + "'. Please use YYYY-MM-DD.";
            logger.warn("Parsing failed for DTO {}: {}", voucherDto, errorMessage, e);
            throw new IllegalArgumentException(errorMessage, e);
        }

        if (voucherDto.getLimitPerUser() != null) {
            voucher.setLimitPerUser(voucherDto.getLimitPerUser());
        } else {
            voucher.setLimitPerUser(1);
        }

        logger.debug("Attempting to save voucher entity: {}", voucher);
        Voucher savedVoucher = voucherRepository.save(voucher);
        logger.info("Voucher saved successfully: {}", savedVoucher.getCode());
        return savedVoucher;
    }
}
