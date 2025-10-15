import { Risk } from '../types';

interface ControlsProps {
  riskFilter: Risk | 'ALL';
  searchTerm: string;
  onRiskFilterChange: (risk: Risk | 'ALL') => void;
  onSearchChange: (term: string) => void;
}

export function Controls({ 
  riskFilter, 
  searchTerm, 
  onRiskFilterChange, 
  onSearchChange 
}: ControlsProps) {
  const riskOptions: (Risk | 'ALL')[] = ['ALL', 'OK', 'REVIEW', 'LIKELY_FRAUD'];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '16px', 
      marginBottom: '16px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <div>
        <label style={{ marginRight: '8px', fontSize: '14px', fontWeight: '500' }}>
          Risk Filter:
        </label>
        <select 
          value={riskFilter} 
          onChange={(e) => onRiskFilterChange(e.target.value as Risk | 'ALL')}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            fontSize: '14px'
          }}
        >
          {riskOptions.map(risk => (
            <option key={risk} value={risk}>{risk}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label style={{ marginRight: '8px', fontSize: '14px', fontWeight: '500' }}>
          Search:
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by event_id, explanation, merchant, user_id..."
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            minWidth: '300px'
          }}
        />
      </div>
    </div>
  );
}

