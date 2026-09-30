package com.codealpha.stocktrading.model;

import java.math.BigDecimal;

public class Holding {
    private Stock stock;
    private int quantity;
    private BigDecimal averageBuyPrice;

    public Holding() {
    }

    public Holding(Stock stock, int quantity, BigDecimal averageBuyPrice) {
        this.stock = stock;
        this.quantity = quantity;
        this.averageBuyPrice = averageBuyPrice;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public void setAverageBuyPrice(BigDecimal averageBuyPrice) {
        this.averageBuyPrice = averageBuyPrice;
    }
}