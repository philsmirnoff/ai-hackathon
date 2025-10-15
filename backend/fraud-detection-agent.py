import os
import json
import boto3
from strands import Agent, tool
from topic_analyzer import TopicAnalyzer, LENSES_TOPICS
from mcp_client import LensesMCPClient

# Configure AWS Bedrock model
MODEL_ID = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"

@tool
def discover_fraud_topics():
    """Dynamically discover and rank fraud-relevant topics"""
    analyzer = TopicAnalyzer()
    ranked_topics = analyzer.rank_topics(LENSES_TOPICS)
    top_topics = analyzer.get_top_fraud_topics(LENSES_TOPICS, limit=3)
    
    return {
        "top_fraud_topics": top_topics,
        "analysis": ranked_topics[:5]  # Top 5 with details
    }

@tool
def query_multi_topic_data(topics=None, limit=5):
    """Query data from multiple high-priority fraud topics"""
    if not topics:
        analyzer = TopicAnalyzer()
        topics = analyzer.get_top_fraud_topics(LENSES_TOPICS, limit=3)
    
    mcp_client = LensesMCPClient()
    results = {}
    
    for topic in topics:
        sample_data = mcp_client.sample_topic_data(topic, limit)
        results[topic] = sample_data
    
    return results

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
def get_comprehensive_fraud_insights():
    """Get comprehensive fraud insights from all relevant topics"""
    # Discover top topics
    topic_analysis = discover_fraud_topics()
    
    # Query multi-topic data
    multi_data = query_multi_topic_data(topic_analysis["top_fraud_topics"])
    
    # Analyze patterns across all topics
    all_transactions = []
    for topic, data in multi_data.items():
        all_transactions.extend(data.get("sample_records", []))
    
    pattern_analysis = analyze_fraud_pattern(all_transactions)
    
    return {
        "timestamp": "2024-10-15T17:45:00Z",
        "topic_discovery": topic_analysis,
        "multi_topic_data": multi_data,
        "pattern_analysis": pattern_analysis
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
            discover_fraud_topics,
            query_multi_topic_data,
            analyze_fraud_pattern,
            get_comprehensive_fraud_insights
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