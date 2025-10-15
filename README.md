# Fraud Detector - AI Hackathon Project

A real-time fraud detection system built for the "Build the future of finance with real-time data and AI" hackathon.

## 🚀 Quick Start

### Frontend (React Dashboard)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Backend (Demo Server)
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:8080

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Real-time**: Server-Sent Events (SSE)
- **Backend**: Express.js with SSE streaming
- **Data Flow**: Kafka → Bedrock → SSE → React

## ✨ Features

- **Real-time fraud insights** streaming via SSE
- **Risk-based filtering** (OK, REVIEW, LIKELY_FRAUD)
- **Live search** across all fields
- **Responsive dashboard** with card-based layout
- **Auto-retry** on connection loss
- **Performance optimized** (400 item cap)
- **Visual feedback** for new insights

## 🎯 Hackathon Focus

This project demonstrates:
- Real-time data streaming from Apache Kafka
- AI-powered fraud detection with Amazon Bedrock
- Modern React dashboard with TypeScript
- Server-Sent Events for live updates
- Financial use case with practical insights

## 📊 Data Format

```typescript
{
  event_id: string;
  risk: "OK" | "REVIEW" | "LIKELY_FRAUD";
  score: number;        // 0..1
  explanation: string;  // AI reasoning
  ts: string;           // ISO timestamp
  user_id?: string;
  amount?: number;
  merchant?: string;
}
```

## 🛠️ Development

The frontend automatically proxies `/ws` to the backend for development. In production, configure your reverse proxy accordingly.

## 🏆 Demo Ready

Perfect for hackathon demos with:
- Live data streaming
- Interactive filtering
- Clean, professional UI
- Real-time statistics
- Mobile responsive design

