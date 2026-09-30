package com.codealpha.stocktrading.model;

import java.util.HashMap;
import java.util.Map;

public class Portfolio {
    private final Map<String, Holding> holdings = new HashMap<>();

    public Map<String, Holding> getHoldings() {
        return holdings;
    }
}