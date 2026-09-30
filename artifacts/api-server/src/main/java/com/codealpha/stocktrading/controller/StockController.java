package com.codealpha.stocktrading.controller;

import com.codealpha.stocktrading.model.Stock;
import com.codealpha.stocktrading.service.StockService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {
    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }

    @GetMapping("/{symbol}")
    public Stock findStock(@PathVariable String symbol) {
        return stockService.findStock(symbol);
    }

    @GetMapping("/search")
    public List<Stock> searchStocks(@RequestParam(defaultValue = "") String keyword) {
        return stockService.searchStocks(keyword);
    }
}