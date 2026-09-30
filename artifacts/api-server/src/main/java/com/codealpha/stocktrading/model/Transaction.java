package com.codealpha.stocktrading.model;

import java.math.BigDecimal;
import java.time.Instant;

public class Transaction {
    private TransactionType type;
    private String stockSymbol;
    private String companyName;
    private int quantity;
    private BigDecimal price;
    private BigDecimal totalAmount;
    private Instant timestamp;

    public Transaction() {
    }

    public Transaction(
            TransactionType type,
            String stockSymbol,
            String companyName,
            int quantity,
            BigDecimal price,
            BigDecimal totalAmount,
            Instant timestamp
    ) {
        this.type = type;
        this.stockSymbol = stockSymbol;
        this.companyName = companyName;
        this.quantity = quantity;
        this.price = price;
        this.totalAmount = totalAmount;
        this.timestamp = timestamp;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getStockSymbol() {
        return stockSymbol;
    }

    public void setStockSymbol(String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}