import { Insight } from '../types';
import { InsightCard } from './InsightCard';

interface InsightListProps {
  insights: Insight[];
  newInsightIds: Set<string>;
}

export function InsightList({ insights, newInsightIds }: InsightListProps) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '16px',
      padding: '16px 0'
    }}>
      {insights.map((insight) => (
        <InsightCard 
          key={insight.event_id} 
          insight={insight}
          isNew={newInsightIds.has(insight.event_id)}
        />
      ))}
    </div>
  );
}

