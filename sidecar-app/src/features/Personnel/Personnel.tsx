import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SideCarAdapter } from '../../services/SideCarAdapter';
import { computePRDTier, daysSinceContact } from '../../services/PrdEngine';
import { PIPELINE_STAGES } from '../../services/SyntheticData';
import type {
  ISailor, ICommEntry, IOrderStatus, IFormResponse,
  IBilletHistory, IQualification, IEducation, IPersonalInfo, ICompassInsights
} from '../../models/ISailor';
import Topbar from '../../components/Topbar';

/* ── Fallback synthetic data for new fields ────────────────── */
const FALLBACK_BILLET_HISTORY: IBilletHistory[] = [
  { uic: 'XXXX4', command: 'USS PLACEHOLDER (DDG-00)', billet: 'Systems Admin', startDate: '2024-06-15', detachDate: '2026-06-14' },
  { uic: 'XXXX1', command: 'NAVSTA TESTPORT', billet: 'Help Desk Supervisor', startDate: '2021-07-01', detachDate: '2024-06-14' },
  { uic: 'XXXXX', command: 'USS EXAMPLE (CVN-00)', billet: 'IT Technician', startDate: '2018-09-10', detachDate: '2021-06-30' },
];

const FALLBACK_QUALIFICATIONS: IQualification[] = [
  { year: '2025', code: '742A', title: 'Network Security Vulnerability Technician', dateEarned: '2025-03-14' },
  { year: '2023', code: '746A', title: 'ISSM (Information Systems Security Manager)', dateEarned: '2023-08-22' },
  { year: '2021', code: '741A', title: 'Help Desk Technician', dateEarned: '2021-01-10' },
  { year: '2020', code: '0100', title: 'Basic Enlisted Submarine Qualification', dateEarned: '2020-05-01' },
];

const FALLBACK_EDUCATION: IEducation[] = [
  { degree: 'B.S.', year: '2024', major: 'Cybersecurity', university: 'UMGC (Online)' },
  { degree: 'A.A.S.', year: '2021', major: 'Information Technology', university: 'CCAF' },
];

const FALLBACK_PERSONAL_INFO: IPersonalInfo = {
  family: 'Married, 2 dependents (spouse + 1 child, age 7)',
  dutyStation: 'Naval Station Norfolk, VA',
  contactInfo: 'DSN: 564-1234 | NMCI: lastname.firstname@navy.mil',
  efmp: 'Not enrolled',
  limdu: 'None active',
  pfa: 'Passed (Outstanding) — Last cycle: MAR 2026',
};

const FALLBACK_COMPASS_INSIGHTS: ICompassInsights = {
  topRegions: 'Hampton Roads, VA — San Diego, CA — Pensacola, FL',
  trendingJobs: 'ISSM, Cyber Ops Watch Officer, Network Admin (Shore)',
  memberNotes: 'Prefers East Coast for family stability. Interested in cyber career path.',
  shortTermFocus: 'Complete ISSM certification; gain watch officer experience',
  longTermGoal: 'Warrant Officer (CWO2) — Cyber Warfare Technician',
  activeEducation: 'B.S. Cybersecurity — UMGC (12 credits remaining)',
  retentionIntent: 'Intends to reenlist — career Sailor',
  savedBillets: [
    'ISSM — NIOC Maryland, Fort Meade, MD',
    'Cyber Ops Watch Officer — NIOC Georgia, Fort Eisenhower, GA',
    'Network Admin — NAVSTA Norfolk, Norfolk, VA',
  ],
};

/* ── Maximize icon SVG ─────────────────────────────────────── */
function MaximizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2h5V0H0v7h2V2zM14 14h-5v2h7V9h-2v5z" fill="currentColor" />
      <path d="M14 2h-5V0h7v7h-2V2zM2 14h5v2H0V9h2v5z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 3.5L3.5 12.5M3.5 3.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Accordion Sub-component ───────────────────────────────── */
interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  return (
    <div className={`border-t border-surface-border-subtle mt-sm first:border-t-0 first:mt-0 ${open ? '' : ''}`}>
      <button className="flex items-center gap-sm w-full py-sm bg-transparent border-none cursor-pointer text-left text-text-secondary text-[0.8125rem] font-semibold transition-colors duration-150 hover:text-text-primary" onClick={() => setOpen(prev => !prev)} type="button">
        <span className="text-[0.625rem] text-text-muted w-[12px] shrink-0">{open ? '\u25BC' : '\u25B6'}</span>
        <span className="flex-1">{title}</span>
      </button>
      {open && <div className="px-0 pb-sm pl-lg">{children}</div>}
    </div>
  );
}

