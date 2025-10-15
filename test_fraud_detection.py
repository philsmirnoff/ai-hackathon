#!/usr/bin/env python3
"""
Test script for fraud detection service
"""

import json
import requests
import time

def test_fraud_detection():
    """Test the fraud detection service with sample data"""
    
    # Sample transaction data
    test_transaction = {
        "event_id": "evt_test_001",
        "ts": "2025-01-15T14:54:34.967Z",
        "transaction_id": "CC-7790920712",
        "card_id": "CC-7790920712",
        "customer_id": "CUST-004038",
        "merchant_id": "MERCH-000666",
        "card_number": "****-****-****-3565",
        "merchant_name": "Shell Gas",
        "category": "Gas",
        "amount": 361.23,
        "currency": "USD",
        "city": "Los Angeles",
        "state": "PA",  # This should trigger geo_invalid flag
        "zip": "54280",
        "status": "approved",
        "fraud_flag1": False,
        "fraud_flag2": False,
        "fraud_flag3": False
    }
    
    print("🧪 Testing fraud detection service...")
    print(f"📊 Transaction: {test_transaction['merchant_name']} - ${test_transaction['amount']}")
    print(f"📍 Location: {test_transaction['city']}, {test_transaction['state']}")
    print()
    
    try:
        # Test the service
        response = requests.post(
            "http://localhost:5000/analyze",
            json=test_transaction,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Fraud detection successful!")
            print(f"🎯 Risk Level: {result.get('risk', 'Unknown')}")
            print(f"📈 Score: {result.get('score', 0):.2f}")
            print(f"💭 Explanation: {result.get('explanation', 'No explanation')}")
            
            if result.get('flags'):
                print("🚩 Flags triggered:")
                for flag, value in result['flags'].items():
                    if value:
                        print(f"   - {flag}: {value}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to fraud detection service.")
        print("   Make sure the Python service is running on port 5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_fraud_detection()
