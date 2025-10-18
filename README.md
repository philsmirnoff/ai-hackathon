# 🚨 AI-Powered Fraud Detector - Real-time Financial Intelligence

A sophisticated real-time fraud detection system that combines AI models with rule-based analysis to identify suspicious financial transactions as they happen. Built for the "Build the future of finance with real-time data and AI" hackathon.
<img width="1440" height="900" alt="Screenshot 2025-10-15 at 4 14 29 PM" src="https://github.com/user-attachments/assets/813d6515-e714-4cd7-a5a8-ce141290d2ca" />

## 🎯 **What This Does**

This system monitors financial transactions in real-time and automatically flags potentially fraudulent activity using:
- **AI-powered analysis** with machine learning models
- **Rule-based detection** for known fraud patterns  
- **Real-time streaming** via Server-Sent Events
- **Interactive dashboard** for fraud analysts

## 🏗️ **Repository Structure**

```
fraud-detector/
├── 🤖 fraud_detection_service.py    # Python AI service (Flask + MCP)
├── 🔧 backend/                      # Node.js backend with SSE
│   ├── server.js                   # Express server + AI integration
│   └── package.json                # Backend dependencies
├── ⚛️ frontend/                     # React dashboard
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   └── types.ts                # TypeScript definitions
│   └── package.json                # Frontend dependencies
├── 📋 requirements.txt             # Python dependencies
├── 🚀 start_services.sh            # One-command startup script
└── 📖 README.md                    # This file
```

## 🔄 **How It Works**

1. **Transaction Data** flows into the system (currently mock data, ready for Lenses integration)
2. **AI Service** analyzes each transaction using rule-based + ML models
3. **Backend** streams results via Server-Sent Events to the dashboard
4. **Frontend** displays real-time fraud insights with filtering and search
5. **Fraud Analysts** can review flagged transactions and take action

## 🚀 Quick Start

### **Prerequisites**
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** (to clone the repository)

### **Setup**
```bash
# Clone the repository
git clone <repository-url>
cd fraud-detector

# Install Python dependencies
pip3 install -r requirements.txt

# Install Node.js dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### **Option 1: All-in-One Startup (Recommended)**
```bash
cd fraud-detector
./start_services.sh
```
This will start all services automatically:
- 🤖 Python AI Fraud Detection Service (port 5001)
- 🔧 Node.js Backend with SSE (port 8080)  
- ⚛️ React Frontend Dashboard (port 5173)

**Then open:** http://localhost:5173

### **Option 2: Manual Startup (Step by Step)**

#### **Step 1: Start Python AI Service**
```bash
cd fraud-detector
python3 fraud_detection_service.py
```
*Keep this terminal open - runs on port 5001*

#### **Step 2: Start Backend (New Terminal)**
```bash
cd fraud-detector/backend
npm start
```
*Keep this terminal open - runs on port 8080*

#### **Step 3: Start Frontend (New Terminal)**
```bash
cd fraud-detector/frontend
npm run dev
```
*Keep this terminal open - runs on port 5173*

#### **Step 4: Open Application**
Open your browser: **http://localhost:5173**

### **🔧 Troubleshooting**

**If you get port conflicts:**
```bash
# Clean up all services
pkill -f python3
pkill -f "npm start" 
pkill -f "vite"

# Or kill specific ports
lsof -ti:5001 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Install dependencies:**
```bash
# Python dependencies
pip3 install -r requirements.txt

# Node.js dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

**Check if services are running:**
```bash
# Check Python service
curl http://localhost:5001/health

# Check backend service  
curl http://localhost:8080/ws

# Check frontend (open in browser)
open http://localhost:5173
```

## 🏗️ **Technical Architecture**

### **Frontend (React Dashboard)**
- **Framework**: React 18 + TypeScript + Vite
- **Real-time**: Server-Sent Events (SSE) for live updates
- **UI**: Custom components with responsive design
- **State**: React hooks for real-time data management
- **Port**: 5173

### **Backend (Node.js API)**
- **Framework**: Express.js with CORS support
- **Streaming**: Server-Sent Events for real-time data
- **AI Integration**: HTTP calls to Python fraud detection service
- **Data**: Mock transaction generation (ready for Lenses integration)
- **Port**: 8080

### **AI Service (Python ML)**
- **Framework**: Flask with CORS support
- **ML Integration**: MCP client for AI model inference
- **Detection**: Rule-based + AI-powered fraud analysis
- **Scoring**: 0.0-1.0 confidence levels with risk labels
- **Port**: 5001

### **Data Flow**
```
Transaction Data → AI Analysis → Risk Scoring → SSE Stream → React Dashboard
     ↓                ↓              ↓            ↓              ↓
  Mock/Lenses → Python Service → Backend API → Real-time → Fraud Analyst
