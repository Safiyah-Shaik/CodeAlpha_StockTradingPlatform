package com.codealpha.stocktrading.model;

import java.math.BigDecimal;

public class Stock {
    private String symbol;
    private String companyName;
    private BigDecimal currentPrice;
    private BigDecimal priceChange;

    public Stock() {
    }

    public Stock(String symbol, String companyName, BigDecimal currentPrice, BigDecimal priceChange) {
        this.symbol = symbol;
        this.companyName = companyName;
        this.currentPrice = currentPrice;
        this.priceChange = priceChange;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getPriceChange() {
        return priceChange;
    }

    public void setPriceChange(BigDecimal priceChange) {
        this.priceChange = priceChange;
    }
}