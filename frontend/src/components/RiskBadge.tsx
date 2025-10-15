import { Risk } from '../types';

interface RiskBadgeProps {
  risk: Risk;
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const getRiskStyle = (risk: Risk) => {
    switch (risk) {
      case 'OK':
        return {
          backgroundColor: '#10b981',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      case 'REVIEW':
        return {
          backgroundColor: '#f59e0b',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      case 'LIKELY_FRAUD':
        return {
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        };
    }
  };

  return (
    <span style={getRiskStyle(risk)}>
      {risk}
    </span>
  );
}
