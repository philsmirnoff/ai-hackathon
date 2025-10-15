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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'declined': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <RiskBadge risk={insight.risk} />
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {Math.round(insight.score * 100)}% • {getLatency(insight.ts)}ms
        </div>
      </div>
      
      <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.4' }}>
        {insight.explanation}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '12px' }}>
        <div>
          <div style={{ color: '#6b7280', marginBottom: '2px' }}>Transaction</div>
          <div style={{ fontWeight: '500' }}>{insight.transaction_id}</div>
        </div>
        <div>
          <div style={{ color: '#6b7280', marginBottom: '2px' }}>Amount</div>
          <div style={{ fontWeight: '500' }}>{formatAmount(insight.amount, insight.currency)}</div>
        </div>
        <div>
          <div style={{ color: '#6b7280', marginBottom: '2px' }}>Merchant</div>
          <div style={{ fontWeight: '500' }}>{insight.merchant_name}</div>
        </div>
        <div>
          <div style={{ color: '#6b7280', marginBottom: '2px' }}>Category</div>
          <div style={{ fontWeight: '500' }}>{insight.category}</div>
        </div>
        <div>
          <div style={{ color: '#6b7280', marginBottom: '2px' }}>Location</div>
          <div style={{ fontWeight: '500' }}>{insight.city}, {insight.state}</div>
        </div>
        <div>
          <div style={{ color: '#6b7280', marginBottom: '2px' }}>Status</div>
          <div style={{ fontWeight: '500', color: getStatusColor(insight.status) }}>
            {insight.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
        <div>
          <span style={{ marginRight: '12px' }}>Card: {insight.card_number}</span>
          <span>Customer: {insight.customer_id}</span>
        </div>
        <div>
          {formatTime(insight.ts)}
        </div>
      </div>

      {(insight.fraud_flag1 || insight.fraud_flag2 || insight.fraud_flag3) && (
        <div style={{ marginTop: '8px', padding: '6px 8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '11px', color: '#dc2626' }}>
          ⚠️ Fraud flags: {[insight.fraud_flag1 && 'Flag1', insight.fraud_flag2 && 'Flag2', insight.fraud_flag3 && 'Flag3'].filter(Boolean).join(', ')}
        </div>
      )}
    </div>
  );
}