/* ── RevealOnScroll — progressive disclosure wrapper ──────── */
const revealVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function RevealOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── DataModule wrapper ────────────────────────────────────── */
interface DataModuleProps {
  id: string;
  title: string;
  column: 'left' | 'right';
  expandedModule: string | null;
  onExpand: (id: string | null) => void;
  children: React.ReactNode;
}

function DataModule({ id, title, column, expandedModule, onExpand, children }: DataModuleProps) {
  const isExpanded: boolean = expandedModule === id;
  const titleClass: string = column === 'left' ? 'font-body text-[20px] font-extrabold m-0 tracking-[0.01em] text-brand-gold' : 'font-body text-[20px] font-extrabold m-0 tracking-[0.01em] text-brand-navy';

  return (
    <div className={`bg-bg-elevated border border-surface-border rounded-lg p-lg mb-lg ${isExpanded ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[900px] max-h-[90vh] overflow-y-auto z-[1000] shadow-[0_24px_64px_rgba(0,0,0,0.3)] border-brand-gold-dim' : ''}`} data-module-id={id}>
      <div className="flex flex-row items-center justify-between mb-md">
        <h2 className={titleClass}>{title}</h2>
        <button
          className="flex items-center justify-center w-[28px] h-[28px] border border-surface-border-subtle rounded-sm bg-bg-primary text-text-muted cursor-pointer transition-all duration-150 shrink-0 hover:bg-bg-sunken hover:text-text-primary hover:border-surface-border"
          onClick={() => onExpand(isExpanded ? null : id)}
          type="button"
          aria-label={isExpanded ? 'Close modal' : 'Expand module'}
        >
          {isExpanded ? <CloseIcon /> : <MaximizeIcon />}
        </button>
      </div>
      <div className="">
        {children}
      </div>
    </div>
  );
}

/* ── Helper: determine if enlisted ─────────────────────────── */
function isEnlisted(payGrade: string): boolean {
  return payGrade.startsWith('E');
}

/* ================================================================
   PERSONNEL — Main Component
   ================================================================ */
