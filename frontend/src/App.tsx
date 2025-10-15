import { useState, useCallback, useMemo } from 'react';
import { Insight, Risk } from './types';
import { useSSE } from './hooks/useSSE';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { StatsBar } from './components/StatsBar';
import { InsightList } from './components/InsightList';

function App() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [riskFilter, setRiskFilter] = useState<Risk | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [newInsightIds, setNewInsightIds] = useState<Set<string>>(new Set());

  const handleNewInsight = useCallback((insight: Insight) => {
    setInsights(prev => {
      const newInsights = [insight, ...prev].slice(0, 400); // Cap at 400 items
      return newInsights;
    });
    
    // Flash effect for new insights
    setNewInsightIds(prev => new Set([...prev, insight.event_id]));
    setTimeout(() => {
      setNewInsightIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(insight.event_id);
        return newSet;
      });
    }, 3000);
  }, []);

  useSSE(handleNewInsight);

  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const matchesRisk = riskFilter === 'ALL' || insight.risk === riskFilter;
      const matchesSearch = searchTerm === '' || 
        insight.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.card_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.merchant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.card_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.amount.toString().includes(searchTerm);
      
      return matchesRisk && matchesSearch;
    });
  }, [insights, riskFilter, searchTerm]);

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Header />
      <Controls 
        riskFilter={riskFilter}
        searchTerm={searchTerm}
        onRiskFilterChange={setRiskFilter}
        onSearchChange={setSearchTerm}
      />
      <StatsBar insights={filteredInsights} />
      <InsightList 
        insights={filteredInsights} 
        newInsightIds={newInsightIds}
      />
    </div>
  );
}

export default App;
