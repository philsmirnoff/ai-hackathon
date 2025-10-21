const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class LensesMCPClient {
  constructor(mcpUrl = process.env.MCP_SERVER_URL || 'http://108.129.168.213:8080/mcp') {
    this.mcpUrl = mcpUrl;
    this.clients = new Set();
  }

  async queryTopic(topic = 'credit-card-transactions', limit = 10) {
    try {
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'query_topic',
            arguments: { topic, limit }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      if (!text.trim()) {
        return this.generateDemoData(limit);
      }

      const data = JSON.parse(text);
      return data.result?.content || this.generateDemoData(limit);
    } catch (error) {
      console.log('MCP unavailable, using demo data');
      return this.generateDemoData(limit);
    }
  }

  generateDemoData(limit = 1) {
    const merchants = ['Amazon', 'Walmart', 'Shell', 'Starbucks'];
    const data = [];
    for (let i = 0; i < limit; i++) {
      data.push({
        transaction_id: `tx_${Date.now()}_${i}`,
        amount: Math.floor(Math.random() * 1000),
        merchant: merchants[Math.floor(Math.random() * merchants.length)],
        user_id: `user_${Math.floor(Math.random() * 1000)}`
      });
    }
    return data;
  }

  async startStreaming() {
    // Fetch initial data
    const initialData = await this.queryTopic();
    
    // Broadcast initial data
    initialData.forEach(record => {
      this.broadcast(this.formatRecord(record));
    });

    // Simulate streaming by polling every 5 seconds
    setInterval(async () => {
      const newData = await this.queryTopic('credit-card-transactions', 1);
      newData.forEach(record => {
        this.broadcast(this.formatRecord(record));
      });
    }, 5000);
  }

  formatRecord(record) {
    return {
      event_id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      risk: this.calculateRisk(record),
      score: Math.random(),
      explanation: 'MCP-sourced transaction analysis',
      ts: new Date().toISOString(),
      ...record
    };
  }

  calculateRisk(record) {
    const amount = record.amount || 0;
    if (amount > 1000) return 'LIKELY_FRAUD';
    if (amount > 500) return 'REVIEW';
    return 'OK';
  }

  broadcast(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      if (!client.destroyed) {
        client.write(message);
      }
    });
  }

  addClient(client) {
    this.clients.add(client);
  }

  removeClient(client) {
    this.clients.delete(client);
  }
}

module.exports = LensesMCPClient;