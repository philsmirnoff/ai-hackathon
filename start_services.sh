#!/bin/bash

# Start AI-Powered Fraud Detection Services
echo "🚀 Starting AI-Powered Fraud Detection Services..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is required but not installed."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd "$(dirname "$0")"
pip3 install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd backend
npm install
cd ../frontend
npm install
cd ..

# Start Python fraud detection service in background
echo "🤖 Starting Python fraud detection service..."
python3 fraud_detection_service.py &
PYTHON_PID=$!

# Wait a moment for Python service to start
sleep 3

# Start Node.js backend in background
echo "🔧 Starting Node.js backend..."
cd backend
npm start &
NODE_PID=$!

# Wait a moment for backend to start
sleep 3

# Start React frontend
echo "⚛️ Starting React frontend..."
cd ../frontend
npm run dev &
REACT_PID=$!

echo ""
echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8080"
echo "🤖 AI Service: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $PYTHON_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for any process to exit
wait
