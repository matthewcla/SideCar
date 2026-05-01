import React, { useState } from 'react';
import { 
  Scale, PauseCircle, Link2, HeartPulse, CalendarClock, 
  Activity, Baby, Home, PenTool, Star 
} from 'lucide-react';
import type { ISailor } from '../models/ISailor';
import { formatDDMMMYY } from '../services/PrdEngine';

interface SpecialFlagsProps {
  sailor: ISailor;
}

const FlagIcon = ({ 
  icon: Icon, name, colorClass, animation = '', 
  onClick = undefined, interactive = false, statusText = '' 
}: { 
  icon: React.ElementType, name: string, colorClass: string, animation?: string, 
  onClick?: () => void, interactive?: boolean, statusText?: string 
}) => {
  // Mocking a date added for visual purposes
  const dateAdded = formatDDMMMYY('2026-04-15');
  
  return (
    <div className="relative group flex items-center justify-center">
      <button 
        type="button" 
        onClick={onClick} 
        disabled={!interactive}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-sm ${colorClass} ${animation} ${interactive ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      >
        <Icon size={16} strokeWidth={2.5} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute top-full mt-2 w-max bg-bg-deep text-white text-[10px] font-medium py-1.5 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-lg flex flex-col gap-0.5 items-center">
        <span className="font-bold uppercase tracking-wider">{name}</span>
        {statusText && <span className="text-gray-300 font-semibold">{statusText}</span>}
        <span className="text-gray-400">Added: {dateAdded}</span>
      </div>
    </div>
  );
};

export default function SpecialFlags({ sailor }: SpecialFlagsProps) {
  // Local state overrides for mock interactability
  const [limduAck, setLimduAck] = useState(sailor.limduAcknowledged || false);
  const [opsdefAck, setOpsdefAck] = useState(sailor.opsdefAcknowledged || false);
  const [humsStatus, setHumsStatus] = useState(sailor.humsStatus || null);
  const [isOpen, setIsOpen] = useState(false);

  // Derivations
  const isLegalHold = sailor.s_int === '8' && !sailor.promotionSelectedButNotAdvanced;
  const isPromoHold = sailor.s_int === '8' && sailor.promotionSelectedButNotAdvanced;
  const isColo = sailor.s_int === '4' && sailor.isMarriedToActiveDuty;
  const isEFMP = sailor.s_int === '6' && sailor.hasDependentsInEFMP;
  const isPrdAdj = sailor.acc === '100';
  
  const limduActive = sailor.personalInfo?.limdu === 'Active';
  const opsdefActive = sailor.isPregnant;
  const humsActive = humsStatus !== null;
  
  const hasLA5 = sailor.qualifications?.some(q => q.code === 'LA5');
  const hasLN7 = sailor.qualifications?.some(q => q.code === 'LN7');
  
  const showDHRB = hasLA5 && !hasLN7;
  const showCmdEligible = hasLN7;

  const activeFlagsCount = [
    isLegalHold, isPromoHold, isColo, isEFMP, isPrdAdj,
    limduActive, opsdefActive, humsActive, showDHRB, showCmdEligible
  ].filter(Boolean).length;

  // Handlers
  const handleLimduClick = () => setLimduAck(true);
  const handleOpsdefClick = () => setOpsdefAck(true);
  
  const handleHumsClick = () => {
    if (humsStatus === 'pending') {
      const convened = window.confirm("HUMS: Board convened? (OK for Yes, Cancel for No)");
      if (convened) {
        setHumsStatus('board_convened');
      }
    } else if (humsStatus === 'board_convened') {
      const approved = window.confirm("HUMS: Approved? (OK for Yes, Cancel for Disapproved)");
      setHumsStatus(approved ? 'approved' : 'disapproved');
    }
  };

  const flags = [];

  const disconnectedClass = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
  const activeClass = 'bg-green-100 text-green-700 border-green-300';
  const actionClass = 'bg-red-50 text-red-700 border-red-500';

  // 1. Legal Hold
  flags.push(
    <FlagIcon 
      key="legal" icon={Scale} name="LEGAL" 
      colorClass={isLegalHold ? activeClass : disconnectedClass} 
      statusText={isLegalHold ? 'Active' : 'No Data'}
    />
  );

  // 2. Promo Hold
  flags.push(
    <FlagIcon 
      key="promo" icon={PauseCircle} name="PROMO" 
      colorClass={isPromoHold ? activeClass : disconnectedClass} 
      statusText={isPromoHold ? 'Active' : 'No Data'}
    />
  );

  // 3. Colocation
  flags.push(
    <FlagIcon 
      key="colo" icon={Link2} name="COLO" 
      colorClass={isColo ? activeClass : disconnectedClass} 
      statusText={isColo ? 'Active' : 'No Data'}
    />
  );

  // 4. EFMP
  flags.push(
    <FlagIcon 
      key="efmp" icon={HeartPulse} name="EFMP" 
      colorClass={isEFMP ? activeClass : disconnectedClass} 
      statusText={isEFMP ? 'Active' : 'No Data'}
    />
  );

  // 5. PRD ADJ
  flags.push(
    <FlagIcon 
      key="prd" icon={CalendarClock} name="PRD" 
      colorClass={isPrdAdj ? activeClass : disconnectedClass} 
      statusText={isPrdAdj ? 'Active' : 'No Data'}
    />
  );

  // 6. LIMDU
  flags.push(
    <FlagIcon 
      key="limdu" icon={Activity} name="LIMDU" 
      interactive={limduActive && !limduAck}
      onClick={limduActive ? handleLimduClick : undefined}
      colorClass={!limduActive ? disconnectedClass : (limduAck ? activeClass : actionClass)}
      animation={limduActive && !limduAck ? 'animate-flag-glow' : ''}
      statusText={!limduActive ? 'No Data' : (limduAck ? 'Acknowledged' : 'Action Required')}
    />
  );

  // 7. OPSDEF
  flags.push(
    <FlagIcon 
      key="opsdef" icon={Baby} name="OPDEF" 
      interactive={opsdefActive && !opsdefAck}
      onClick={opsdefActive ? handleOpsdefClick : undefined}
      colorClass={!opsdefActive ? disconnectedClass : (opsdefAck ? activeClass : actionClass)}
      animation={opsdefActive && !opsdefAck ? 'animate-flag-blink' : ''}
      statusText={!opsdefActive ? 'No Data' : (opsdefAck ? 'Acknowledged' : 'Action Required')}
    />
  );

  // 8. HUMS
  flags.push(
    <FlagIcon 
      key="hums" icon={Home} name="HUMS" 
      interactive={humsActive && humsStatus !== 'approved' && humsStatus !== 'disapproved'}
      onClick={humsActive ? handleHumsClick : undefined}
      colorClass={
        !humsActive ? disconnectedClass :
        humsStatus === 'approved' ? activeClass : 
        humsStatus === 'disapproved' ? disconnectedClass : 
        actionClass
      }
      animation={(humsActive && humsStatus !== 'approved' && humsStatus !== 'disapproved') ? 'animate-flag-blink' : ''}
      statusText={
        !humsActive ? 'No Data' :
        humsStatus === 'approved' ? 'Approved' :
        humsStatus === 'disapproved' ? 'Disapproved' :
        humsStatus === 'board_convened' ? 'Board Convened' : 'Pending Action'
      }
    />
  );
  
  // 9. DHRB Signer
  flags.push(
    <FlagIcon 
      key="dhrb" icon={PenTool} name="DHRB" 
      colorClass={showDHRB ? activeClass : disconnectedClass} 
      statusText={showDHRB ? 'Active' : 'No Data'}
    />
  );

  // 10. CMD Eligible
  flags.push(
    <FlagIcon 
      key="cmd" icon={Star} name="CMND" 
      colorClass={showCmdEligible ? activeClass : disconnectedClass} 
      statusText={showCmdEligible ? 'Active' : 'No Data'}
    />
  );

  return (
    <div className="relative flex items-center justify-center w-full lg:w-auto">
      {/* Expanded View (xl and up) */}
      <div className="hidden xl:flex bg-gray-50/80 border border-gray-100 rounded-full px-4 py-1.5 shadow-inner flex-wrap gap-2 items-center justify-center">
        {flags}
      </div>

      {/* Dropdown View (Below xl) */}
      <div className="flex xl:hidden flex-col items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-1.5 bg-white border border-surface-border rounded-full shadow-sm hover:shadow-md hover:border-brand-gold transition-all font-data text-xs uppercase tracking-wider font-semibold text-text-primary"
        >
          <span>Special Interests</span>
          {activeFlagsCount > 0 ? (
            <span className="bg-green-100 text-green-700 border border-green-300 px-1.5 py-0.5 rounded-full font-bold">{activeFlagsCount}</span>
          ) : (
            <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-bold">0</span>
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 lg:-translate-x-0 lg:right-0 lg:left-auto bg-white border border-surface-border rounded-lg shadow-xl p-4 z-50">
            <div className="grid grid-cols-5 gap-4">
              {flags}
            </div>
            {/* Click outside overlay */}
            <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
