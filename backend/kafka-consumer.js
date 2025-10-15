const { Kafka } = require('kafkajs');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class KafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'fraud-detector',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: process.env.KAFKA_USERNAME ? {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD
      } : undefined
    });
    
    this.consumer = this.kafka.consumer({ groupId: 'fraud-detector-group' });
    this.bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.clients = new Set();
  }

  async analyzeFraud(transaction) {
    try {
      const prompt = `Analyze this transaction for fraud: ${JSON.stringify(transaction)}. Return JSON with risk (OK/REVIEW/LIKELY_FRAUD), score (0-1), and explanation.`;
      
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const response = await this.bedrock.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      return JSON.parse(result.content[0].text);
    } catch (error) {
      console.error('Bedrock analysis failed:', error);
      return {
        risk: 'REVIEW',
        score: 0.5,
        explanation: 'Analysis unavailable'
      };
    }
  }

  async start(topic = 'transactions') {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const transaction = JSON.parse(message.value.toString());
          const analysis = await this.analyzeFraud(transaction);
          
          const insight = {
            event_id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            ...analysis,
            ts: new Date().toISOString(),
            ...transaction
          };

          this.broadcast(insight);
        } catch (error) {
          console.error('Message processing error:', error);
        }
      }
    });
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

module.exports = KafkaConsumer;