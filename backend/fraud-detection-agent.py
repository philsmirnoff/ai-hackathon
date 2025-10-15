import os
import json
import boto3
from strands import Agent, tool
from strands.tools.mcp import MCPClient
from mcp.client.streamable_http import streamablehttp_client

# Configure AWS Bedrock model
MODEL_ID = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"

@tool
def query_fraud_transactions(topic="credit-card-transactions", limit=10):
    """Query real-time fraud transactions from Lenses.io via MCP"""
    try:
        # Connect to your Lenses MCP server
        mcp_client = MCPClient("http://108.129.168.213:8080/mcp")
        
        # Query the topic
        result = mcp_client.call_tool("query_topic", {
            "topic": topic,
            "limit": limit
        })
        
        return result
    except Exception as e:
        return f"Error querying transactions: {e}"

@tool
def analyze_fraud_pattern(transactions):
    """Analyze fraud patterns in transaction data"""
    fraud_count = sum(1 for t in transactions if t.get('risk') == 'LIKELY_FRAUD')
    total = len(transactions)
    
    return {
        "total_transactions": total,
        "fraud_transactions": fraud_count,
        "fraud_rate": fraud_count / total if total > 0 else 0,
        "risk_summary": "High fraud activity detected" if fraud_count > total * 0.3 else "Normal activity"
    }

@tool
def get_real_time_insights():
    """Get real-time fraud detection insights from streaming data"""
    # Query latest transactions
    transactions = query_fraud_transactions(limit=20)
    
    # Analyze patterns
    analysis = analyze_fraud_pattern(transactions)
    
    return {
        "timestamp": "2024-10-15T17:45:00Z",
        "latest_transactions": transactions[:5],  # Show top 5
        "pattern_analysis": analysis
    }

def create_fraud_detection_agent():
    """Create a Strands agent for fraud detection using Lenses.io data"""
    
    system_prompt = """
    You are a real-time fraud detection agent that analyzes streaming transaction data from Lenses.io.
    
    Your capabilities:
    1. Query real-time transaction data from Kafka topics
    2. Analyze fraud patterns and trends
    3. Provide actionable insights for fraud prevention
    4. Generate alerts for suspicious activities
    
    Always use the available tools to get fresh data before making assessments.
    Provide clear, actionable recommendations based on the streaming data.
    """
    
    return Agent(
        model=MODEL_ID,
        tools=[
            query_fraud_transactions,
            analyze_fraud_pattern,
            get_real_time_insights
        ],
        system_prompt=system_prompt
    )

def main():
    # Create the fraud detection agent
    fraud_agent = create_fraud_detection_agent()
    
    # Example queries
    queries = [
        "What's the current fraud activity level?",
        "Show me the latest high-risk transactions",
        "Analyze fraud patterns in the last 20 transactions"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        response = fraud_agent(query)
        print(f"Response: {response}")

if __name__ == "__main__":
    main()