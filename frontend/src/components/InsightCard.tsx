import { Insight } from '../types';
import { RiskBadge } from './RiskBadge';

interface InsightCardProps {
  insight: Insight;
  isNew?: boolean;
}

export function InsightCard({ insight, isNew = false }: InsightCardProps) {
  const getLatency = (timestamp: string) => {
    const now = new Date().getTime();
    const eventTime = new Date(timestamp).getTime();
    return Math.max(0, now - eventTime);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: isNew ? 'all 0.3s ease' : 'none',
    transform: isNew ? 'scale(1.02)' : 'scale(1)',
    opacity: isNew ? 0.8 : 1
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <RiskBadge risk={insight.risk} />
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {Math.round(insight.score * 100)}% • {getLatency(insight.ts)}ms
        </div>
      </div>
      
      <div style={{ marginBottom: '8px', fontSize: '14px', lineHeight: '1.4' }}>
        {insight.explanation}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
        <span>{insight.merchant || '—'}</span>
        <span>{formatTime(insight.ts)}</span>
      </div>
    </div>
  );
}
