const state = {
  stocks: { status: "loading", data: [], error: "" },
  portfolio: { status: "loading", data: null, error: "" },
  performance: { status: "loading", data: null, error: "" },
  transactions: { status: "loading", data: [], error: "" },
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const quantityFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const $ = (selector) => document.querySelector(selector);
const elements = {
  marketBody: $("#market-body"),
  holdingsBody: $("#holdings-body"),
  performanceValues: $("#performance-values"),
  transactionsBody: $("#transactions-body"),
  tradeDialog: $("#trade-dialog"),
  tradeForm: $("#trade-form"),
  quantity: $("#quantity-input"),
  dialogError: $("#dialog-error"),
  submitTrade: $("#submit-trade"),
};

let selectedTrade = null;
let isTrading = false;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formattedMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? money.format(number) : "—";
}

function formattedPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${number > 0 ? "+" : ""}${percent.format(number)}%`;
}

function formattedQuantity(value) {
  const number = Number(value);
  return Number.isFinite(number) ? quantityFormat.format(number) : "—";
}

function valueTone(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "";
  return number > 0 ? "positive" : "negative";
}

function errorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let payload = null;
  const body = await response.text();
  if (body) {
    try {
      payload = JSON.parse(body);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status}). Please try again.`);
  }
  return payload;
}

function skeletonRows(count = 3) {
  return Array.from({ length: count }, () => '<tr><td colspan="8"><div class="skeleton-row" aria-hidden="true"></div></td></tr>').join("");
}

function emptyState(title, copy, iconPath) {
  return `<tr><td colspan="8">
    <div class="empty-state">
      <div class="empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none">${iconPath}</svg></div>
      <div class="empty-title">${escapeHtml(title)}</div>
      <div>${escapeHtml(copy)}</div>
    </div>
  </td></tr>`;
}

function failedState(message, resource) {
  return `<tr><td colspan="8"><div class="resource-state">
    <div class="empty-title">Couldn’t load ${escapeHtml(resource)}</div>
    <div>${escapeHtml(message)}</div>
    <button class="retry-button" type="button" data-action="retry" data-resource="${escapeHtml(resource)}">Try again</button>
  </div></td></tr>`;
}

function setTableMessageState(tableBody, isMessage) {
  tableBody.closest("table")?.classList.toggle("table--message", isMessage);
}

function setSummaryValue(id, value, tone = "", footId = null, footText = null) {
  const node = document.getElementById(id);
  node.textContent = value;
  node.classList.remove("positive", "negative");
  if (tone) node.classList.add(tone);
  if (footId && footText !== null) document.getElementById(footId).textContent = footText;
}

function renderSummary() {
  const { status, data, error } = state.portfolio;
  if (status === "loading") {
    ["summary-cash", "summary-portfolio", "summary-invested", "summary-pl", "summary-pct"].forEach((id) => {
      setSummaryValue(id, "—");
    });
    $("#summary-cash-foot").textContent = "Loading account";
    return;
  }
  if (status === "error" || !data) {
    ["summary-cash", "summary-portfolio", "summary-invested", "summary-pl", "summary-pct"].forEach((id) => {
      setSummaryValue(id, "—");
    });
    $("#summary-cash-foot").textContent = `Unavailable · ${error}`;
    return;
  }
  const pl = Number(data.totalProfitLoss);
  const plPercent = Number(data.profitLossPercentage);
  setSummaryValue("summary-cash", formattedMoney(data.availableCash));
  setSummaryValue("summary-portfolio", formattedMoney(data.portfolioValue));
  setSummaryValue("summary-invested", formattedMoney(data.totalInvested));
  setSummaryValue("summary-pl", formattedMoney(data.totalProfitLoss), valueTone(pl));
  setSummaryValue("summary-pct", formattedPercent(data.profitLossPercentage), valueTone(plPercent));
  $("#summary-cash-foot").textContent = "Ready to trade";
}

