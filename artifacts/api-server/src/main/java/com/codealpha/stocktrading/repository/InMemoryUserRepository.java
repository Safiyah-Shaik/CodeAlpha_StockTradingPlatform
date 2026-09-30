package com.codealpha.stocktrading.repository;

import com.codealpha.stocktrading.model.Portfolio;
import com.codealpha.stocktrading.model.User;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public class InMemoryUserRepository {
    private final User demoUser = new User(
            1L,
            "Alex Johnson",
            new BigDecimal("100000.00"),
            new Portfolio()
    );

    public User findDemoUser() {
        return demoUser;
    }
}