#!/usr/bin/env python3
"""
Enhanced AI-Powered Fraud Detection Service
Supports both environment variables and AWS SSM parameters
"""

import os
import json
import time
import logging
import random
import boto3
from datetime import datetime
from typing import Dict, Any, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ────────────────────────────────────────────────────────────────────────────────
# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────────────────────
# Configuration and AWS SSM Integration

class ConfigManager:
    def __init__(self):
        self.ssm_client = None
        self._init_aws_client()
    
    def _init_aws_client(self):
        """Initialize AWS SSM client if credentials are available"""
        try:
            self.ssm_client = boto3.client('ssm', region_name=os.getenv('AWS_REGION', 'us-west-2'))
            logger.info("AWS SSM client initialized")
        except Exception as e:
            logger.warning(f"Could not initialize AWS SSM client: {e}")
            self.ssm_client = None
    
    def get_ssm_parameter(self, param_name: str) -> Optional[str]:
        """Get parameter from AWS SSM"""
        if not self.ssm_client:
            return None
        
        try:
            response = self.ssm_client.get_parameter(Name=param_name, WithDecryption=True)
            return response['Parameter']['Value']
        except Exception as e:
            logger.error(f"Error getting SSM parameter {param_name}: {e}")
            return None
    
    def get_token(self, user_pool_id: str, client_id: str, client_secret: str, scope: str, region: str) -> Dict[str, Any]:
        """Get OAuth token (placeholder - implement your OAuth flow)"""
        # This is a placeholder - implement your actual OAuth token retrieval
        logger.warning("OAuth token retrieval not implemented - using placeholder")
        return {"access_token": "placeholder-token"}
    
    def get_mcp_config(self) -> Dict[str, str]:
        """Get MCP configuration from environment or SSM"""
        config = {}
        
        # Try SSM parameters first
        if self.ssm_client:
            try:
                user_pool_id = self.get_ssm_parameter(os.getenv('SSM_USER_POOL_ID_PARAM'))
                client_id = self.get_ssm_parameter(os.getenv('SSM_CLIENT_ID_PARAM'))
                client_secret = self.get_ssm_parameter(os.getenv('SSM_CLIENT_SECRET_PARAM'))
                scope = self.get_ssm_parameter(os.getenv('SSM_SCOPE_PARAM'))
                gateway_url = self.get_ssm_parameter(os.getenv('SSM_GATEWAY_URL_PARAM'))
                
                if all([user_pool_id, client_id, client_secret, scope, gateway_url]):
                    # Get token using SSM parameters
                    token_response = self.get_token(user_pool_id, client_id, client_secret, scope, os.getenv('AWS_REGION', 'us-west-2'))
                    config['MCP_ENDPOINT'] = gateway_url
                    config['AWS_BEARER_TOKEN_BEDROCK'] = token_response.get('access_token')
                    logger.info("Using MCP configuration from AWS SSM")
                    return config
            except Exception as e:
                logger.error(f"Error getting MCP config from SSM: {e}")
        
        # Fallback to environment variables
        config['MCP_ENDPOINT'] = os.getenv('MCP_ENDPOINT', 'https://bedrock.amazonaws.com')
        config['AWS_BEARER_TOKEN_BEDROCK'] = os.getenv('AWS_BEARER_TOKEN_BEDROCK')
        logger.info("Using MCP configuration from environment variables")
        return config

# Initialize configuration manager
config_manager = ConfigManager()
mcp_config = config_manager.get_mcp_config()

MODEL_ID = os.getenv("MODEL_ID", "us.anthropic.claude-3-7-sonnet-20250219-v1:0")
MCP_ENDPOINT = mcp_config.get('MCP_ENDPOINT', 'https://bedrock.amazonaws.com')
MCP_BEARER = mcp_config.get('AWS_BEARER_TOKEN_BEDROCK')

# ────────────────────────────────────────────────────────────────────────────────
# Fraud Detection Rules and Constants

AMOUNT_CAP = {
    "Gas": 125, "Clothing": 400, "Groceries": 350, "Entertainment": 300,
    "Travel": 250, "Home Improvement": 350, "Dining": 120, "Shopping": 400, "Healthcare": 300
}

