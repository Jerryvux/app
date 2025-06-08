package com.jerryvux.shopeeline.exception;

import lombok.Getter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class BatchUploadException extends RuntimeException {

    private final List<String> errorMessages;
    private final List<Integer> failedRowIndices;
    private final transient List<Object> failedEntities;

    public BatchUploadException(String message, List<String> errorMessages, List<Integer> failedRowIndices) {
        super(message);
        this.errorMessages = errorMessages;
        this.failedRowIndices = failedRowIndices;
        this.failedEntities = new ArrayList<>();
    }

    public BatchUploadException(String message, List<String> errorMessages, List<Integer> failedRowIndices, List<Object> failedEntities) {
        super(message);
        this.errorMessages = errorMessages;
        this.failedRowIndices = failedRowIndices;
        this.failedEntities = failedEntities;
    }

    public String getFormattedErrorMessage() {
        return errorMessages.stream()
                .collect(Collectors.joining(", ", "Lỗi upload: ", ""));
    }

    public int getTotalErrors() {
        return errorMessages.size();
    }

    public boolean hasErrors() {
        return !errorMessages.isEmpty();
    }

    @Override
    public String toString() {
        return String.format("BatchUploadException: %s (Errors: %d, Failed Rows: %s)",
                getMessage(), getTotalErrors(), failedRowIndices);
    }

    public List<Object> getFailedEntities() {
        return failedEntities;
    }

    public void addFailedEntity(Object entity) {
        this.failedEntities.add(entity);
    }

    public void addFailedEntities(List<Object> entities) {
        this.failedEntities.addAll(entities);
    }

    public void clearFailedEntities() {
        this.failedEntities.clear();
    }

    public List<String> getErrorMessages() {
        return errorMessages;
    }

    public List<Integer> getFailedRowIndices() {
        return failedRowIndices;
    }

}
