const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Store connected clients
const clients = new Set();

// Sample fraud insights data
const sampleInsights = [
  {
    event_id: "evt_001",
    risk: "OK",
    score: 0.15,
    explanation: "Low risk transaction from trusted merchant",
    ts: new Date().toISOString(),
    user_id: "user_123",
    amount: 25.99,
    merchant: "Coffee Shop"
  },
  {
    event_id: "evt_002", 
    risk: "REVIEW",
    score: 0.65,
    explanation: "Unusual spending pattern detected",
    ts: new Date().toISOString(),
    user_id: "user_456",
    amount: 1250.00,
    merchant: "Electronics Store"
  },
  {
    event_id: "evt_003",
    risk: "LIKELY_FRAUD", 
    score: 0.92,
    explanation: "High risk: Multiple failed attempts from new location",
    ts: new Date().toISOString(),
    user_id: "user_789",
    amount: 5000.00,
    merchant: "Online Casino"
  }
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

    const newInsight = {
      event_id: `evt_${Date.now()}`,
      risk: sampleInsights[Math.floor(Math.random() * sampleInsights.length)].risk,
      score: Math.random(),
      explanation: `Real-time fraud analysis: ${Math.random() > 0.5 ? 'Suspicious activity' : 'Normal transaction pattern'}`,
      ts: new Date().toISOString(),
      user_id: `user_${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 10000) / 100,
      merchant: ['Amazon', 'Starbucks', 'Gas Station', 'Restaurant', 'Online Store'][Math.floor(Math.random() * 5)]
    };

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
