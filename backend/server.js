require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const LensesMCPClient = require('./lenses-mcp-client');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Python fraud detection service URL
const FRAUD_SERVICE_URL = process.env.FRAUD_SERVICE_URL || 'http://localhost:5001';

// Initialize MCP client
const mcpClient = new LensesMCPClient();
mcpClient.startStreaming().catch(console.error);

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

// Function to call Python fraud detection service
async function analyzeWithAI(transactionData) {
  try {
    const response = await axios.post(`${FRAUD_SERVICE_URL}/analyze`, transactionData, {
      timeout: 5000 // 5 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('AI fraud detection error:', error.message);
    // Fallback to rule-based scoring
    return {
      risk: "REVIEW",
      score: 0.5,
      explanation: "AI analysis unavailable - using fallback",
      flags: {}
    };
  }
}

async function generateInsight(riskLevel, explanation) {
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const amount = Math.floor(Math.random() * 50000) / 100; // 0.01 to 500.00
  const statuses = ["approved", "declined", "pending"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Create base transaction data
  const baseTransaction = {
    event_id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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

  // Try to get AI analysis
  try {
    const aiResult = await analyzeWithAI(baseTransaction);
    return {
      ...baseTransaction,
      risk: aiResult.risk || riskLevel,
      score: aiResult.score || (riskLevel === "OK" ? Math.random() * 0.3 : riskLevel === "REVIEW" ? 0.3 + Math.random() * 0.4 : 0.7 + Math.random() * 0.3),
      explanation: aiResult.explanation || explanation,
      ai_flags: aiResult.flags || {}
    };
  } catch (error) {
    // Fallback to original logic
    return {
      ...baseTransaction,
      risk: riskLevel,
      score: riskLevel === "OK" ? Math.random() * 0.3 : riskLevel === "REVIEW" ? 0.3 + Math.random() * 0.4 : 0.7 + Math.random() * 0.3,
      explanation: explanation,
      ai_flags: {}
    };
  }
}

// Sample fraud insights data (will be populated asynchronously)
let sampleInsights = [];

// Initialize sample insights
async function initializeSampleInsights() {
  try {
    sampleInsights = [
      await generateInsight("OK", "Low risk transaction from trusted merchant"),
      await generateInsight("REVIEW", "Unusual spending pattern detected"),
      await generateInsight("LIKELY_FRAUD", "High risk: Multiple failed attempts from new location")
    ];
  } catch (error) {
    console.error('Error initializing sample insights:', error);
    // Fallback to basic insights
    sampleInsights = [
      {
        event_id: "evt_sample_001",
        risk: "OK",
        score: 0.15,
        explanation: "Low risk transaction from trusted merchant",
        ts: new Date().toISOString(),
        transaction_id: "CC-0000000001",
        card_id: "CC-0000000001",
        customer_id: "CUST-000001",
        merchant_id: "MERCH-000001",
        card_number: "****-****-****-1234",
        merchant_name: "Coffee Shop",
        category: "Dining",
        amount: 25.99,
        currency: "USD",
        city: "San Francisco",
        state: "CA",
        zip: 94102,
        status: "approved",
        fraud_flag1: false,
        fraud_flag2: false,
        fraud_flag3: false,
        ai_flags: {}
      }
    ];
  }
}

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
  mcpClient.addClient(res);

  console.log(`Client ${clientId} connected`);

  // Send initial sample data
  sampleInsights.forEach(insight => {
    res.write(`data: ${JSON.stringify(insight)}

`);
  });

  req.on('close', () => {
    mcpClient.removeClient(res);
    console.log(`Client ${clientId} disconnected`);
  });
});

// Initialize and start server
async function startServer() {
  try {
    await initializeSampleInsights();
    console.log('Sample insights initialized');
  } catch (error) {
    console.error('Error initializing sample insights:', error);
  }

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`SSE endpoint available at http://localhost:${PORT}/ws`);
    console.log(`Fraud detection service: ${FRAUD_SERVICE_URL}`);
  });
}

startServer();