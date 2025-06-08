package com.jerryvux.shopeeline.mapper;

import org.mapstruct.Named;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Named("formatDate")
    public static String formatDate(LocalDateTime date) {
        if (date == null) {
            return null;
        }
        return date.format(FORMATTER);
    }

    @Named("parseDate")
    public static LocalDateTime parseDate(String date) {
        if (date == null) {
            return null;
        }
        return LocalDateTime.parse(date, FORMATTER);
    }
}
