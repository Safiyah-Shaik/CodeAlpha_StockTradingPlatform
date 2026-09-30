package com.codealpha.stocktrading.controller;

import com.codealpha.stocktrading.dto.TradeRequest;
import com.codealpha.stocktrading.dto.TradeResponse;
import com.codealpha.stocktrading.service.TradingService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trade")
public class TradeController {
    private final TradingService tradingService;

    public TradeController(TradingService tradingService) {
        this.tradingService = tradingService;
    }

    @PostMapping("/buy")
    public TradeResponse buyStock(@RequestBody TradeRequest request) {
        return tradingService.buyStock(request.getSymbol(), request.getQuantity());
    }

    @PostMapping("/sell")
    public TradeResponse sellStock(@RequestBody TradeRequest request) {
        return tradingService.sellStock(request.getSymbol(), request.getQuantity());
    }
}