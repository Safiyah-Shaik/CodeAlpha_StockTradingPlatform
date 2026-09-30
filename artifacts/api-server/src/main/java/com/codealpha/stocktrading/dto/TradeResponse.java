package com.codealpha.stocktrading.dto;

import com.codealpha.stocktrading.model.Transaction;

import java.math.BigDecimal;

public class TradeResponse {
    private Transaction transaction;
    private BigDecimal availableCash;

    public TradeResponse(Transaction transaction, BigDecimal availableCash) {
        this.transaction = transaction;
        this.availableCash = availableCash;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }

    public BigDecimal getAvailableCash() {
        return availableCash;
    }

    public void setAvailableCash(BigDecimal availableCash) {
        this.availableCash = availableCash;
    }
}