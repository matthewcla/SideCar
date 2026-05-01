import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SideCarAdapter } from '../services/SideCarAdapter';
import { computePRDTier, daysSinceContact, formatYYMM } from '../services/PrdEngine';
import type { ISailor, ICommEntry } from '../models/ISailor';

interface PrepCardProps {
  sailorId: string;
  onClose: () => void;
  onOpenRecord: (id: string) => void;
}

const COMM_ICONS: Record<string, string> = {
  phone: '📞',
  email: '📧',
  teams: '💬',
  note: '📋',
};

export default function PrepCard({ sailorId, onClose, onOpenRecord }: PrepCardProps) {
  const [sailor, setSailor] = useState<ISailor | null>(null);
  const [recentComms, setRecentComms] = useState<ICommEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await SideCarAdapter.getSailor(sailorId);
      setSailor(s);
      const log = await SideCarAdapter.getCommLog(sailorId);
      setRecentComms(log.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3));
    }
    load();
  }, [sailorId]);

  const handleCopyBookingLink = async () => {
    const { url } = await SideCarAdapter.getBookingLink();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!sailor) return null;

  const prd = computePRDTier(sailor);
  const contactDays = daysSinceContact(sailor);

  const getPrdClass = (tier: string) => {
    const base = 'font-data text-[0.625rem] font-semibold py-[3px] px-[8px] rounded-sm uppercase tracking-[0.06em] whitespace-nowrap shrink-0';
    switch (tier) {
      case 'EXPIRED': return `${base} bg-prd-expired-bg text-prd-expired-text`;
      case 'CRITICAL': return `${base} bg-prd-critical-bg text-prd-critical-text`;
      case 'URGENT': return `${base} bg-prd-urgent-bg text-prd-urgent-text`;
      case 'WATCH': return `${base} bg-prd-watch-bg text-prd-watch-text`;
      case 'STABLE': return `${base} bg-prd-stable-bg text-prd-stable-text`;
      default: return base;
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 z-[200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] max-h-[80vh] overflow-y-auto bg-bg-elevated border border-surface-border rounded-lg shadow-xl z-[201] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pt-[20px] px-[24px] pb-[16px] bg-brand-navy text-text-inverse rounded-t-lg">
          <div>
            <span className="font-data text-[0.6875rem] uppercase tracking-[0.1em] opacity-70">Appointment Prep</span>
            <h3 className="font-display text-[1.25rem] font-bold mt-[4px] leading-[1.2]">{sailor.lastName}, {sailor.firstName}</h3>
            <span className="font-data text-[0.8125rem] opacity-80 mt-[2px] block">{sailor.rate} {sailor.payGrade} · {sailor.command}</span>
          </div>
          <button className="bg-transparent border-none text-text-inverse text-base cursor-pointer p-[4px] opacity-60 transition-opacity duration-fast hover:opacity-100" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-[20px_24px] flex flex-col gap-[20px]">
          {/* PRD Status */}
          <div>
            <span className="block font-data text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-text-muted mb-[8px]">PRD Status</span>
            <div className="flex items-center gap-[12px]">
              <span className={getPrdClass(prd.tier)}>{prd.tier}</span>
              <span className="font-data text-[0.8125rem] text-text-secondary">{prd.label} · {formatYYMM(sailor.prd)}</span>
            </div>
          </div>

          {/* Key Fields */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <span className="block font-data text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-text-muted mb-[2px]">EAOS</span>
              <span className="font-data text-[0.8125rem] text-text-primary">{sailor.eaos}</span>
            </div>
            <div>
              <span className="block font-data text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-text-muted mb-[2px]">Last Contact</span>
              <span className={`font-data text-[0.8125rem] text-text-primary ${contactDays > 60 ? 'text-prd-expired-text' : ''}`}>
                {contactDays}d ago
              </span>
            </div>
            <div>
              <span className="block font-data text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-text-muted mb-[2px]">Billet</span>
              <span className="font-data text-[0.8125rem] text-text-primary">{sailor.billet}</span>
            </div>
            <div>
              <span className="block font-data text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-text-muted mb-[2px]">UIC</span>
              <span className="font-data text-[0.8125rem] text-text-primary">{sailor.uic}</span>
            </div>
          </div>

          {/* Recent Comms */}
          <div>
            <span className="block font-data text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-text-muted mb-[8px]">Recent Communications</span>
            {recentComms.length === 0 ? (
              <div className="text-[0.8125rem] text-text-muted not-italic">No communication history</div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {recentComms.map((entry, i) => (
                  <div key={i} className="flex items-start gap-[10px] py-[8px] px-[12px] bg-bg-sunken rounded-sm">
                    <span className="text-base shrink-0 mt-[2px]">{COMM_ICONS[entry.type] || '📋'}</span>
                    <div className="flex flex-col gap-[2px] min-w-0">
                      <span className="font-data text-[0.6875rem] text-text-muted">{entry.date}</span>
                      <span className="font-body text-[0.8125rem] text-text-primary leading-[1.4]">{entry.summary}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-[10px] pt-[16px] px-[24px] pb-[20px] border-t border-surface-border-subtle">
          <button 
            className="flex-1 py-[10px] px-[16px] rounded-md font-body text-[0.8125rem] font-semibold cursor-pointer transition-all duration-fast border text-center bg-brand-navy text-text-inverse border-brand-navy hover:bg-brand-navy-light hover:border-brand-navy-light hover:text-text-inverse" 
            onClick={() => onOpenRecord(sailorId)}
          >
            Open Full Record
          </button>
          <button 
            className="flex-1 py-[10px] px-[16px] rounded-md font-body text-[0.8125rem] font-semibold cursor-pointer transition-all duration-fast border text-center border-surface-border bg-bg-primary text-text-secondary hover:border-brand-gold hover:text-brand-gold" 
            onClick={handleCopyBookingLink}
          >
            {copied ? '✓ Copied!' : '📅 Copy Booking Link'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
