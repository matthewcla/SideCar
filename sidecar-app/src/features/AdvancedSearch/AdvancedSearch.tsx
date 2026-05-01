import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SideCarAdapter } from '../../services/SideCarAdapter';
import type { ICondition } from '../../models/ISailor';

type SourceType = 'sailors' | 'billets' | 'commands';

const ADV_COLUMNS: Record<SourceType, Array<{ key: string; label: string; type: 'text' | 'select' | 'date' | 'number'; values?: string[] }>> = {
  sailors: [
    { key: 'lastName',    label: 'Last Name',    type: 'text' },
    { key: 'firstName',   label: 'First Name',   type: 'text' },
    { key: 'rate',        label: 'Rate',         type: 'select', values: ['IT', 'CTN', 'YN'] },
    { key: 'payGrade',    label: 'Pay Grade',    type: 'select', values: ['E4', 'E5', 'E6', 'E7'] },
    { key: 'prd',         label: 'PRD',          type: 'date' },
    { key: 'eaos',        label: 'EAOS',         type: 'date' },
    { key: 'command',     label: 'Command',      type: 'select', values: ['USS EXAMPLE (CVN-00)', 'NAVSTA TESTPORT', 'NIOC DEMO', 'COMNAVPERSCOM HQ', 'USS PLACEHOLDER (DDG-00)'] },
    { key: 'uic',         label: 'UIC',          type: 'select', values: ['XXXXX', 'XXXX1', 'XXXX2', 'XXXX3', 'XXXX4'] },
    { key: 'billet',      label: 'Billet',       type: 'text' },
    { key: 'lastContact', label: 'Last Contact', type: 'date' },
    { key: 'prdTier',     label: 'PRD Status',   type: 'select', values: ['EXPIRED', 'CRITICAL', 'URGENT', 'WATCH', 'STABLE'] }
  ],
  billets: [
    { key: 'commandName', label: 'Command',   type: 'select', values: ['USS EXAMPLE (CVN-00)', 'NAVSTA TESTPORT', 'NIOC DEMO', 'COMNAVPERSCOM HQ', 'USS PLACEHOLDER (DDG-00)'] },
    { key: 'rate',        label: 'Rate',      type: 'select', values: ['IT', 'CTN', 'YN'] },
    { key: 'payGrade',    label: 'Pay Grade', type: 'select', values: ['E4', 'E5', 'E6', 'E7'] },
    { key: 'title',       label: 'Title',     type: 'text' },
    { key: 'filled',      label: 'Filled',    type: 'select', values: ['Yes', 'No'] }
  ],
  commands: [
    { key: 'name',        label: 'Name',        type: 'text' },
    { key: 'type',        label: 'Type',        type: 'select', values: ['Sea', 'Shore'] },
    { key: 'homeport',    label: 'Homeport',    type: 'text' },
    { key: 'billetCount', label: 'Billet Count',type: 'number' }
  ]
};

interface IAdvExample {
  label: string;
  desc: string;
  source: SourceType;
  conditions: Array<{ column: string; operator: string; value: string }>;
}

const ADV_EXAMPLES: IAdvExample[] = [
  {
    label: 'Find Critical Sailors',
    desc: 'All sailors with PRDs in the next 3 months',
    source: 'sailors',
    conditions: [{ column: 'prd', operator: 'within', value: '3' }]
  },
  {
    label: 'Sea Duty Sailors',
    desc: 'All IT sailors at Sea commands',
    source: 'sailors',
    conditions: [
      { column: 'rate', operator: 'equals', value: 'IT' },
      { column: 'command', operator: 'contains', value: 'USS' }
    ]
  },
  {
    label: 'Unfilled Billets',
    desc: 'All billets that are currently vacant',
    source: 'billets',
    conditions: [{ column: 'filled', operator: 'equals', value: 'No' }]
  },
  {
    label: 'Expired PRD',
    desc: 'All sailors whose PRD has expired',
    source: 'sailors',
    conditions: [{ column: 'prdTier', operator: 'equals', value: 'EXPIRED' }]
  },
  {
    label: 'Shore Commands',
    desc: 'All shore duty commands and their billet counts',
    source: 'commands',
    conditions: [{ column: 'type', operator: 'equals', value: 'Shore' }]
  },
  {
    label: 'Stale Contact',
    desc: 'Sailors with no contact in the last 2 months',
    source: 'sailors',
    conditions: [{ column: 'lastContact', operator: 'past', value: '2' }]
  }
];

