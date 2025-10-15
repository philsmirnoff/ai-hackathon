export function Header() {
  return (
    <header style={{
      padding: '20px 0',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '20px'
    }}>
      <h1 style={{ 
        margin: 0, 
        fontSize: '28px', 
        fontWeight: 'bold',
        color: '#111827'
      }}>
        Fraud Triage (Real-Time)
      </h1>
      <p style={{ 
        margin: '8px 0 0 0', 
        fontSize: '16px', 
        color: '#6b7280'
      }}>
        Kafka → Bedrock → SSE → React
      </p>
    </header>
  );
}