MERCHANT_CATEGORY_MAP = {
    "shell": "Gas", "chevron": "Gas", "whole foods": "Groceries",
    "walmart": "Shopping", "home depot": "Home Improvement",
    "best buy": "Electronics", "mcdonald": "Dining",
    "nike": "Clothing", "macy": "Clothing", "nordstrom": "Clothing",
    "costco": "Shopping", "apple store": "Electronics", "starbucks": "Dining",
    "target": "Shopping", "amazon": "Shopping"
}

GEO_BAD_PAIRS = {
    ("Los Angeles","PA"), ("Los Angeles","TX"),
    ("Phoenix","OH"), ("San Diego","TX"), ("San Diego","OH"),
    ("New York","FL"),
    ("Philadelphia","FL"), ("Philadelphia","AZ"),
    ("Chicago","AZ"), ("Dallas","CA"),
    ("San Jose","IL"), ("Houston","NC")
}

# Velocity tracking
VELOCITY_WINDOW_MS = 2000
_recent_by_card_tail: Dict[str, list] = {}

def _now_ms() -> int:
    return int(time.time() * 1000)

# ────────────────────────────────────────────────────────────────────────────────
# Fraud Detection Functions

def classify_rules(event: Dict[str, Any]) -> Dict[str, Any]:
    """Rule-based fraud detection with flags and score in [0,1]."""
    merchant = str(event.get("merchant_name","")).lower()
    category = str(event.get("category",""))
    amount = float(event.get("amount", 0))
    city = str(event.get("city",""))
    state = str(event.get("state",""))
    card_number = str(event.get("card_number",""))
    ts_str = event.get("ts") or datetime.utcnow().isoformat()

    # 1) Merchant/category mismatch
    expected = None
    for k, v in MERCHANT_CATEGORY_MAP.items():
        if k in merchant:
            expected = v
            break
    mismatch = bool(expected and expected != category)

    # 2) Geographic invalid pairs
    geo_invalid = (city, state) in GEO_BAD_PAIRS

    # 3) Amount high for category
    cap = AMOUNT_CAP.get(category, 300)
    amount_high = amount > cap

    # 4) Velocity burst (same card tail within 2s)
    card_tail = card_number[-4:] if len(card_number) >= 4 else card_number
    try:
        t = int(datetime.fromisoformat(ts_str.replace("Z","")).timestamp() * 1000) if "T" in ts_str else _now_ms()
    except:
        t = _now_ms()
    
    lst = _recent_by_card_tail.setdefault(card_tail, [])
    while lst and (t - lst[0]) > VELOCITY_WINDOW_MS:
        lst.pop(0)
    lst.append(t)
    velocity_burst = len(lst) >= 3

    # 5) High amount transactions
    high_amount = amount > 1000

    # Score calculation - more aggressive fraud detection
    weights = {
        "mismatch": 0.40,      # Increased - merchant/category mismatch is very suspicious
        "geo_invalid": 0.35,   # Increased - geographic anomalies are high risk
        "amount_high": 0.25,   # Increased - high amounts for category
        "velocity_burst": 0.30, # Increased - rapid transactions are suspicious
        "high_amount": 0.20    # Increased - very high amounts
    }
    
    score = 0.0
    if mismatch: score += weights["mismatch"]
    if geo_invalid: score += weights["geo_invalid"]
    if amount_high: score += weights["amount_high"]
    if velocity_burst: score += weights["velocity_burst"]
    if high_amount: score += weights["high_amount"]
    
    # Bonus for multiple fraud indicators
    flag_count = sum([mismatch, geo_invalid, amount_high, velocity_burst, high_amount])
    if flag_count >= 2:
        score += 0.15  # Bonus for multiple suspicious indicators
    
    score = min(1.0, score)

    return {
        "rule_score": round(score, 2),
        "flags": {
            "mismatch": mismatch,
            "expected": expected,
            "geo_invalid": geo_invalid,
            "amount_high": amount_high,
            "velocity_burst": velocity_burst,
            "high_amount": high_amount
        }
    }

