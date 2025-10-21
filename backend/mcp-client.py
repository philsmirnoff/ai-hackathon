import json
import requests
from typing import List, Dict, Optional

class LensesMCPClient:
    """MCP client for querying Lenses.io topics"""
    
    def __init__(self, mcp_url: str = "http://108.129.168.213:8080/mcp"):
        self.mcp_url = mcp_url
        self.session = requests.Session()
    
    def call_tool(self, tool_name: str, arguments: Dict = None) -> Dict:
        """Call an MCP tool on the Lenses server"""
        try:
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": arguments or {}
                }
            }
            
            response = self.session.post(
                self.mcp_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get("result", {})
            else:
                return {"error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            return {"error": str(e)}
    
    def list_topics(self) -> List[Dict]:
        """List all available Kafka topics"""
        result = self.call_tool("list_topics")
        return result.get("topics", [])
    
    def query_topic(self, topic: str, limit: int = 10) -> List[Dict]:
        """Query records from a specific topic"""
        result = self.call_tool("query_topic", {
            "topic": topic,
            "limit": limit
        })
        return result.get("records", [])
    
    def sample_topic_data(self, topic: str, sample_size: int = 5) -> Dict:
        """Get sample data from topic for analysis"""
        records = self.query_topic(topic, sample_size)
        
        return {
            "topic": topic,
            "sample_count": len(records),
            "sample_records": records,
            "schema_preview": self._analyze_schema(records) if records else {}
        }
    
    def _analyze_schema(self, records: List[Dict]) -> Dict:
        """Analyze record schema to understand data structure"""
        if not records:
            return {}
        
        # Get field types from first record
        sample = records[0]
        schema = {}
        
        for key, value in sample.items():
            schema[key] = type(value).__name__
        
        return schema