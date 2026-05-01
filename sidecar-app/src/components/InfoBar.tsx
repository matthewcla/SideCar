import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import type { ISailor } from '../models/ISailor';
import { formatYYMM } from '../services/PrdEngine';
import SpecialFlags from './SpecialFlags';

interface InfoBarProps {
  sailor: ISailor;
  prdTier: string;
  getPrdClass: (tier: string) => string;
}

function getRank(payGrade: string): string {
  const ranks: Record<string, string> = {
    'O-1': 'ENS', 'O-2': 'LTJG', 'O-3': 'LT', 'O-4': 'LCDR', 'O-5': 'CDR', 'O-6': 'CAPT',
    'O-7': 'RDML', 'O-8': 'RADM', 'O-9': 'VADM', 'O-10': 'ADM',
    'W-2': 'CWO2', 'W-3': 'CWO3', 'W-4': 'CWO4', 'W-5': 'CWO5'
  };
  return ranks[payGrade] || payGrade;
}

function MetaItem({ label, value, isFontData = false }: { label: string, value: string | undefined, isFontData?: boolean }) {
  return (
    <div className="flex flex-col gap-[2px] flex-shrink-0">
      <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] whitespace-nowrap">{label}</span>
      <span className={`text-[0.875rem] font-medium text-text-primary ${isFontData ? 'font-data' : ''} whitespace-nowrap`} title={value}>
        {value || '--'}
      </span>
    </div>
  );
}

export default function InfoBar({ sailor, prdTier, getPrdClass }: InfoBarProps) {
  const [showDodId, setShowDodId] = useState(false);
  const infoBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (infoBarRef.current) {
        const height = infoBarRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${64 + height}px`);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [sailor]);

  const isOfficer = sailor.payGrade.startsWith('O') || sailor.payGrade.startsWith('W');
  const rank = getRank(sailor.payGrade);
  const rateOrRankLabel = isOfficer ? 'Rank' : 'Rate';
  const rateOrRankValue = isOfficer ? rank : `${sailor.rate} ${sailor.payGrade}`;

  return (
    <div ref={infoBarRef} className="sticky top-16 z-40 bg-white border-b border-surface-border px-xl py-3 shadow-sm flex flex-col gap-3 min-h-[72px]">
      
      {/* Hero Row: Identity, Flags, Score */}
      <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-x-4 gap-y-2">
        
        {/* Left: Identity */}
        <div className="flex items-center gap-md flex-shrink-0">
          <span className={getPrdClass(prdTier)}>{prdTier}</span>
          <div className="flex items-baseline gap-sm">
            <h1 className="text-xl font-extrabold text-primary-navy tracking-[0.02em] m-0 uppercase whitespace-nowrap">
              {sailor.lastName.replace(/[^a-zA-Z0-9 ]/g, '')} {sailor.firstName.replace(/[^a-zA-Z0-9 ]/g, '')}
            </h1>
            <div className="flex items-center gap-1.5 ml-1">
              <button 
                onClick={() => setShowDodId(!showDodId)} 
                className="text-brand-navy hover:text-blue-600 transition-colors bg-blue-50/50 hover:bg-blue-100 p-1 rounded-full border border-blue-200"
                title="Toggle DOD ID"
              >
                <Info size={14} strokeWidth={2.5} />
              </button>
              {showDodId && (
                <span className="text-[0.875rem] font-medium text-text-muted font-data tracking-wide whitespace-nowrap animate-fade-in">
                  DOD ID: 1234567890
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Group Flags and Score to ensure they drop to the next line together on small screens */}
        <div className="flex flex-1 items-center justify-between xl:contents min-w-[280px] gap-4">
          
          {/* Center: Flags */}
          <div className="flex-auto flex justify-start xl:justify-center min-w-[150px]">
            <SpecialFlags sailor={sailor} />
          </div>

          {/* Right: Score Box */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] mb-1">Score</span>
              <div className="w-[48px] h-[48px] bg-bg-sunken border border-surface-border rounded-md shadow-sm flex items-center justify-center font-data font-bold text-lg text-text-muted">
                --
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipeable Metadata Row */}
      <div className="flex items-center overflow-x-auto hide-scrollbar gap-x-8 pt-3 pb-2 mt-1 border-t border-surface-border-subtle w-full mask-linear-right">
        <MetaItem label={rateOrRankLabel} value={rateOrRankValue} />
        <MetaItem label="Desig" value={isOfficer ? (sailor.designator || 'SWO') : 'N/A'} />
        <MetaItem label="Primary Phone" value={sailor.personalInfo?.contactInfo || '555-867-5309'} />
        <MetaItem label="Primary Email" value={`${sailor.firstName.toLowerCase()}.${sailor.lastName.toLowerCase()}@navy.mil`} />
        
        <MetaItem label="Command" value={sailor.command} />
        <MetaItem label="Billet" value={sailor.billet} />
        <MetaItem label="HMPT" value="Norfolk, VA" />
        <MetaItem label="PRD" value={formatYYMM(sailor.prd)} isFontData />

        {/* Proposed Orders (Appended as swipeable item) */}
        <div className="flex flex-col gap-[2px] flex-shrink-0 ml-2 pl-8 border-l border-surface-border-subtle">
          <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] whitespace-nowrap">Proposed Orders</span>
          <span className="text-[0.875rem] font-medium text-text-muted italic whitespace-nowrap">No orders currently proposed</span>
        </div>
      </div>

    </div>
  );
}
