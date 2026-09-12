package com.quickmeal.backend.exception;

/**
 * Thrown for expected business-rule violations (out of stock, entity not
 * found, invalid state, ...) whose message is safe to show to the client.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
