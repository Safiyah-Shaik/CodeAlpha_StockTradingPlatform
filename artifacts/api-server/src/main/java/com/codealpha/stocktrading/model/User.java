package com.codealpha.stocktrading.model;

import java.math.BigDecimal;

public class User {
    private long id;
    private String name;
    private BigDecimal cashBalance;
    private Portfolio portfolio;

    public User() {
    }

    public User(long id, String name, BigDecimal cashBalance, Portfolio portfolio) {
        this.id = id;
        this.name = name;
        this.cashBalance = cashBalance;
        this.portfolio = portfolio;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCashBalance() {
        return cashBalance;
    }

    public void setCashBalance(BigDecimal cashBalance) {
        this.cashBalance = cashBalance;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }
}