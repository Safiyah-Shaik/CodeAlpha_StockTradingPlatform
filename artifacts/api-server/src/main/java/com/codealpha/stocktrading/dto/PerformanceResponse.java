package com.codealpha.stocktrading.dto;

import java.math.BigDecimal;

public class PerformanceResponse {
    private BigDecimal initialCashBalance;
    private BigDecimal currentCashBalance;
    private BigDecimal totalInvested;
    private BigDecimal currentPortfolioValue;
    private BigDecimal totalAccountValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal returnPercentage;

    public PerformanceResponse(
            BigDecimal initialCashBalance,
            BigDecimal currentCashBalance,
            BigDecimal totalInvested,
            BigDecimal currentPortfolioValue,
            BigDecimal totalAccountValue,
            BigDecimal totalProfitLoss,
            BigDecimal returnPercentage
    ) {
        this.initialCashBalance = initialCashBalance;
        this.currentCashBalance = currentCashBalance;
        this.totalInvested = totalInvested;
        this.currentPortfolioValue = currentPortfolioValue;
        this.totalAccountValue = totalAccountValue;
        this.totalProfitLoss = totalProfitLoss;
        this.returnPercentage = returnPercentage;
    }

    public BigDecimal getInitialCashBalance() {
        return initialCashBalance;
    }

    public BigDecimal getCurrentCashBalance() {
        return currentCashBalance;
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public BigDecimal getCurrentPortfolioValue() {
        return currentPortfolioValue;
    }

    public BigDecimal getTotalAccountValue() {
        return totalAccountValue;
    }

    public BigDecimal getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public BigDecimal getReturnPercentage() {
        return returnPercentage;
    }
}