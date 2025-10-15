import { Insight } from '../types';

interface StatsBarProps {
  insights: Insight[];
}

export function StatsBar({ insights }: StatsBarProps) {
  const total = insights.length;
  const ok = insights.filter(i => i.risk === 'OK').length;
  const review = insights.filter(i => i.risk === 'REVIEW').length;
  const likelyFraud = insights.filter(i => i.risk === 'LIKELY_FRAUD').length;
  
  const approved = insights.filter(i => i.status === 'approved').length;
  const declined = insights.filter(i => i.status === 'declined').length;
  const pending = insights.filter(i => i.status === 'pending').length;
  
  const totalAmount = insights.reduce((sum, i) => sum + i.amount, 0);
  const avgAmount = total > 0 ? totalAmount / total : 0;
  
  const fraudFlags = insights.filter(i => i.fraud_flag1 || i.fraud_flag2 || i.fraud_flag3).length;
  
  const uniqueMerchants = new Set(insights.map(i => i.merchant_name)).size;
  const uniqueCustomers = new Set(insights.map(i => i.customer_id)).size;

  const statStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    fontSize: '14px'
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
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
      <div style={statStyle}>
        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Approved:</span>
        <span>{approved}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Declined:</span>
        <span>{declined}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Pending:</span>
        <span>{pending}</span>
      </div>
      <div style={statStyle}>
        <span style={{ fontWeight: 'bold' }}>Total Value:</span>
        <span>{formatAmount(totalAmount)}</span>
      </div>
      <div style={statStyle}>
        <span style={{ fontWeight: 'bold' }}>Avg Amount:</span>
        <span>{formatAmount(avgAmount)}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Fraud Flags:</span>
        <span>{fraudFlags}</span>
      </div>
      <div style={statStyle}>
        <span style={{ fontWeight: 'bold' }}>Merchants:</span>
        <span>{uniqueMerchants}</span>
      </div>
      <div style={statStyle}>
        <span style={{ fontWeight: 'bold' }}>Customers:</span>
        <span>{uniqueCustomers}</span>
      </div>
    </div>
  );
}