```

## 🔍 **Fraud Detection Logic**

### **Rule-Based Detection**
- **Merchant/Category Mismatch**: Shell Gas categorized as "Clothing"
- **Geographic Anomalies**: Los Angeles, PA (invalid city-state pairs)
- **Amount Thresholds**: High amounts for specific categories
- **Velocity Bursts**: Multiple rapid transactions from same card
- **High-Value Transactions**: Transactions over $1000

### **AI-Powered Analysis**
- **MCP Integration**: Uses AI models via MCP server
- **Contextual Analysis**: Time, location, spending patterns
- **Confidence Scoring**: 0.0-1.0 with explanations
- **Risk Labeling**: OK (0.0-0.34), REVIEW (0.35-0.59), LIKELY_FRAUD (0.60-1.0)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Dual AI + Rule-based detection** using MCP server integration
- **Real-time fraud scoring** with 0.0-1.0 confidence levels
- **Intelligent flagging** for merchant mismatches, geo anomalies, velocity bursts
- **Contextual explanations** generated by AI models

### 📊 Real-time Dashboard
- **Live fraud insights** streaming via SSE
- **Risk-based filtering** (OK, REVIEW, LIKELY_FRAUD)
- **Comprehensive search** across all transaction fields
- **Rich transaction cards** with detailed fraud analysis
- **Real-time statistics** including financial metrics and fraud indicators

### 🔧 Technical Features
- **Auto-retry** on connection loss
- **Performance optimized** (400 item cap)
- **Visual feedback** for new insights and fraud flags
- **Responsive design** for all screen sizes
- **Fallback mechanisms** when AI services are unavailable

## 🎯 Hackathon Focus

This project demonstrates:
- Real-time data streaming from Apache Kafka
- AI-powered fraud detection with Amazon Bedrock
- Modern React dashboard with TypeScript
- Server-Sent Events for live updates
- Financial use case with practical insights

## 📊 **Transaction Data Format**

The system processes transactions with comprehensive fraud analysis:

```typescript
{
  // Core identifiers
  event_id: string;           // Unique event identifier
  transaction_id: string;     // Transaction reference
  card_id: string;           // Card identifier
  customer_id: string;       // Customer reference
  
  // Transaction details
  merchant_id: string;       // Merchant identifier
  merchant_name: string;     // Merchant name (e.g., "Shell Gas")
  category: string;          // Transaction category (e.g., "Gas")
  amount: number;            // Transaction amount
  currency: string;          // Currency code (e.g., "USD")
  
  // Location data
  city: string;              // Transaction city
  state: string;             // Transaction state
  zip: string;               // ZIP code
  
  // Status and flags
  status: "approved" | "declined" | "pending";
  fraud_flag1: boolean;      // Rule-based flag 1
  fraud_flag2: boolean;      // Rule-based flag 2  
  fraud_flag3: boolean;      // Rule-based flag 3
  
  // AI analysis results
  risk: "OK" | "REVIEW" | "LIKELY_FRAUD";
  score: number;             // 0.0-1.0 confidence
  explanation: string;       // AI reasoning
  ai_flags: {                // AI-generated flags
    mismatch?: boolean;      // Merchant/category mismatch
    geo_invalid?: boolean;   // Geographic anomaly
    amount_high?: boolean;   // High amount for category
    velocity_burst?: boolean; // Rapid transactions
    high_amount?: boolean;   // Very high amount
  };
  
  // Timestamps
  ts: string;                // ISO timestamp
}
```

## 🔌 **Integration Ready**

### **Lenses SQL Integration**
The system is designed to integrate with Lenses for real-time transaction streaming:
- Replace mock data generation with Lenses SQL queries
- Connect to Kafka topics via Lenses
- Stream live transaction data for fraud analysis

### **MCP Server Integration**
- Configure MCP endpoint and AWS Bedrock tokens
- Use environment variables or AWS SSM parameters
- AI models provide enhanced fraud detection capabilities

## 🛠️ Development

The frontend automatically proxies `/ws` to the backend for development. In production, configure your reverse proxy accordingly.

## 🏆 Demo Ready

Perfect for hackathon demos with:
- Live data streaming
- Interactive filtering
- Clean, professional UI
- Real-time statistics
- Mobile responsive design