def llm_refine_enhanced(event: Dict[str, Any], flags: Dict[str, Any]) -> Dict[str, Any]:
    """Enhanced AI analysis with MCP integration capability."""
    
    # If MCP is available, use it for AI analysis
    if MCP_BEARER and MCP_BEARER != "your-token-here":
        try:
            # TODO: Implement MCP client integration here
            # This would use the MCP client with your actual token
            logger.info("MCP integration available - using enhanced AI analysis")
            # Placeholder for MCP integration
            pass
        except Exception as e:
            logger.error(f"MCP analysis failed: {e}")
    
    # Fallback to enhanced heuristics
    merchant = str(event.get("merchant_name","")).lower()
    amount = float(event.get("amount", 0))
    city = str(event.get("city",""))
    state = str(event.get("state",""))
    
    ai_score = 0.0
    explanations = []
    
    # Enhanced merchant analysis
    if "gas" in merchant and amount > 200:
        ai_score += 0.2
        explanations.append("Unusually high gas station transaction")
    
    if "online" in merchant or "store" in merchant:
        if amount > 500:
            ai_score += 0.15
            explanations.append("High-value online transaction")
    
    # Time-based analysis (simplified)
    try:
        ts = datetime.fromisoformat(event.get("ts", "").replace("Z",""))
        hour = ts.hour
        if hour < 6 or hour > 22:  # Late night/early morning
            ai_score += 0.1
            explanations.append("Unusual transaction time")
    except:
        pass
    
    # Location analysis
    if city in ["Los Angeles", "New York", "Chicago"] and amount > 300:
        ai_score += 0.1
        explanations.append("High-value transaction in major city")
    
    # Random AI factor (simulating model uncertainty)
    ai_score += random.uniform(-0.1, 0.1)
    ai_score = max(0.0, min(1.0, ai_score))
    
    explanation = "; ".join(explanations) if explanations else "AI analysis completed"
    
    return {
        "llm_score": round(ai_score, 2),
        "explanation": explanation
    }

def blend_and_label(rule_score: float, llm_score: float) -> Dict[str, Any]:
    """Blend rule-based and AI scores to assign final risk label."""
    final = round(0.6 * float(rule_score) + 0.4 * float(llm_score), 2)
    
    # More sensitive thresholds for better fraud detection
    if final >= 0.60:
        label = "LIKELY_FRAUD"
    elif final >= 0.35:
        label = "REVIEW"
    else:
        label = "OK"
    
    return {"final_score": final, "label": label}

def analyze_transaction(event: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze a single transaction for fraud risk."""
    try:
        # Step 1: Rule-based analysis
        rule_result = classify_rules(event)
        
        # Step 2: AI analysis (enhanced)
        ai_result = llm_refine_enhanced(event, rule_result["flags"])
        
        # Step 3: Blend and label
        final_result = blend_and_label(rule_result["rule_score"], ai_result["llm_score"])
        
        # Combine all results
        return {
            "risk": final_result["label"],
            "score": final_result["final_score"],
            "explanation": ai_result["explanation"],
            "flags": rule_result["flags"]
        }
        
    except Exception as e:
        logger.error(f"Fraud analysis error: {e}")
        return {
            "risk": "REVIEW",
            "score": 0.55,
            "explanation": f"Analysis failed: {str(e)}",
            "flags": {}
        }

# ────────────────────────────────────────────────────────────────────────────────
# Flask API Server

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze a transaction for fraud risk."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No transaction data provided"}), 400
        
        result = analyze_transaction(data)
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy", 
        "service": "fraud-detection-enhanced",
        "mcp_configured": bool(MCP_BEARER and MCP_BEARER != "your-token-here"),
        "mcp_endpoint": MCP_ENDPOINT
    })

@app.route('/config', methods=['GET'])
def get_config():
    """Get current configuration (for debugging)"""
    return jsonify({
        "mcp_endpoint": MCP_ENDPOINT,
        "mcp_configured": bool(MCP_BEARER and MCP_BEARER != "your-token-here"),
        "aws_region": os.getenv('AWS_REGION', 'us-west-2'),
        "ssm_available": config_manager.ssm_client is not None
    })

if __name__ == "__main__":
    # CLI mode for testing
    if len(os.sys.argv) > 1 and os.sys.argv[1] == "test":
        import argparse
        parser = argparse.ArgumentParser(description="Test fraud detection")
        parser.add_argument("--event", "-e", type=str, required=True, help="JSON event")
        args = parser.parse_args()
        event = json.loads(args.event)
        result = analyze_transaction(event)
        print(json.dumps(result, indent=2))
    else:
        # Start Flask server
        port = int(os.getenv("FRAUD_SERVICE_PORT", 5001))
        logger.info(f"Starting enhanced fraud detection service on port {port}")
        logger.info(f"MCP Endpoint: {MCP_ENDPOINT}")
        logger.info(f"MCP Configured: {bool(MCP_BEARER and MCP_BEARER != 'your-token-here')}")
        app.run(host="0.0.0.0", port=port, debug=True)
