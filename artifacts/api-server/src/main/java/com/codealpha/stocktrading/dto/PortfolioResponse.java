package com.codealpha.stocktrading.dto;

import com.codealpha.stocktrading.model.Holding;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class PortfolioResponse {
    private BigDecimal availableCash;
    private BigDecimal portfolioValue;
    private BigDecimal totalInvested;
    private BigDecimal totalProfitLoss;
    private BigDecimal profitLossPercentage;
    private Map<String, Holding> holdings;

    public PortfolioResponse(
            BigDecimal availableCash,
            BigDecimal portfolioValue,
            BigDecimal totalInvested,
            BigDecimal totalProfitLoss,
            BigDecimal profitLossPercentage,
            Map<String, Holding> holdings
    ) {
        this.availableCash = availableCash;
        this.portfolioValue = portfolioValue;
        this.totalInvested = totalInvested;
        this.totalProfitLoss = totalProfitLoss;
        this.profitLossPercentage = profitLossPercentage;
        this.holdings = new HashMap<>(holdings);
    }

    public BigDecimal getAvailableCash() {
        return availableCash;
    }

    public BigDecimal getPortfolioValue() {
        return portfolioValue;
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public BigDecimal getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public BigDecimal getProfitLossPercentage() {
        return profitLossPercentage;
    }

    public Map<String, Holding> getHoldings() {
        return holdings;
    }
}