const ADV_OPERATORS = {
  text: [
    { key: 'equals',   label: 'is' },
    { key: 'contains', label: 'contains' },
    { key: 'starts',   label: 'starts with' }
  ],
  select: [
    { key: 'equals', label: 'is' },
    { key: 'not',    label: 'is not' }
  ],
  date: [
    { key: 'before', label: 'is before' },
    { key: 'after',  label: 'is after' },
    { key: 'within', label: 'is within next' },
    { key: 'past',   label: 'was within last' }
  ],
  number: [
    { key: 'equals', label: 'equals' },
    { key: 'gt',     label: 'is greater than' },
    { key: 'lt',     label: 'is less than' }
  ]
};

export function AdvancedSearchPanel({ onClose }: { onClose?: () => void }) {
  const [source, setSource] = useState<SourceType>('sailors');
  const [conditions, setConditions] = useState<Array<ICondition & { id: number }>>([]);
  const [nextId, setNextId] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[] | null>(null);

  const handleAddCondition = useCallback((preset?: Partial<ICondition>) => {
    const cols = ADV_COLUMNS[source];
    const defaultCol = cols[0];
    const opType = defaultCol.type;
    const defaultOp = ADV_OPERATORS[opType][0].key;
    
    setConditions(prev => [...prev, {
      id: nextId,
      column: preset?.column || defaultCol.key,
      operator: preset?.operator || defaultOp,
      value: preset?.value || ''
    }]);
    setNextId(n => n + 1);
  }, [nextId, source]);

  const handleRemoveCondition = (id: number) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const updateCondition = (id: number, field: keyof ICondition, value: string) => {
    setConditions(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newCond = { ...c, [field]: value };
      
      if (field === 'column') {
        const colDef = ADV_COLUMNS[source].find(col => col.key === value);
        if (colDef) {
          newCond.operator = ADV_OPERATORS[colDef.type][0].key;
          newCond.value = colDef.type === 'select' && colDef.values ? colDef.values[0] : '';
        }
      }
      return newCond;
    }));
  };

  const runQuery = async () => {
    const data = await SideCarAdapter.executeAdvancedSearch(
      source, 
      conditions.map(c => ({ column: c.column, operator: c.operator, value: c.value }))
    );
    setResults(data);
  };

  const handleSourceChange = (newSource: SourceType) => {
    setSource(newSource);
    setConditions([]);
    setResults(null);
  };

  const renderConditionValueInput = (cond: ICondition & { id: number }) => {
    const colDef = ADV_COLUMNS[source].find(c => c.key === cond.column);
    if (!colDef) return null;

    if (colDef.type === 'select') {
      return (
        <select 
          className="py-[4px] px-[8px] bg-bg-sunken border border-surface-border rounded-sm font-body text-[12px] text-text-primary outline-none focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow" 
          value={cond.value}
          onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
        >
          {colDef.values?.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      );
    }

    if (colDef.type === 'date') {
      if (cond.operator === 'within' || cond.operator === 'past') {
        return (
          <>
            <input 
              type="number" className="py-[4px] px-[8px] bg-bg-sunken border border-surface-border rounded-sm font-body text-[12px] text-text-primary outline-none focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow" style={{ width: 60 }} min="1" max="60"
              value={cond.value || '3'} 
              onChange={(e) => updateCondition(cond.id, 'value', e.target.value)} 
            /> 
            <span style={{ fontSize: 13, marginLeft: 6 }}>months</span>
          </>
        );
      }
      return (
        <input 
          type="date" className="py-[4px] px-[8px] bg-bg-sunken border border-surface-border rounded-sm font-body text-[12px] text-text-primary outline-none focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow" 
          value={cond.value} 
          onChange={(e) => updateCondition(cond.id, 'value', e.target.value)} 
        />
      );
    }

    if (colDef.type === 'number') {
      return (
        <input 
          type="number" className="py-[4px] px-[8px] bg-bg-sunken border border-surface-border rounded-sm font-body text-[12px] text-text-primary outline-none focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow" style={{ width: 80 }}
          value={cond.value} 
          onChange={(e) => updateCondition(cond.id, 'value', e.target.value)} 
        />
      );
    }

    return (
      <input 
        type="text" className="py-[4px] px-[8px] bg-bg-sunken border border-surface-border rounded-sm font-body text-[12px] text-text-primary outline-none focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow" placeholder="value..." style={{ width: 140 }}
        value={cond.value} 
        onChange={(e) => updateCondition(cond.id, 'value', e.target.value)} 
      />
    );
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-bg-primary overflow-hidden">
      {onClose && (
        <div style={{ padding: '8px 16px', background: 'var(--color-bg-sunken)', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-muted)' }}>✕ Close Advanced Search</button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Query Builder */}
        <div className="w-[520px] shrink-0 border-r border-surface-border flex flex-col overflow-y-auto bg-bg-elevated">
          <div className="font-data text-[13px] tracking-[0.08em] uppercase text-text-muted pt-lg px-xl pb-sm border-b border-surface-border-subtle">Query Builder</div>
          
          <div className="py-md px-lg flex flex-col gap-[8px]">
            <div className="font-body text-[13px] text-text-primary leading-[2.4]">
              Show me all{' '}
              <select 
                className="inline-block py-[4px] pl-[8px] pr-[24px] bg-bg-sunken border border-surface-border rounded-sm font-data text-[12px] text-brand-navy cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg_width=\'10\'_height=\'6\'_viewBox=\'0_0_10_6\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M1_1l4_4_4-4\'_fill=\'none\'_stroke=\'%231B2A4A\'_stroke-width=\'1.5\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_8px_center] transition-colors duration-fast align-middle focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow focus:outline-none"
                value={source} 
                onChange={(e) => handleSourceChange(e.target.value as SourceType)}
              >
                <option value="sailors">Sailors</option>
                <option value="billets">Billets</option>
                <option value="commands">Commands</option>
              </select>
            </div>

            <div id="adv-conditions">
              {conditions.map(cond => (
                <div key={cond.id} className="flex items-center gap-[6px] flex-nowrap py-[10px] px-[12px] mb-[8px] border-b border-surface-border-subtle last:border-b-0">
                  <label className="font-data text-[10px] uppercase tracking-[0.06em] text-text-muted min-w-[40px]">Where</label>
                  <select 
                    className="py-[4px] px-[8px] bg-bg-sunken border border-surface-border rounded-sm font-body text-[12px] text-text-primary outline-none focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow appearance-none pr-[24px] bg-[url('data:image/svg+xml,%3Csvg_width=\'10\'_height=\'6\'_viewBox=\'0_0_10_6\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M1_1l4_4_4-4\'_fill=\'none\'_stroke=\'%231B2A4A\'_stroke-width=\'1.5\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_8px_center]" 
                    value={cond.column}
                    onChange={(e) => updateCondition(cond.id, 'column', e.target.value)}
                  >
                    {ADV_COLUMNS[source].map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>

                  <select 
                    className="py-[4px] px-[8px] bg-bg-sunken border border-surface-border rounded-sm font-body text-[12px] text-text-primary outline-none focus:border-brand-gold focus:bg-bg-elevated focus:shadow-glow appearance-none pr-[24px] bg-[url('data:image/svg+xml,%3Csvg_width=\'10\'_height=\'6\'_viewBox=\'0_0_10_6\'_xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath_d=\'M1_1l4_4_4-4\'_fill=\'none\'_stroke=\'%231B2A4A\'_stroke-width=\'1.5\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_8px_center]"
                    value={cond.operator}
                    onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                  >
                    {ADV_OPERATORS[ADV_COLUMNS[source].find(c => c.key === cond.column)?.type || 'text'].map(op => (
                      <option key={op.key} value={op.key}>{op.label}</option>
                    ))}
                  </select>

                  {renderConditionValueInput(cond)}

                  <button className="w-[22px] h-[22px] flex items-center justify-center bg-transparent border border-surface-border-subtle rounded-full text-text-muted cursor-pointer text-[14px] leading-none transition-colors duration-fast shrink-0 hover:border-prd-critical-dot hover:text-prd-critical-dot" onClick={() => handleRemoveCondition(cond.id)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="flex items-center gap-[6px] py-[4px] px-[8px] mx-lg mb-[8px] mt-0 bg-transparent border border-dashed border-surface-border rounded-md font-data text-[10px] uppercase tracking-[0.05em] text-text-muted cursor-pointer transition-colors duration-fast hover:border-brand-gold hover:text-brand-navy w-fit" onClick={() => handleAddCondition()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Condition
          </button>

          <button className="flex items-center justify-center gap-sm py-[8px] px-xl my-sm mx-lg mb-md bg-brand-gold text-brand-navy font-bold border-none rounded-full font-data text-[12px] uppercase tracking-[0.08em] cursor-pointer transition-all duration-fast hover:bg-brand-gold-bright hover:shadow-card" onClick={runQuery}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Run Query
          </button>

          {/* Coaching / Examples */}
          <div className="py-[16px] px-lg border-t border-surface-border-subtle bg-bg-primary shrink-0">
            <div className="font-data text-[11px] uppercase tracking-[0.08em] text-brand-gold-dim mb-[12px]">Example Queries</div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-[8px]">
              {ADV_EXAMPLES.map((ex, i) => (
                <div
                  key={i}
                  className="p-[8px_10px] bg-bg-elevated border border-surface-border-subtle rounded-md font-body text-[12px] text-text-secondary cursor-pointer transition-colors duration-fast hover:border-brand-gold hover:bg-bg-primary"
                  onClick={() => {
                    setSource(ex.source);
                    const mapped = ex.conditions.map((c, idx) => ({
                      id: nextId + idx,
                      ...c,
                    }));
                    setConditions(mapped);
                    setNextId(nextId + mapped.length);
                    setResults(null);
                  }}
                >
                  <div className="font-data text-[10px] uppercase tracking-[0.06em] text-brand-gold mb-[4px]">{ex.label}</div>
                  {ex.desc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between py-[12px] px-xl border-b border-surface-border-subtle font-data text-[13px] uppercase tracking-[0.06em] text-text-muted shrink-0 min-h-[57px]">
            <span>Results &mdash; <span className="font-semibold text-brand-gold-dim">{results ? results.length : 0} rows</span></span>
            {results && results.length > 0 && (
              <div className="flex items-center gap-[10px]">
                 <button className="inline-flex items-center gap-[6px] p-[6px_14px] bg-bg-primary border border-surface-border rounded-full font-data text-[11px] uppercase tracking-[0.05em] text-brand-navy cursor-pointer whitespace-nowrap transition-all duration-fast hover:border-brand-gold hover:bg-bg-sunken hover:shadow-soft">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Excel
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-0 bg-bg-primary">
            {!results ? (
              <div className="flex flex-col items-center justify-center flex-1 p-[48px_24px] text-center h-full">
                <div className="text-[48px] mb-[16px] opacity-30 text-text-muted">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div className="font-data text-[14px] uppercase tracking-[0.08em] text-text-muted mb-sm">Build Your Query</div>
                <div className="font-body text-[14px] text-text-muted max-w-[360px] leading-[1.5]">
                  Use the query builder on the left to filter data. Select conditions and click "Run Query" to see results. Or click an example below to get started.
                </div>
              </div>
            ) : results.length === 0 ? (
               <div className="flex flex-col items-center justify-center flex-1 p-[48px_24px] text-center h-full">
                <div className="font-data text-[14px] uppercase tracking-[0.08em] text-text-muted mb-sm">No match found</div>
                <div className="font-body text-[14px] text-text-muted max-w-[360px] leading-[1.5]">
                  Adjust your search conditions.
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse font-body text-[13px]">
                <thead className="sticky top-0 z-[2]">
                  <tr>
                    {ADV_COLUMNS[source].map(c => <th key={c.key} className="p-[10px_14px] bg-bg-sunken border-b-2 border-surface-border font-data text-[11px] uppercase tracking-[0.08em] text-text-muted text-left whitespace-nowrap">{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={(r.id as string | number) || i} className="cursor-default transition-colors duration-fast hover:bg-bg-sunken">
                      {ADV_COLUMNS[source].map(c => (
                        <td key={c.key} className="p-[9px_14px] border-b border-surface-border-subtle text-text-primary whitespace-nowrap">{r[c.key]?.toString() || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedSearch() {
  return (
    <div className="flex flex-col w-screen h-screen bg-bg-primary overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center gap-md py-lg px-2xl bg-bg-elevated border-b border-surface-border shrink-0">
        <Link to="/" className="font-display text-[28px] tracking-[4px] uppercase text-brand-navy no-underline font-extrabold shrink-0">
          SIDE<span className="font-light text-brand-gold">[</span><span className="font-extrabold text-brand-gold">CAR</span><span className="font-light text-brand-gold">]</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/" className="flex items-center gap-[6px] py-sm px-md bg-transparent border border-surface-border rounded-full font-data text-xs uppercase tracking-[0.05em] text-text-muted cursor-pointer transition-colors duration-fast shrink-0 no-underline hover:border-brand-gold hover:text-brand-navy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </Link>
      </div>
      <AdvancedSearchPanel />
    </div>
  );
}
