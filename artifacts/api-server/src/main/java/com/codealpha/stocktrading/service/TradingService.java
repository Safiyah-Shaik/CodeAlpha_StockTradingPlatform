package com.codealpha.stocktrading.service;

import com.codealpha.stocktrading.dto.PerformanceResponse;
import com.codealpha.stocktrading.dto.PortfolioResponse;
import com.codealpha.stocktrading.dto.TradeResponse;
import com.codealpha.stocktrading.model.Holding;
import com.codealpha.stocktrading.model.Portfolio;
import com.codealpha.stocktrading.model.Stock;
import com.codealpha.stocktrading.model.Transaction;
import com.codealpha.stocktrading.model.TransactionType;
import com.codealpha.stocktrading.model.User;
import com.codealpha.stocktrading.repository.InMemoryTransactionRepository;
import com.codealpha.stocktrading.repository.InMemoryUserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
public class TradingService {
    private static final BigDecimal INITIAL_CASH_BALANCE = new BigDecimal("100000.00");

    private final StockService stockService;
    private final InMemoryUserRepository userRepository;
    private final InMemoryTransactionRepository transactionRepository;

    public TradingService(
            StockService stockService,
            InMemoryUserRepository userRepository,
            InMemoryTransactionRepository transactionRepository
    ) {
        this.stockService = stockService;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public TradeResponse buyStock(String symbol, int quantity) {
        validateQuantity(quantity);
        Stock stock = stockService.findStock(symbol);
        User user = userRepository.findDemoUser();
        BigDecimal totalAmount = stock.getCurrentPrice().multiply(BigDecimal.valueOf(quantity));

        if (user.getCashBalance().compareTo(totalAmount) < 0) {
            throw new IllegalStateException("Insufficient cash balance for this purchase.");
        }

        Portfolio portfolio = user.getPortfolio();
        Holding existingHolding = portfolio.getHoldings().get(stock.getSymbol());
        if (existingHolding == null) {
            portfolio.getHoldings().put(
                    stock.getSymbol(),
                    new Holding(stock, quantity, stock.getCurrentPrice())
            );
        } else {
            int updatedQuantity = existingHolding.getQuantity() + quantity;
            BigDecimal existingCost = existingHolding.getAverageBuyPrice()
                    .multiply(BigDecimal.valueOf(existingHolding.getQuantity()));
            BigDecimal newPurchaseCost = stock.getCurrentPrice().multiply(BigDecimal.valueOf(quantity));
            BigDecimal weightedAverage = existingCost.add(newPurchaseCost)
                    .divide(BigDecimal.valueOf(updatedQuantity), 2, RoundingMode.HALF_UP);

            existingHolding.setQuantity(updatedQuantity);
            existingHolding.setAverageBuyPrice(weightedAverage);
        }

        user.setCashBalance(user.getCashBalance().subtract(totalAmount));
        Transaction transaction = createTransaction(
                TransactionType.BUY,
                stock,
                quantity,
                totalAmount
        );
        transactionRepository.save(transaction);
        return new TradeResponse(transaction, user.getCashBalance());
    }

    public TradeResponse sellStock(String symbol, int quantity) {
        validateQuantity(quantity);
        Stock stock = stockService.findStock(symbol);
        User user = userRepository.findDemoUser();
        Portfolio portfolio = user.getPortfolio();
        Holding holding = portfolio.getHoldings().get(stock.getSymbol());

        if (holding == null || holding.getQuantity() < quantity) {
            throw new IllegalStateException("You do not own enough shares to complete this sale.");
        }

        BigDecimal totalAmount = stock.getCurrentPrice().multiply(BigDecimal.valueOf(quantity));
        int remainingQuantity = holding.getQuantity() - quantity;
        if (remainingQuantity == 0) {
            portfolio.getHoldings().remove(stock.getSymbol());
        } else {
            holding.setQuantity(remainingQuantity);
        }

        user.setCashBalance(user.getCashBalance().add(totalAmount));
        Transaction transaction = createTransaction(
                TransactionType.SELL,
                stock,
                quantity,
                totalAmount
        );
        transactionRepository.save(transaction);
        return new TradeResponse(transaction, user.getCashBalance());
    }

    public BigDecimal calculatePortfolioValue() {
        return userRepository.findDemoUser().getPortfolio().getHoldings().values().stream()
                .map(holding -> holding.getStock().getCurrentPrice()
                        .multiply(BigDecimal.valueOf(holding.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateTotalInvested() {
        return userRepository.findDemoUser().getPortfolio().getHoldings().values().stream()
                .map(holding -> holding.getAverageBuyPrice()
                        .multiply(BigDecimal.valueOf(holding.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateProfitLoss() {
        return calculatePortfolioValue().subtract(calculateTotalInvested());
    }

    public BigDecimal calculateProfitLossPercentage() {
        BigDecimal invested = calculateTotalInvested();
        if (invested.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return calculateProfitLoss()
                .multiply(BigDecimal.valueOf(100))
                .divide(invested, 2, RoundingMode.HALF_UP);
    }

    public PortfolioResponse getPortfolio() {
        User user = userRepository.findDemoUser();
        return new PortfolioResponse(
                user.getCashBalance(),
                calculatePortfolioValue(),
                calculateTotalInvested(),
                calculateProfitLoss(),
                calculateProfitLossPercentage(),
                user.getPortfolio().getHoldings()
        );
    }

    public PerformanceResponse calculatePerformance() {
        User user = userRepository.findDemoUser();
        BigDecimal portfolioValue = calculatePortfolioValue();
        BigDecimal accountValue = user.getCashBalance().add(portfolioValue);
        BigDecimal totalProfitLoss = accountValue.subtract(INITIAL_CASH_BALANCE);
        BigDecimal returnPercentage = totalProfitLoss
                .multiply(BigDecimal.valueOf(100))
                .divide(INITIAL_CASH_BALANCE, 2, RoundingMode.HALF_UP);

        return new PerformanceResponse(
                INITIAL_CASH_BALANCE,
                user.getCashBalance(),
                calculateTotalInvested(),
                portfolioValue,
                accountValue,
                totalProfitLoss,
                returnPercentage
        );
    }

    public List<Transaction> getTransactions() {
        return transactionRepository.findAll();
    }

    private void validateQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
    }

    private Transaction createTransaction(
            TransactionType type,
            Stock stock,
            int quantity,
            BigDecimal totalAmount
    ) {
        return new Transaction(
                type,
                stock.getSymbol(),
                stock.getCompanyName(),
                quantity,
                stock.getCurrentPrice(),
                totalAmount,
                Instant.now()
        );
    }
}