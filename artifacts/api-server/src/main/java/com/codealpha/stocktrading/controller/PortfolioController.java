package com.codealpha.stocktrading.controller;

import com.codealpha.stocktrading.dto.PerformanceResponse;
import com.codealpha.stocktrading.dto.PortfolioResponse;
import com.codealpha.stocktrading.model.Transaction;
import com.codealpha.stocktrading.service.TradingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PortfolioController {
    private final TradingService tradingService;

    public PortfolioController(TradingService tradingService) {
        this.tradingService = tradingService;
    }

    @GetMapping("/portfolio")
    public PortfolioResponse getPortfolio() {
        return tradingService.getPortfolio();
    }

    @GetMapping("/portfolio/performance")
    public PerformanceResponse getPerformance() {
        return tradingService.calculatePerformance();
    }

    @GetMapping("/transactions")
    public List<Transaction> getTransactions() {
        return tradingService.getTransactions();
    }
}