function sortedStocks(stocks) {
  const query = $("#stock-search").value.trim().toLowerCase();
  const sort = $("#stock-sort").value;
  const filtered = stocks.filter((stock) =>
    `${stock.symbol ?? ""} ${stock.companyName ?? ""}`.toLowerCase().includes(query),
  );
  const comparators = {
    "price-high": (a, b) => Number(b.currentPrice) - Number(a.currentPrice),
    "price-low": (a, b) => Number(a.currentPrice) - Number(b.currentPrice),
    "change-high": (a, b) => Number(b.priceChange) - Number(a.priceChange),
    "change-low": (a, b) => Number(a.priceChange) - Number(b.priceChange),
    symbol: (a, b) => String(a.symbol ?? "").localeCompare(String(b.symbol ?? "")),
  };
  return filtered.sort(comparators[sort] || comparators.symbol);
}

function renderMarket() {
  setTableMessageState(elements.marketBody, false);
  const resource = state.stocks;
  if (resource.status === "loading") {
    $("#market-count").textContent = "Loading simulated market";
    elements.marketBody.innerHTML = skeletonRows(4);
    return;
  }
  if (resource.status === "error") {
    setTableMessageState(elements.marketBody, true);
    $("#market-count").textContent = "Market data unavailable";
    elements.marketBody.innerHTML = failedState(resource.error, "market data");
    return;
  }

  const stocks = sortedStocks(resource.data);
  $("#market-count").textContent = `${resource.data.length} ${resource.data.length === 1 ? "stock" : "stocks"} · Simulated prices`;
  if (!stocks.length) {
    setTableMessageState(elements.marketBody, true);
    elements.marketBody.innerHTML = emptyState(
      resource.data.length ? "No matching stocks" : "Market list is empty",
      resource.data.length ? "Try another symbol or company name." : "No stocks were returned by the market service.",
      '<path d="M4 19V9.5l4-3 4 3 7-6M15 3.5H19v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    );
    return;
  }

  elements.marketBody.innerHTML = stocks.map((stock) => {
    const change = Number(stock.priceChange);
    const changeClass = valueTone(change);
    const sign = change > 0 ? "+" : "";
    return `<tr>
      <td><div class="stock-id"><span class="ticker-badge">${escapeHtml(stock.symbol)}</span><div><div class="ticker-symbol">${escapeHtml(stock.symbol)}</div><div class="company-name">${escapeHtml(stock.companyName)}</div></div></div></td>
      <td class="num">${formattedMoney(stock.currentPrice)}</td>
      <td><span class="change-pill ${changeClass}">${Number.isFinite(change) ? `${sign}${formattedMoney(change)}` : "—"}</span></td>
      <td><button class="btn btn-buy" type="button" data-action="buy" data-symbol="${escapeHtml(stock.symbol)}" aria-label="Buy ${escapeHtml(stock.symbol)}">Buy</button></td>
    </tr>`;
  }).join("");
}

function holdingsFromPortfolio() {
  const holdings = state.portfolio.data?.holdings;
  if (!holdings || typeof holdings !== "object") return [];
  const prices = new Map(state.stocks.data.map((stock) => [stock.symbol, stock]));
  return Object.entries(holdings).map(([symbol, holding]) => {
    const stock = prices.get(symbol) || holding.stock || {};
    const quantity = Number(holding.quantity);
    const averageBuyPrice = Number(holding.averageBuyPrice);
    const currentPrice = Number(stock.currentPrice);
    const currentValue = quantity * currentPrice;
    const cost = quantity * averageBuyPrice;
    const profitLoss = currentValue - cost;
    const profitLossPercentage = cost ? (profitLoss / cost) * 100 : 0;
    return { symbol, stock, quantity, averageBuyPrice, currentPrice, currentValue, profitLoss, profitLossPercentage };
  });
}

function renderHoldings() {
  setTableMessageState(elements.holdingsBody, false);
  const resource = state.portfolio;
  if (resource.status === "loading") {
    elements.holdingsBody.innerHTML = skeletonRows(3);
    return;
  }
  if (resource.status === "error") {
    setTableMessageState(elements.holdingsBody, true);
    elements.holdingsBody.innerHTML = failedState(resource.error, "portfolio holdings");
    return;
  }
  const holdings = holdingsFromPortfolio();
  if (!holdings.length) {
    setTableMessageState(elements.holdingsBody, true);
    elements.holdingsBody.innerHTML = emptyState(
      "No holdings yet",
      "Buy a stock from Market watch to start your simulated portfolio.",
      '<path d="M4 18h16M6 15V9m4 6V5m4 10v-4m4 4V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    );
    return;
  }
  elements.holdingsBody.innerHTML = holdings.map((holding) => `
    <tr>
      <td><div class="stock-id"><span class="ticker-badge">${escapeHtml(holding.symbol)}</span><div><div class="ticker-symbol">${escapeHtml(holding.symbol)}</div><div class="company-name">${escapeHtml(holding.stock.companyName)}</div></div></div></td>
      <td class="num">${formattedQuantity(holding.quantity)}</td>
      <td class="num">${formattedMoney(holding.averageBuyPrice)}</td>
      <td class="num">${formattedMoney(holding.currentPrice)}</td>
      <td class="num">${formattedMoney(holding.currentValue)}</td>
      <td class="num ${valueTone(holding.profitLoss)}">${formattedMoney(holding.profitLoss)}</td>
      <td class="num ${valueTone(holding.profitLossPercentage)}">${formattedPercent(holding.profitLossPercentage)}</td>
      <td><button class="btn btn-sell" type="button" data-action="sell" data-symbol="${escapeHtml(holding.symbol)}" aria-label="Sell ${escapeHtml(holding.symbol)}">Sell</button></td>
    </tr>`).join("");
}

function renderPerformance() {
  const resource = state.performance;
  const returnValue = $("#performance-return");
  returnValue.classList.remove("positive", "negative");
  if (resource.status === "loading") {
    returnValue.textContent = "—";
    elements.performanceValues.innerHTML = `<div class="perf-item"><div class="perf-label">Account details</div><div class="perf-value">Loading performance</div></div>`;
    $("#return-track-fill").style.width = "0%";
    return;
  }
  if (resource.status === "error" || !resource.data) {
    returnValue.textContent = "Unavailable";
    elements.performanceValues.innerHTML = `<div class="perf-item"><div class="perf-label">Performance data</div><div class="perf-value">${escapeHtml(resource.error || "Unavailable")}</div><button class="retry-button" type="button" data-action="retry" data-resource="performance">Try again</button></div>`;
    $("#return-track-fill").style.width = "0%";
    return;
  }
  const data = resource.data;
  const returnPercentage = Number(data.returnPercentage);
  const tone = valueTone(returnPercentage);
  returnValue.textContent = formattedPercent(data.returnPercentage);
  if (tone) returnValue.classList.add(tone);
  $("#return-track-fill").style.width = `${Math.min(100, Math.max(2, Math.abs(returnPercentage)))}%`;
  $("#return-track-fill").style.background = returnPercentage < 0 ? "var(--red)" : "var(--green)";
  const metrics = [
    ["Initial cash", data.initialCashBalance],
    ["Current cash", data.currentCashBalance],
    ["Total invested", data.totalInvested],
    ["Current portfolio value", data.currentPortfolioValue],
    ["Total account value", data.totalAccountValue],
    ["Total profit / loss", data.totalProfitLoss],
  ];
  elements.performanceValues.innerHTML = metrics.map(([label, value]) => {
    const metricTone = label === "Total profit / loss" ? valueTone(value) : "";
    return `<div class="perf-item"><div class="perf-label">${label}</div><div class="perf-value ${metricTone}">${formattedMoney(value)}</div></div>`;
  }).join("");
}

function formattedDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? escapeHtml(value || "—") : dateFormat.format(date);
}

function renderTransactions() {
  setTableMessageState(elements.transactionsBody, false);
  const resource = state.transactions;
  if (resource.status === "loading") {
    $("#transactions-count").textContent = "Loading activity";
    elements.transactionsBody.innerHTML = skeletonRows(3);
    return;
  }
  if (resource.status === "error") {
    setTableMessageState(elements.transactionsBody, true);
    $("#transactions-count").textContent = "History unavailable";
    elements.transactionsBody.innerHTML = failedState(resource.error, "transaction history");
    return;
  }
  const query = $("#transaction-search").value.trim().toLowerCase();
  const transactions = [...resource.data]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter((transaction) => `${transaction.type ?? ""} ${transaction.stockSymbol ?? ""} ${transaction.companyName ?? ""}`.toLowerCase().includes(query));
  $("#transactions-count").textContent = `${transactions.length} ${transactions.length === 1 ? "transaction" : "transactions"} · Newest first`;
  if (!transactions.length) {
    setTableMessageState(elements.transactionsBody, true);
    elements.transactionsBody.innerHTML = emptyState(
      resource.data.length ? "No matching activity" : "No transactions yet",
      resource.data.length ? "Try searching for another symbol or company." : "Your completed simulated trades will appear here.",
      '<path d="M6 4h12v16H6zM9 8h6m-6 4h6m-6 4h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    );
    return;
  }
  elements.transactionsBody.innerHTML = transactions.map((transaction) => {
    const type = String(transaction.type || "").toUpperCase();
    const typeClass = type === "BUY" ? "buy" : "sell";
    return `<tr>
      <td><span class="transaction-type ${typeClass}">${escapeHtml(type)}</span></td>
      <td><span class="ticker-symbol">${escapeHtml(transaction.stockSymbol)}</span></td>
      <td>${escapeHtml(transaction.companyName)}</td>
      <td class="num">${formattedQuantity(transaction.quantity)}</td>
      <td class="num">${formattedMoney(transaction.price)}</td>
      <td class="num">${formattedMoney(transaction.totalAmount)}</td>
      <td class="timestamp">${formattedDate(transaction.timestamp)}</td>
    </tr>`;
  }).join("");
}

function renderResource(name) {
  if (name === "stocks") renderMarket();
  if (name === "portfolio") {
    renderSummary();
    renderHoldings();
  }
  if (name === "performance") renderPerformance();
  if (name === "transactions") renderTransactions();
}

async function loadResource(name, { keepContent = false } = {}) {
  const endpoints = {
    stocks: ["/api/stocks", (data) => {
      if (!Array.isArray(data)) throw new Error("The market service returned an unexpected response.");
      return data;
    }],
    portfolio: ["/api/portfolio", (data) => data],
    performance: ["/api/portfolio/performance", (data) => data],
    transactions: ["/api/transactions", (data) => {
      if (!Array.isArray(data)) throw new Error("The transaction service returned an unexpected response.");
      return data;
    }],
  };
  const [url, validate] = endpoints[name];
  if (!(keepContent && state[name].status === "success")) {
    state[name].status = "loading";
    state[name].error = "";
    renderResource(name);
  }
  try {
    const response = await apiRequest(url);
    state[name].data = validate(response);
    state[name].status = "success";
    state[name].error = "";
  } catch (error) {
    state[name].status = "error";
    state[name].error = errorMessage(error);
  }
  renderResource(name);
}

async function refreshDashboard({ stocks = true } = {}) {
  const resources = ["portfolio", "performance", "transactions"];
  if (stocks) resources.unshift("stocks");
  await Promise.all(resources.map((name) => loadResource(name)));
}

function showToast(title, message, kind = "success") {
  const region = $("#toast-region");
  const toast = document.createElement("div");
  toast.className = `toast${kind === "error" ? " error" : ""}`;
  toast.setAttribute("role", kind === "error" ? "alert" : "status");
  toast.innerHTML = `<span class="toast-mark" aria-hidden="true">${kind === "error" ? "!" : "OK"}</span><div class="toast-text"><div class="toast-title">${escapeHtml(title)}</div><div>${escapeHtml(message)}</div></div>`;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 5200);
}

function openTradeDialog(type, stock, holding = null) {
  if (!stock) return;
  selectedTrade = { type, stock, holding };
  $("#dialog-title").textContent = type === "BUY" ? "Buy stock" : "Sell stock";
  $("#dialog-copy").textContent = type === "BUY"
    ? "Enter a share quantity to place a simulated order."
    : "Choose how many shares to sell from this position.";
  $("#dialog-symbol-badge").textContent = stock.symbol || "";
  $("#dialog-symbol").textContent = stock.symbol || "";
  $("#dialog-company").textContent = stock.companyName || "";
  $("#dialog-price").textContent = formattedMoney(stock.currentPrice);
  $("#quantity-hint").textContent = type === "SELL"
    ? `You own ${formattedQuantity(holding.quantity)} shares.`
    : "Enter a whole number of shares greater than zero.";
  elements.quantity.value = "";
  elements.quantity.max = type === "SELL" ? String(holding.quantity) : "";
  elements.dialogError.textContent = "";
  elements.submitTrade.textContent = type === "BUY" ? "Confirm buy" : "Confirm sell";
  elements.submitTrade.classList.toggle("btn-buy", type === "BUY");
  elements.submitTrade.classList.toggle("btn-sell", type === "SELL");
  elements.submitTrade.disabled = false;
  $("#close-dialog").disabled = false;
  $("#cancel-trade").disabled = false;
  elements.tradeDialog.showModal();
  window.requestAnimationFrame(() => elements.quantity.focus());
}

function closeTradeDialog() {
  if (elements.tradeDialog.open) elements.tradeDialog.close();
  elements.tradeForm.reset();
  elements.dialogError.textContent = "";
  selectedTrade = null;
  isTrading = false;
  elements.submitTrade.disabled = false;
  $("#close-dialog").disabled = false;
  $("#cancel-trade").disabled = false;
}

async function submitTrade(event) {
  event.preventDefault();
  if (!selectedTrade || isTrading) return;
  const quantity = Number(elements.quantity.value);
  const { type, stock, holding } = selectedTrade;
  if (!Number.isInteger(quantity) || quantity <= 0) {
    elements.dialogError.textContent = "Enter a whole number of shares greater than zero.";
    elements.quantity.focus();
    return;
  }
  if (type === "SELL" && quantity > Number(holding.quantity)) {
    elements.dialogError.textContent = `You can sell up to ${formattedQuantity(holding.quantity)} shares.`;
    elements.quantity.focus();
    return;
  }

  isTrading = true;
  elements.submitTrade.disabled = true;
  $("#close-dialog").disabled = true;
  $("#cancel-trade").disabled = true;
  elements.submitTrade.textContent = type === "BUY" ? "Placing buy…" : "Placing sell…";
  elements.dialogError.textContent = "";
  try {
    const result = await apiRequest(type === "BUY" ? "/api/trade/buy" : "/api/trade/sell", {
      method: "POST",
      body: JSON.stringify({ symbol: stock.symbol, quantity }),
    });
    closeTradeDialog();
    const transaction = result?.transaction;
    const detail = transaction
      ? `${type === "BUY" ? "Bought" : "Sold"} ${formattedQuantity(transaction.quantity)} ${transaction.stockSymbol} at ${formattedMoney(transaction.price)} per share.`
      : `${type === "BUY" ? "Buy" : "Sell"} order completed.`;
    showToast("Trade completed", detail);
    await refreshDashboard({ stocks: false });
  } catch (error) {
    isTrading = false;
    elements.submitTrade.disabled = false;
    $("#close-dialog").disabled = false;
    $("#cancel-trade").disabled = false;
    elements.submitTrade.textContent = type === "BUY" ? "Confirm buy" : "Confirm sell";
    elements.dialogError.textContent = errorMessage(error);
    elements.quantity.focus();
  }
}

function handleAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, symbol, resource } = button.dataset;
  if (action === "buy") {
    const stock = state.stocks.data.find((item) => item.symbol === symbol);
    openTradeDialog("BUY", stock);
  }
  if (action === "sell") {
    const holding = holdingsFromPortfolio().find((item) => item.symbol === symbol);
    if (holding) openTradeDialog("SELL", holding.stock, holding);
  }
  if (action === "retry" && resource) {
    const key = resource === "market data" ? "stocks"
      : resource === "portfolio holdings" ? "portfolio"
      : resource === "transaction history" ? "transactions"
      : resource;
    if (["stocks", "portfolio", "performance", "transactions"].includes(key)) loadResource(key);
  }
}

function initialize() {
  $("#current-date").textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  $("#stock-search").addEventListener("input", renderMarket);
  $("#stock-sort").addEventListener("change", renderMarket);
  $("#transaction-search").addEventListener("input", renderTransactions);
  $("#refresh-button").addEventListener("click", () => refreshDashboard());
  document.addEventListener("click", handleAction);
  $("#close-dialog").addEventListener("click", closeTradeDialog);
  $("#cancel-trade").addEventListener("click", closeTradeDialog);
  elements.tradeForm.addEventListener("submit", submitTrade);
  elements.tradeDialog.addEventListener("click", (event) => {
    if (event.target === elements.tradeDialog && !isTrading) closeTradeDialog();
  });
  elements.tradeDialog.addEventListener("cancel", (event) => {
    if (isTrading) event.preventDefault();
  });
  elements.tradeDialog.addEventListener("close", () => {
    selectedTrade = null;
    isTrading = false;
    elements.submitTrade.disabled = false;
  });

  refreshDashboard();
}

initialize();