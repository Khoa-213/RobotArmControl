package com.example.robotcontrolsystembackend.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"),
    FACTORY_NAME_REQUIRED(HttpStatus.BAD_REQUEST, "FACTORY_NAME_REQUIRED"),
    FACTORY_NAME_ALREADY_EXISTS(HttpStatus.CONFLICT, "FACTORY_NAME_ALREADY_EXISTS");

    private final HttpStatus httpStatus;
    private final String code;

    ErrorCode(HttpStatus httpStatus, String code) {
        this.httpStatus = httpStatus;
        this.code = code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getCode() {
        return code;
    }
}