export default function Personnel() {
  const { id } = useParams<{ id: string }>();
  const [sailor, setSailor] = useState<ISailor | null>(null);
  const [commLog, setCommLog] = useState<ICommEntry[]>([]);
  const [orderStatus, setOrderStatus] = useState<IOrderStatus | null>(null);
  const [formResponse, setFormResponse] = useState<IFormResponse | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Data loading (C-09: all through SideCarAdapter) ───── */
  useEffect(() => {
    async function load(): Promise<void> {
      if (!id) return;
      const s: ISailor | null = await SideCarAdapter.getSailor(id);
      if (!s) return;
      setSailor(s);
      const log: ICommEntry[] = await SideCarAdapter.getCommLog(id);
      setCommLog(log.sort((a: ICommEntry, b: ICommEntry) => b.date.localeCompare(a.date)));
      const os: IOrderStatus | null = await SideCarAdapter.getOrderStatus(id);
      setOrderStatus(os);
      const fr: IFormResponse | null = await SideCarAdapter.getFormResponses(id);
      setFormResponse(fr);
    }
    load();
  }, [id]);

  /* ── Escape key to close modal ─────────────────────────── */
  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (e.key === 'Escape' && expandedModule) {
      setExpandedModule(null);
    }
  }, [expandedModule]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* ── Radar chart ───────────────────────────────────────── */
  useEffect(() => {
    if (!sailor || !canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;

    const width: number = canvas.width;
    const height: number = canvas.height;
    const centerX: number = width / 2;
    const centerY: number = height / 2;
    const radius: number = Math.min(centerX, centerY) - 20;
    const numPoints: number = 5;
    const angleStep: number = (Math.PI * 2) / numPoints;

    ctx.clearRect(0, 0, width, height);

    const current: number[] = [78, 85, 62, 90, 70];
    const target: number[] = [85, 90, 80, 95, 85];

    // Grid
    const styles: CSSStyleDeclaration = getComputedStyle(document.documentElement);
    const borderColor: string = styles.getPropertyValue('--color-border').trim() || '#D4CFC7';
    const mutedColor: string = styles.getPropertyValue('--color-text-muted').trim() || '#999999';
    const goldColor: string = styles.getPropertyValue('--color-gold').trim() || '#9A7A0A';
    const stableColor: string = styles.getPropertyValue('--color-prd-stable-text').trim() || '#166534';

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const r: number = (radius / 4) * i;
      ctx.beginPath();
      for (let j = 0; j < numPoints; j++) {
        const angle: number = (Math.PI / 2) - (j * angleStep);
        const x: number = centerX + r * Math.cos(angle);
        const y: number = centerY - r * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Axes
    ctx.beginPath();
    for (let j = 0; j < numPoints; j++) {
      const angle: number = (Math.PI / 2) - (j * angleStep);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY - radius * Math.sin(angle));
    }
    ctx.stroke();

    // Labels
    const labels: string[] = ['Technical', 'Leadership', 'Quals', 'Evals', 'PRT'];
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.textAlign = 'center';
    for (let j = 0; j < numPoints; j++) {
      const angle: number = (Math.PI / 2) - (j * angleStep);
      const lx: number = centerX + (radius + 16) * Math.cos(angle);
      const ly: number = centerY - (radius + 16) * Math.sin(angle);
      ctx.fillText(labels[j], lx, ly + 4);
    }

    function drawPoly(data: number[], fillColor: string, strokeColor: string): void {
      if (!ctx) return;
      ctx.beginPath();
      for (let j = 0; j < numPoints; j++) {
        const angle: number = (Math.PI / 2) - (j * angleStep);
        const r: number = radius * (data[j] / 100);
        const x: number = centerX + r * Math.cos(angle);
        const y: number = centerY - r * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    drawPoly(target, `${goldColor}1A`, goldColor);
    drawPoly(current, `${stableColor}33`, stableColor);
  }, [sailor]);

  /* ── Loading state ─────────────────────────────────────── */
  if (!sailor) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Topbar />
        <div className="flex items-center justify-center p-3xl text-text-muted">Loading sailor record...</div>
      </div>
    );
  }

  /* ── Derived values ────────────────────────────────────── */
  const prd = computePRDTier(sailor);
  const cd: number = daysSinceContact(sailor);
  const getPrdClass = (tier: string): string => {
    const base = 'font-data text-[0.625rem] font-semibold py-[3px] px-[8px] rounded-sm uppercase tracking-[0.06em] whitespace-nowrap';
    const t = tier.toLowerCase();
    if (t === 'expired') return `${base} bg-prd-expired-bg text-prd-expired-text`;
    if (t === 'critical') return `${base} bg-prd-critical-bg text-prd-critical-text`;
    if (t === 'urgent') return `${base} bg-prd-urgent-bg text-prd-urgent-text`;
    if (t === 'watch') return `${base} bg-prd-watch-bg text-prd-watch-text`;
    return `${base} bg-prd-stable-bg text-prd-stable-text`;
  };
  const getContactClass = (days: number): string => {
    if (days > 60) return 'text-prd-expired-text';
    if (days > 30) return 'text-prd-urgent-text';
    if (days > 14) return 'text-prd-watch-text';
    return 'text-prd-stable-text';
  };

  const currentStageIdx: number = orderStatus
    ? PIPELINE_STAGES.findIndex(p => p.key === orderStatus.currentStage)
    : -1;

  /* ── Resolve data with fallbacks ───────────────────────── */
  const billetHistory: IBilletHistory[] = sailor.billetHistory ?? FALLBACK_BILLET_HISTORY;
  const qualifications: IQualification[] = sailor.qualifications ?? FALLBACK_QUALIFICATIONS;
  const education: IEducation[] = sailor.education ?? FALLBACK_EDUCATION;
  const personalInfo: IPersonalInfo = sailor.personalInfo ?? FALLBACK_PERSONAL_INFO;
  const compassInsights: ICompassInsights = sailor.compassInsights ?? FALLBACK_COMPASS_INSIGHTS;
  const qualLabel: string = isEnlisted(sailor.payGrade) ? 'NECs' : 'AQDs';

  const handleExpand = (moduleId: string | null): void => {
    setExpandedModule(moduleId);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Topbar />

      {/* Modal backdrop */}
      {expandedModule && (
        <div
          className="fixed inset-0 bg-bg-glass-dark z-[999]"
          onClick={() => setExpandedModule(null)}
          role="presentation"
        />
      )}

      <main className="flex-1 p-lg px-xl max-w-[1200px] mx-auto w-full">
        {/* ── Header Card (full width) ─────────────────── */}
        <motion.section
          className="bg-bg-elevated border border-surface-border rounded-lg p-lg mb-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-md mb-md">
            <span className={getPrdClass(prd.tier)}>{prd.tier}</span>
            <h1 className="text-[1.5rem] font-extrabold text-text-primary tracking-[0.02em]">{sailor.lastName}, {sailor.firstName}</h1>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-md">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">Rate / Grade</span>
              <span className="text-[0.875rem] font-medium text-text-primary">{sailor.rate} {sailor.payGrade}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">Command</span>
              <span className="text-[0.875rem] font-medium text-text-primary">{sailor.command}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">UIC</span>
              <span className="text-[0.875rem] font-medium text-text-primary font-data text-[0.8125rem]">{sailor.uic}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">Billet</span>
              <span className="text-[0.875rem] font-medium text-text-primary">{sailor.billet}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">PRD</span>
              <span className="text-[0.875rem] font-medium text-text-primary font-data text-[0.8125rem]">{sailor.prd} ({prd.label})</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">EAOS</span>
              <span className="text-[0.875rem] font-medium text-text-primary font-data text-[0.8125rem]">{sailor.eaos}</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">Last Contact</span>
              <span className={`text-[0.875rem] font-medium text-text-primary font-data text-[0.8125rem] ${getContactClass(cd)}`}>
                {sailor.lastContact} ({cd}d ago)
              </span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">Detailer</span>
              <span className="text-[0.875rem] font-medium text-text-primary">{sailor.detailer}</span>
            </div>
          </div>
        </motion.section>

        {/* ── Pipeline (full width) ────────────────────── */}
        {orderStatus && (
          <motion.section
            className="bg-bg-elevated border border-surface-border rounded-md p-lg mb-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-text-secondary mb-md">Order Pipeline</h2>
            <div className="flex gap-xs items-center">
              {PIPELINE_STAGES.map((stage, i) => (
                <div
                  key={stage.key}
                  className={`flex items-center gap-xs flex-1 p-sm px-md rounded-sm transition-all duration-base ${i <= currentStageIdx ? 'bg-bg-sunken' : 'bg-bg-sunken'} ${i === currentStageIdx ? '!bg-brand-gold-glow border border-brand-gold-dim' : ''}`}
                >
                  <div className={`w-[10px] h-[10px] rounded-full shrink-0 transition-all duration-base ${i <= currentStageIdx ? 'bg-prd-stable-dot' : 'bg-surface-border'} ${i === currentStageIdx ? '!bg-brand-gold shadow-[0_0_6px_var(--color-gold-glow)]' : ''}`} />
                  <span className={`text-[0.6875rem] whitespace-nowrap ${i <= currentStageIdx ? 'text-prd-stable-text' : 'text-text-muted'} ${i === currentStageIdx ? '!text-brand-gold font-bold' : 'font-medium'}`}>{stage.fullLabel}</span>
                </div>
              ))}
            </div>
            {orderStatus.blockers && (
              <div className="mt-md p-sm px-md bg-prd-critical-bg text-prd-critical-text rounded-sm text-[0.8125rem] font-medium">
                Blocker: {orderStatus.blockers}
              </div>
            )}
          </motion.section>
        )}

        {/* ── Two-Column Module Layout ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

          {/* ════ LEFT COLUMN — Career ════ */}
          <div className="min-w-0">

            {/* MOD: Career / Orders */}
            <DataModule id="mod-orders" title="Career / Orders" column="left" expandedModule={expandedModule} onExpand={handleExpand}>
              <div className="grid grid-cols-2 gap-y-sm gap-x-md mb-md">
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Command</span>
                  <span className="text-[0.8125rem] font-medium text-text-primary">{sailor.command}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">UIC</span>
                  <span className="text-[0.8125rem] font-medium text-text-primary font-data">{sailor.uic}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">BSC</span>
                  <span className="text-[0.8125rem] font-medium text-text-primary font-data">{sailor.bsc ?? 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Billet</span>
                  <span className="text-[0.8125rem] font-medium text-text-primary">{sailor.billet}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">COG</span>
                  <span className="text-[0.8125rem] font-medium text-text-primary font-data">{sailor.designator ?? 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">PRD / Avail Date</span>
                  <span className="text-[0.8125rem] font-medium text-text-primary font-data">{sailor.prd}</span>
                </div>
              </div>
              <Accordion title="Proposed Orders">
                {orderStatus ? (
                  <div className="flex flex-col gap-xs text-[0.8125rem] text-text-secondary">
                    <p className="">
                      <strong>Stage:</strong> {PIPELINE_STAGES.find(s => s.key === orderStatus.currentStage)?.fullLabel ?? orderStatus.currentStage}
                    </p>
                    <p className=""><strong>Stage Date:</strong> {orderStatus.stageDate}</p>
                    {orderStatus.blockers && (
                      <p className="text-prd-critical-text"><strong>Blocker:</strong> {orderStatus.blockers}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[0.8125rem] text-text-muted italic m-0">No proposed orders on file.</p>
                )}
              </Accordion>
            </DataModule>

            {/* MOD: Billet History */}
            <RevealOnScroll>
            <DataModule id="mod-billet" title="Billet History" column="left" expandedModule={expandedModule} onExpand={handleExpand}>
              <table className="w-full border-collapse font-data text-[0.75rem]">
                <thead className="text-left text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em] border-b border-surface-border">
                  <tr>
                    <th className="py-xs px-sm">UIC</th>
                    <th className="py-xs px-sm">Command</th>
                    <th className="py-xs px-sm">Billet</th>
                    <th className="py-xs px-sm">Start</th>
                    <th className="py-xs px-sm">Detach</th>
                  </tr>
                </thead>
                <tbody>
                  {billetHistory.map((bh: IBilletHistory, i: number) => (
                    <tr key={i} className="border-b border-surface-border-subtle last:border-b-0">
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{bh.uic}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{bh.command}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{bh.billet}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{bh.startDate}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{bh.detachDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataModule>
            </RevealOnScroll>

            {/* MOD: Qualifications & Education */}
            <RevealOnScroll delay={0.05}>
            <DataModule id="mod-quals" title={`Qualifications & Education`} column="left" expandedModule={expandedModule} onExpand={handleExpand}>
              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-muted m-0 mb-sm">{qualLabel}</h3>
              <ol className="list-decimal pl-lg m-0 mb-sm">
                {qualifications.map((q: IQualification, i: number) => (
                  <li key={i} className="text-[0.8125rem] text-text-secondary py-[2px]">
                    <span className="font-data text-[0.75rem] font-semibold text-brand-gold mr-sm">{q.code}</span>
                    <span className="text-text-primary">{q.title}</span>
                  </li>
                ))}
              </ol>
              <Accordion title={`${qualLabel} Descriptions`}>
                <div className="flex flex-col gap-sm">
                  {qualifications.map((q: IQualification, i: number) => (
                    <div key={i} className="flex flex-col gap-[2px] py-xs border-b border-surface-border-subtle last:border-b-0">
                      <span className="font-data text-[0.6875rem] font-semibold text-brand-gold">{q.code}</span>
                      <span className="text-[0.8125rem] text-text-primary font-medium">{q.title}</span>
                      <span className="font-data text-[0.6875rem] text-text-muted">Earned: {q.dateEarned}</span>
                    </div>
                  ))}
                </div>
              </Accordion>

              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-muted m-0 mb-sm mt-lg">Education</h3>
              <table className="w-full border-collapse font-data text-[0.75rem]">
                <thead className="text-left text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em] border-b border-surface-border">
                  <tr>
                    <th className="py-xs px-sm">Degree</th>
                    <th className="py-xs px-sm">Year</th>
                    <th className="py-xs px-sm">Major</th>
                    <th className="py-xs px-sm">University</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map((ed: IEducation, i: number) => (
                    <tr key={i} className="border-b border-surface-border-subtle last:border-b-0">
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{ed.degree}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{ed.year}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{ed.major}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{ed.university}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataModule>
            </RevealOnScroll>

            {/* MOD: Personal Information */}
            <RevealOnScroll delay={0.1}>
            <DataModule id="mod-personal" title="Personal Information" column="left" expandedModule={expandedModule} onExpand={handleExpand}>
              <Accordion title="Family / Dependents" defaultOpen>
                <p className="text-[0.8125rem] text-text-secondary leading-[1.5] m-0">{personalInfo.family ?? 'No data on file.'}</p>
              </Accordion>
              <Accordion title="Duty Station">
                <p className="text-[0.8125rem] text-text-secondary leading-[1.5] m-0">{personalInfo.dutyStation ?? 'No data on file.'}</p>
              </Accordion>
              <Accordion title="PRD">
                <p className="text-[0.8125rem] text-text-secondary leading-[1.5] m-0">{sailor.prd} — {prd.label}</p>
              </Accordion>
              <Accordion title="Contact Info">
                <p className="text-[0.8125rem] text-text-secondary leading-[1.5] m-0">{personalInfo.contactInfo ?? 'No data on file.'}</p>
              </Accordion>
              <Accordion title="EFMP">
                <p className="text-[0.8125rem] text-text-secondary leading-[1.5] m-0">{personalInfo.efmp ?? 'Not enrolled'}</p>
              </Accordion>
              <Accordion title="LIMDU / OPSDEF">
                <p className="text-[0.8125rem] text-text-secondary leading-[1.5] m-0">{personalInfo.limdu ?? 'None active'}</p>
              </Accordion>
              <Accordion title="PFA History">
                <p className="text-[0.8125rem] text-text-secondary leading-[1.5] m-0">{personalInfo.pfa ?? 'No PFA data on file.'}</p>
              </Accordion>
            </DataModule>
            </RevealOnScroll>

            {/* MOD: Radar Chart (Competitiveness) */}
            <RevealOnScroll delay={0.15}>
            <div className="data-module">
              <div className="flex flex-row items-center justify-between mb-md">
                <h2 className="data-module-title data-module-title--gold">Competitiveness Profile</h2>
              </div>
              <div className="">
                <div className="flex flex-col items-center gap-sm">
                  <canvas ref={canvasRef} width={280} height={280} className="block" />
                  <div className="flex gap-lg text-[0.75rem] text-text-muted">
                    <span className="flex items-center gap-[6px]"><span className="w-[10px] h-[10px] rounded-full bg-prd-stable-text" /> Current</span>
                    <span className="flex items-center gap-[6px]"><span className="w-[10px] h-[10px] rounded-full bg-brand-gold" /> Target</span>
                  </div>
                </div>
              </div>
            </div>
            </RevealOnScroll>

            {/* MOD: Preferences */}
            {formResponse && (
              <RevealOnScroll delay={0.2}>
              <DataModule id="mod-prefs" title="Preferences Submitted" column="left" expandedModule={expandedModule} onExpand={handleExpand}>
                <div className="">
                  {formResponse.billetChoices.map(c => (
                    <div key={c.rank} className="flex items-start gap-sm py-sm border-b border-surface-border-subtle last:border-b-0">
                      <span className="font-data text-[0.75rem] font-bold text-brand-gold min-w-[24px]">#{c.rank}</span>
                      <div className="flex flex-col gap-[2px]">
                        <span className="text-[0.8125rem] font-semibold text-text-primary">{c.billet}</span>
                        <span className="text-[0.75rem] text-text-muted">{c.command} — {c.location}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col gap-xs mt-md pt-md border-t border-surface-border-subtle text-[0.8125rem] text-text-secondary">
                    <span><strong>Geo:</strong> {formResponse.geoPreference}</span>
                    <span><strong>Sea/Shore:</strong> {formResponse.seaShore}</span>
                    {formResponse.coloStatus.requested && (
                      <span><strong>COLO:</strong> {formResponse.coloStatus.spouseInfo}</span>
                    )}
                    {formResponse.efmpStatus.enrolled && (
                      <span><strong>EFMP:</strong> {formResponse.efmpStatus.category}</span>
                    )}
                    {formResponse.specialCircumstances !== 'None' && (
                      <span><strong>Special:</strong> {formResponse.specialCircumstances}</span>
                    )}
                  </div>
                </div>
              </DataModule>
              </RevealOnScroll>
            )}
          </div>

          {/* ════ RIGHT COLUMN — Compass ════ */}
          <div className="min-w-0">

            {/* MOD: Compass Info Insights */}
            <DataModule id="mod-compass" title="Compass Info Insights" column="right" expandedModule={expandedModule} onExpand={handleExpand}>
              <div className="flex flex-col gap-md mb-md">
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Top Searched Regions</span>
                  <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{compassInsights.topRegions ?? 'No data'}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Trending Job Prefs</span>
                  <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{compassInsights.trendingJobs ?? 'No data'}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Member Notes</span>
                  <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{compassInsights.memberNotes ?? 'None'}</span>
                </div>
              </div>
              <Accordion title="Career Intentions" defaultOpen>
                <div className="flex flex-col gap-md">
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Short-Term Focus</span>
                    <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{compassInsights.shortTermFocus ?? 'Not specified'}</span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Long-Term Goal</span>
                    <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{compassInsights.longTermGoal ?? 'Not specified'}</span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Active Education</span>
                    <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{compassInsights.activeEducation ?? 'None on record'}</span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Retention Intent</span>
                    <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{compassInsights.retentionIntent ?? 'Unknown'}</span>
                  </div>
                </div>
              </Accordion>
            </DataModule>

            {/* MOD: Application History */}
            <RevealOnScroll>
            <DataModule id="mod-apps" title="Application History" column="right" expandedModule={expandedModule} onExpand={handleExpand}>
              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-muted m-0 mb-sm">Saved / Favorited Billets</h3>
              {compassInsights.savedBillets && compassInsights.savedBillets.length > 0 ? (
                <ul className="list-none p-0 m-0 mb-sm">
                  {compassInsights.savedBillets.map((b: string, i: number) => (
                    <li key={i} className="text-[0.8125rem] text-text-secondary py-xs border-b border-surface-border-subtle pl-sm relative last:border-b-0 before:content-['★'] before:absolute before:left-0 before:text-brand-gold before:text-[0.625rem] before:top-[6px]">{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.8125rem] text-text-muted italic m-0">No saved billets.</p>
              )}

              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-muted m-0 mb-sm mt-lg">Formal Application History</h3>
              {formResponse ? (
                <table className="w-full border-collapse font-data text-[0.75rem]">
                  <thead className="text-left text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em] border-b border-surface-border">
                  <tr>
                    <th className="py-xs px-sm">Form</th>
                    <th className="py-xs px-sm">Submitted</th>
                    <th className="py-xs px-sm">Top Choice</th>
                  </tr>
                </thead>
                  <tbody>
                    <tr className="border-b border-surface-border-subtle last:border-b-0">
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{formResponse.formType}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{formResponse.submittedDate}</td>
                      <td className="py-xs px-sm text-text-secondary whitespace-nowrap">{formResponse.billetChoices[0]?.billet ?? 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-[0.8125rem] text-text-muted italic m-0">No formal applications on record.</p>
              )}
            </DataModule>
            </RevealOnScroll>

            {/* MOD: Communication Log */}
            <RevealOnScroll delay={0.05}>
            <DataModule id="mod-comm" title="Communication Log" column="right" expandedModule={expandedModule} onExpand={handleExpand}>
              <div className="flex justify-end items-center mb-sm">
                <span className="font-data text-[0.6875rem] text-text-muted">{commLog.length} entries</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {commLog.map((entry: ICommEntry, i: number) => (
                  <div key={i} className="flex gap-sm py-sm border-b border-surface-border-subtle last:border-b-0">
                    <span className="text-[0.875rem] shrink-0 mt-[2px]">
                      {entry.type === 'phone' ? '\u260E' : entry.type === 'email' ? '\u2709' : entry.type === 'teams' ? '\u{1F4AC}' : '\u{1F4CB}'}
                    </span>
                    <div className="flex flex-col gap-[2px]">
                      <span className="font-data text-[0.6875rem] text-text-muted">{entry.date}</span>
                      <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{entry.summary}</span>
                    </div>
                  </div>
                ))}
                {commLog.length === 0 && <p className="text-[0.8125rem] text-text-muted italic m-0">No communication entries.</p>}
              </div>
            </DataModule>
            </RevealOnScroll>
          </div>
        </div>
      </main>
    </div>
  );
}
