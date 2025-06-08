package com.jerryvux.shopeeline.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDto {

    private String code;
    private String type;
    private String discount;
    private Boolean isPercent;
    private String minPurchase;
    private String startDate;
    private String endDate;
    private Integer limitPerUser;

    private Boolean isActive;
    private String maxDiscount;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDiscount() {
        return discount;
    }

    public void setDiscount(String discount) {
        this.discount = discount;
    }

    public Boolean getIsPercent() {
        return isPercent;
    }

    public void setIsPercent(Boolean isPercent) {
        this.isPercent = isPercent;
    }

    public String getMinPurchase() {
        return minPurchase;
    }

    public void setMinPurchase(String minPurchase) {
        this.minPurchase = minPurchase;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public Integer getLimitPerUser() {
        return limitPerUser;
    }

    public void setLimitPerUser(Integer limitPerUser) {
        this.limitPerUser = limitPerUser;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(String maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    @Override
    public String toString() {
        return "VoucherDto{"
                + "code='" + code + '\''
                + ", type='" + type + '\''
                + ", discount='" + discount + '\''
                + ", isPercent=" + isPercent
                + ", minPurchase='" + minPurchase + '\''
                + ", startDate='" + startDate + '\''
                + ", endDate='" + endDate + '\''
                + ", limitPerUser=" + limitPerUser
                + ", isActive=" + isActive
                + ", maxDiscount='" + maxDiscount + '\''
                + '}';
    }
}
