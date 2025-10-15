const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Store connected clients
const clients = new Set();

// Sample transaction data based on the provided format
const merchants = [
  { name: "Shell Gas", category: "Gas" },
  { name: "Nike", category: "Clothing" },
  { name: "Chevron", category: "Groceries" },
  { name: "Costco", category: "Shopping" },
  { name: "Walmart", category: "Clothing" },
  { name: "Whole Foods", category: "Gas" },
  { name: "Home Depot", category: "Clothing" },
  { name: "Apple Store", category: "Healthcare" },
  { name: "Starbucks", category: "Entertainment" },
  { name: "Macy's", category: "Travel" },
  { name: "McDonald's", category: "Clothing" },
  { name: "Target", category: "Travel" },
  { name: "Best Buy", category: "Entertainment" },
  { name: "Nordstrom", category: "Gas" }
];

const cities = ["Los Angeles", "Phoenix", "San Diego", "Chicago", "Dallas", "New York", "Philadelphia", "Houston", "San Jose", "San Antonio"];
const states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "NC", "AZ", "GA"];

function generateCardNumber() {
  return `****-****-****-${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateTransactionId() {
  return `CC-${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

function generateCustomerId() {
  return `CUST-${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`;
}

function generateMerchantId() {
  return `MERCH-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`;
}

function generateZip() {
  return Math.floor(Math.random() * 90000) + 10000;
}

function generateInsight(riskLevel, explanation) {
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const amount = Math.floor(Math.random() * 50000) / 100; // 0.01 to 500.00
  const statuses = ["approved", "declined", "pending"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    event_id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    risk: riskLevel,
    score: riskLevel === "OK" ? Math.random() * 0.3 : riskLevel === "REVIEW" ? 0.3 + Math.random() * 0.4 : 0.7 + Math.random() * 0.3,
    explanation: explanation,
    ts: new Date().toISOString(),
    transaction_id: generateTransactionId(),
    card_id: generateTransactionId(),
    customer_id: generateCustomerId(),
    merchant_id: generateMerchantId(),
    card_number: generateCardNumber(),
    merchant_name: merchant.name,
    category: merchant.category,
    amount: amount,
    currency: "USD",
    city: city,
    state: state,
    zip: generateZip(),
    status: status,
    fraud_flag1: Math.random() > 0.8,
    fraud_flag2: Math.random() > 0.9,
    fraud_flag3: Math.random() > 0.95
  };
}

// Sample fraud insights data
const sampleInsights = [
  generateInsight("OK", "Low risk transaction from trusted merchant"),
  generateInsight("REVIEW", "Unusual spending pattern detected"),
  generateInsight("LIKELY_FRAUD", "High risk: Multiple failed attempts from new location")
];

// SSE endpoint
app.get('/ws', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const clientId = Date.now();
  clients.add(res);

  console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);

  // Send initial data
  sampleInsights.forEach(insight => {
    res.write(`data: ${JSON.stringify(insight)}\n\n`);
  });

  // Send new insights every 3-5 seconds
  const interval = setInterval(() => {
    if (res.destroyed) {
      clearInterval(interval);
      return;
    }

    const riskLevels = ["OK", "REVIEW", "LIKELY_FRAUD"];
    const explanations = [
      "Low risk transaction from trusted merchant",
      "Unusual spending pattern detected", 
      "High risk: Multiple failed attempts from new location",
      "Suspicious merchant category for this customer",
      "Transaction amount exceeds normal spending pattern",
      "New location detected for this card",
      "Multiple rapid transactions detected",
      "Card used at high-risk merchant",
      "Unusual time of day for this customer",
      "Geographic anomaly detected"
    ];
    
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const explanation = explanations[Math.floor(Math.random() * explanations.length)];
    
    const newInsight = generateInsight(riskLevel, explanation);

    res.write(`data: ${JSON.stringify(newInsight)}\n\n`);
  }, Math.random() * 2000 + 3000);

  req.on('close', () => {
    clients.delete(res);
    clearInterval(interval);
    console.log(`Client ${clientId} disconnected. Total clients: ${clients.size}`);
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint available at http://localhost:${PORT}/ws`);
});
