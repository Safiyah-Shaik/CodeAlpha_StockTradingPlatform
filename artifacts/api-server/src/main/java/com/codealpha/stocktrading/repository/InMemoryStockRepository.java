package com.codealpha.stocktrading.repository;

import com.codealpha.stocktrading.model.Stock;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class InMemoryStockRepository {
    private final Map<String, Stock> stocks = new LinkedHashMap<>();

    public InMemoryStockRepository() {
        addStock("AAPL", "Apple Inc.", "227.50", "2.35");
        addStock("GOOGL", "Alphabet Inc.", "251.30", "-1.82");
        addStock("MSFT", "Microsoft Corporation", "512.40", "4.16");
        addStock("AMZN", "Amazon", "234.80", "1.27");
        addStock("TSLA", "Tesla Inc.", "445.60", "-8.43");
        addStock("NVDA", "NVIDIA Corporation", "182.70", "3.78");
        addStock("META", "Meta Platforms", "744.20", "6.22");
    }

    private void addStock(String symbol, String companyName, String price, String change) {
        stocks.put(
                symbol,
                new Stock(symbol, companyName, new BigDecimal(price), new BigDecimal(change))
        );
    }

    public List<Stock> findAll() {
        return new ArrayList<>(stocks.values());
    }

    public Optional<Stock> findBySymbol(String symbol) {
        return Optional.ofNullable(stocks.get(symbol));
    }
}