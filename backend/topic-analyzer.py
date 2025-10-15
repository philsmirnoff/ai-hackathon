import re
from typing import List, Dict, Tuple

class TopicAnalyzer:
    """Analyzes Kafka topics to identify fraud-relevant data sources"""
    
    FRAUD_KEYWORDS = [
        'transaction', 'payment', 'card', 'credit', 'debit', 'paypal',
        'merchant', 'customer', 'spend', 'loan', 'financial'
    ]
    
    HIGH_PRIORITY_PATTERNS = [
        r'.*transaction.*',
        r'.*payment.*', 
        r'.*card.*',
        r'.*fraud.*'
    ]
    
    def __init__(self):
        self.topics_metadata = []
    
    def analyze_topic_relevance(self, topic_name: str, record_count: int) -> Dict:
        """Score topic relevance for fraud detection"""
        score = 0
        reasons = []
        
        # Name-based scoring
        name_lower = topic_name.lower()
        for keyword in self.FRAUD_KEYWORDS:
            if keyword in name_lower:
                score += 10
                reasons.append(f"Contains '{keyword}'")
        
        # Pattern matching
        for pattern in self.HIGH_PRIORITY_PATTERNS:
            if re.match(pattern, name_lower):
                score += 20
                reasons.append(f"Matches pattern: {pattern}")
        
        # Volume scoring (more records = more valuable)
        if record_count > 1000000:
            score += 15
            reasons.append("High volume data")
        elif record_count > 100000:
            score += 10
            reasons.append("Medium volume data")
        elif record_count > 1000:
            score += 5
            reasons.append("Low volume data")
        
        return {
            'topic': topic_name,
            'relevance_score': score,
            'record_count': record_count,
            'reasons': reasons,
            'business_value': 'CRITICAL' if score >= 30 else 'IMPORTANT' if score >= 15 else 'OPTIONAL'
        }
    
    def rank_topics(self, topics_data: List[Dict]) -> List[Dict]:
        """Rank all topics by fraud detection relevance"""
        analyzed = []
        
        for topic in topics_data:
            analysis = self.analyze_topic_relevance(
                topic['name'], 
                topic.get('record_count', 0)
            )
            analyzed.append(analysis)
        
        # Sort by relevance score descending
        return sorted(analyzed, key=lambda x: x['relevance_score'], reverse=True)
    
    def get_top_fraud_topics(self, topics_data: List[Dict], limit: int = 3) -> List[str]:
        """Get top N most relevant topics for fraud detection"""
        ranked = self.rank_topics(topics_data)
        return [topic['topic'] for topic in ranked[:limit] if topic['business_value'] in ['CRITICAL', 'IMPORTANT']]

# Parse the Lenses.io topics data
LENSES_TOPICS = [
    {'name': 'credit-card-transactions', 'record_count': 7852501},
    {'name': 'drew', 'record_count': 16},
    {'name': 'drew-double', 'record_count': 16},
    {'name': 'home-loan-payments', 'record_count': 78525},
    {'name': 'paypal-transactions', 'record_count': 3774600},
    {'name': 'ref-customers', 'record_count': 1000},
    {'name': 'ref-merchants', 'record_count': 100},
    {'name': 'spend_window_5m', 'record_count': 0},
    {'name': 'test-topic', 'record_count': 0}
]

if __name__ == "__main__":
    analyzer = TopicAnalyzer()
    ranked = analyzer.rank_topics(LENSES_TOPICS)
    
    print("🔍 IDENTIFY HIGHLY RELEVANT KAFKA TOPICS FOR FRAUD DETECTION")
    print("=" * 85)
    print(f"{'DATA SOURCE':25} | {'SCORE':5} | {'VALUE':9} | {'WHY IT MATTERS'}")
    print("-" * 85)
    for topic in ranked:
        print(f"{topic['topic']:25} | {topic['relevance_score']:5} | {topic['business_value']:9} | {', '.join(topic['reasons'])}")
    print("=" * 85)
    
    critical_topics = [t for t in ranked if t['business_value'] == 'CRITICAL']
    print(f"\n🎯 RECOMMENDED AI FOCUS: {len(critical_topics)} critical data sources identified")
    print(f"📊 TOP FRAUD DETECTION TARGETS: {analyzer.get_top_fraud_topics(LENSES_TOPICS)}")
    print(f"\n💡 BUSINESS IMPACT: Focus AI agents on CRITICAL sources for maximum fraud detection")