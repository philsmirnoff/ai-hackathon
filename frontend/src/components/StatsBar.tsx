import { Insight, Risk } from '../types';

interface StatsBarProps {
  insights: Insight[];
}

export function StatsBar({ insights }: StatsBarProps) {
  const total = insights.length;
  const ok = insights.filter(i => i.risk === 'OK').length;
  const review = insights.filter(i => i.risk === 'REVIEW').length;
  const likelyFraud = insights.filter(i => i.risk === 'LIKELY_FRAUD').length;

  const statStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    fontSize: '14px'
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '16px', 
      marginBottom: '16px',
      flexWrap: 'wrap'
    }}>
      <div style={statStyle}>
        <span style={{ fontWeight: 'bold' }}>Total:</span>
        <span>{total}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#10b981', fontWeight: 'bold' }}>OK:</span>
        <span>{ok}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Review:</span>
        <span>{review}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Likely Fraud:</span>
        <span>{likelyFraud}</span>
      </div>
    </div>
  );
}

