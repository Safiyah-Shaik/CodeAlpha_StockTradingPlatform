package com.codealpha.stocktrading.service;

import com.codealpha.stocktrading.model.Stock;
import com.codealpha.stocktrading.repository.InMemoryStockRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class StockService {
    private final InMemoryStockRepository stockRepository;

    public StockService(InMemoryStockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Stock findStock(String symbol) {
        String normalizedSymbol = symbol == null ? "" : symbol.trim().toUpperCase(Locale.ROOT);
        return stockRepository.findBySymbol(normalizedSymbol)
                .orElseThrow(() -> new java.util.NoSuchElementException(
                        "Stock not found: " + normalizedSymbol
                ));
    }

    public List<Stock> searchStocks(String keyword) {
        String searchTerm = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        if (searchTerm.isEmpty()) {
            return getAllStocks();
        }

        return getAllStocks().stream()
                .filter(stock ->
                        stock.getSymbol().toLowerCase(Locale.ROOT).contains(searchTerm)
                                || stock.getCompanyName().toLowerCase(Locale.ROOT).contains(searchTerm)
                )
                .toList();
    }
}