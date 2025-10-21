const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class MCPTopicConsumer {
  constructor(mcpUrl = process.env.MCP_SERVER_URL) {
    this.mcpUrl = mcpUrl;
    this.clients = new Set();
    this.topics = ['credit-card-transactions', 'user-activity', 'merchant-data'];
  }

  async callMCPTool(toolName, args = {}) {
    try {
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        })
      });

      const data = await response.json();
      return data.result?.content || [];
    } catch (error) {
      console.error(`MCP tool ${toolName} failed:`, error);
      return [];
    }
  }

  async queryTopic(topic, limit = 5) {
    return await this.callMCPTool('query_topic', { topic, limit });
  }

  async listTopics() {
    return await this.callMCPTool('list_topics');
  }

  async startMultiTopicStreaming() {
    // Query all topics and merge data
    setInterval(async () => {
      for (const topic of this.topics) {
        const records = await this.queryTopic(topic, 1);
        records.forEach(record => {
          this.broadcast({
            event_id: `evt_${Date.now()}_${Math.random()}`,
            topic,
            risk: this.calculateRisk(record),
            score: Math.random(),
            explanation: `Analysis from ${topic}`,
            ts: new Date().toISOString(),
            ...record
          });
        });
      }
    }, 3000);
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

  addClient(client) { this.clients.add(client); }
  removeClient(client) { this.clients.delete(client); }
}

module.exports = MCPTopicConsumer;