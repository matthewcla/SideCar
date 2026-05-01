import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SideCarAdapter } from '../../services/SideCarAdapter';
import { computePRDTier, daysSinceContact, formatYYMM } from '../../services/PrdEngine';
import { PIPELINE_STAGES } from '../../services/SyntheticData';
import type { ISailor, INotification, IOrderStatus, ICommEntry, IAppointment, IPrdResult } from '../../models/ISailor';
import Topbar from '../../components/Topbar';
import PrepCard from '../../components/PrepCard';

type Tab = 'roster' | 'calendar' | 'actions';

interface EnrichedSailor {
  sailor: ISailor;
  prd: IPrdResult;
  contactDays: number;
  orderStatus: IOrderStatus | null;
}

export default function Workspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('roster');
  const [sailors, setSailors] = useState<EnrichedSailor[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [selectedSailor, setSelectedSailor] = useState<ISailor | null>(null);
  const [commLog, setCommLog] = useState<ICommEntry[]>([]);
  const [commPanelOpen, setCommPanelOpen] = useState(false);
  const [prepCardSailorId, setPrepCardSailorId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'prd' | 'name' | 'contact'>('prd');

  // Load data
  useEffect(() => {
    async function load() {
      const s = await SideCarAdapter.getSailors();
      const statuses = await SideCarAdapter.getAllOrderStatuses();
      const enriched = s.map(sailor => ({
        sailor,
        prd: computePRDTier(sailor),
        contactDays: daysSinceContact(sailor),
        orderStatus: statuses.find(o => o.sailorId === sailor.id) || null
      }));
      setSailors(enriched);

      const n = await SideCarAdapter.getNotifications();
      setNotifications(n);

      // Get this week's appointments
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const appts = await SideCarAdapter.getAppointments({ start: fmt(monday), end: fmt(friday) });
      setAppointments(appts);
    }
    load();
  }, []);

  // Sort sailors
  const sorted = [...sailors].sort((a, b) => {
    if (sortKey === 'prd') {
      const order: Record<string, number> = { EXPIRED: 0, CRITICAL: 1, URGENT: 2, WATCH: 3, STABLE: 4 };
      return (order[a.prd.tier] ?? 5) - (order[b.prd.tier] ?? 5);
    }
    if (sortKey === 'name') return a.sailor.lastName.localeCompare(b.sailor.lastName);
    if (sortKey === 'contact') return b.contactDays - a.contactDays;
    return 0;
  });

  // Open comm panel
  const openCommPanel = async (sailor: ISailor) => {
    setSelectedSailor(sailor);
    const log = await SideCarAdapter.getCommLog(sailor.id);
    setCommLog(log.sort((a, b) => b.date.localeCompare(a.date)));
    setCommPanelOpen(true);
  };

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
  const getContactClass = (days: number) => {
    if (days > 60) return 'text-prd-expired-text';
    if (days > 30) return 'text-prd-urgent-text';
    if (days > 14) return 'text-prd-watch-text';
    return 'text-prd-stable-text';
  };
  const getPipelineLabel = (stage: string) => PIPELINE_STAGES.find(p => p.key === stage)?.label || '—';

  // Group appointments by day
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const appointmentsByDay: Record<string, IAppointment[]> = {};
  appointments.forEach(a => {
    if (!appointmentsByDay[a.date]) appointmentsByDay[a.date] = [];
    appointmentsByDay[a.date].push(a);
  });
  const sortedDays = Object.keys(appointmentsByDay).sort();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Topbar showDataMode />

      {/* Tab Bar */}
      <div className="flex px-xl bg-bg-elevated border-b border-surface-border-subtle gap-0">
        {(['roster', 'calendar', 'actions'] as Tab[]).map(t => (
          <button
            key={t}
            className={`py-md px-lg bg-transparent border-none border-b-2 font-body text-[0.8125rem] font-semibold cursor-pointer transition-all duration-fast hover:text-text-primary ${tab === t ? 'text-brand-gold border-brand-gold' : 'border-transparent text-text-muted'}`}
            onClick={() => setTab(t)}
          >
            {t === 'roster' && `Roster (${sailors.length})`}
            {t === 'calendar' && `Calendar (${appointments.length})`}
            {t === 'actions' && `Actions (${notifications.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 py-lg px-xl">
        {/* ROSTER TAB */}
        {tab === 'roster' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="roster">
            {/* Sort controls */}
            <div className="flex items-center gap-sm mb-md">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em]">Sort by:</span>
              {(['prd', 'name', 'contact'] as const).map(k => (
                <button
                  key={k}
                  className={`py-[4px] px-[12px] bg-transparent border rounded-full text-xs cursor-pointer transition-all duration-fast hover:border-brand-gold hover:text-brand-gold ${sortKey === k ? 'bg-brand-gold-glow border-brand-gold text-brand-gold font-semibold' : 'border-surface-border-subtle text-text-secondary font-medium'}`}
                  onClick={() => setSortKey(k)}
                >
                  {k === 'prd' ? 'PRD Tier' : k === 'name' ? 'Name' : 'Contact'}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-bg-elevated border border-surface-border rounded-md">
              <table className="w-full border-collapse text-[0.8125rem]">
                <thead>
                  <tr>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">PRD</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Name</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Rate</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Grade</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Command</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Billet</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Contact</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Pipeline</th>
                    <th className="py-[10px] px-[14px] text-left text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] bg-bg-sunken border-b border-surface-border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item, i) => (
                    <motion.tr
                      key={item.sailor.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="cursor-pointer transition-colors duration-fast hover:bg-brand-gold-glow"
                      onClick={() => openCommPanel(item.sailor)}
                    >
                      <td className="py-[10px] px-[14px] border-b border-surface-border-subtle align-middle"><span className={getPrdClass(item.prd.tier)}>{item.prd.tier === 'EXPIRED' ? 'EXP' : item.prd.label}</span></td>
                      <td className="font-semibold text-text-primary py-[10px] px-[14px] border-b border-surface-border-subtle align-middle">{item.sailor.lastName}, {item.sailor.firstName}</td>
                      <td className="font-data text-xs text-text-secondary py-[10px] px-[14px] border-b border-surface-border-subtle align-middle">{item.sailor.rate}</td>
                      <td className="font-data text-xs text-text-secondary py-[10px] px-[14px] border-b border-surface-border-subtle align-middle">{item.sailor.payGrade}</td>
                      <td className="text-xs text-text-muted max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap py-[10px] px-[14px] border-b border-surface-border-subtle align-middle">{item.sailor.command}</td>
                      <td className="text-xs text-text-secondary py-[10px] px-[14px] border-b border-surface-border-subtle align-middle">{item.sailor.billet}</td>
                      <td className="py-[10px] px-[14px] border-b border-surface-border-subtle align-middle"><span className={`font-data text-xs font-semibold ${getContactClass(item.contactDays)}`}>{item.contactDays}d</span></td>
                      <td className="py-[10px] px-[14px] border-b border-surface-border-subtle align-middle"><span className="font-data text-[0.625rem] text-text-muted bg-bg-sunken py-[2px] px-[6px] rounded-sm">{item.orderStatus ? getPipelineLabel(item.orderStatus.currentStage) : '—'}</span></td>
                      <td className="py-[10px] px-[14px] border-b border-surface-border-subtle align-middle">
                        <div className="flex gap-[4px]">
                          <button className="bg-transparent border border-surface-border-subtle rounded-sm py-[4px] px-[6px] text-xs cursor-pointer transition-all duration-fast hover:border-brand-gold hover:bg-brand-gold-glow" title="Email" onClick={e => { e.stopPropagation(); }}>📧</button>
                          <button className="bg-transparent border border-surface-border-subtle rounded-sm py-[4px] px-[6px] text-xs cursor-pointer transition-all duration-fast hover:border-brand-gold hover:bg-brand-gold-glow" title="Call" onClick={e => { e.stopPropagation(); }}>📞</button>
                          <button className="bg-transparent border border-surface-border-subtle rounded-sm py-[4px] px-[6px] text-xs cursor-pointer transition-all duration-fast hover:border-brand-gold hover:bg-brand-gold-glow" title="Note" onClick={e => { e.stopPropagation(); }}>📋</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* CALENDAR TAB */}
        {tab === 'calendar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="calendar">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md">
              {sortedDays.map((date, di) => (
                <div key={date} className="bg-bg-elevated border border-surface-border rounded-md overflow-hidden">
                  <div className="flex justify-between items-center py-[10px] px-[14px] bg-bg-sunken border-b border-surface-border-subtle">
                    <span className="text-[0.8125rem] font-bold text-text-primary">{dayNames[di] || date}</span>
                    <span className="font-data text-[0.6875rem] text-text-muted">{date}</span>
                  </div>
                  <div className="flex flex-col">
                    {appointmentsByDay[date].map(apt => (
                      <div key={apt.id} className="flex items-start gap-sm py-[10px] px-[14px] border-b border-surface-border-subtle cursor-pointer transition-colors duration-fast hover:bg-brand-gold-glow last:border-b-0" onClick={() => apt.sailorId && setPrepCardSailorId(apt.sailorId)}>
                        <span className="font-data text-[0.6875rem] font-semibold text-text-secondary min-w-[36px] shrink-0">{apt.time}</span>
                        <span className="text-xs shrink-0">
                          {apt.type === 'phone' ? '📞' : apt.type === 'video' ? '📹' : '🤝'}
                        </span>
                        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                          <span className="text-xs font-semibold text-text-primary">
                            {apt.sailor ? `${apt.sailor.lastName}, ${apt.sailor.firstName}` : 'Unknown'}
                          </span>
                          <span className="text-[0.6875rem] text-text-muted leading-[1.35]">{apt.reason}</span>
                        </div>
                        <span className="font-data text-[0.625rem] text-text-muted bg-bg-sunken py-[2px] px-[6px] rounded-sm shrink-0">{apt.duration}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ACTIONS TAB */}
        {tab === 'actions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="action-center">
            <h2 className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-text-secondary mb-md">Action Center</h2>
            {notifications.length === 0 ? (
              <div className="text-center py-3xl text-text-muted text-sm">No pending notifications</div>
            ) : (
              <div className="flex flex-col gap-sm">
                {notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    className={`flex items-start gap-sm py-[12px] px-[16px] bg-bg-elevated border border-surface-border-subtle rounded-md transition-all duration-fast hover:border-brand-gold ${n.type === 'prd_critical' ? 'border-l-4 border-l-prd-critical-dot' : n.type === 'stale_contact' ? 'border-l-4 border-l-prd-watch-dot' : n.type === 'form_overdue' ? 'border-l-4 border-l-prd-expired-dot' : ''}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="text-base shrink-0 mt-[2px]">{n.icon}</span>
                    <div className="flex flex-col gap-[2px] flex-1">
                      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-secondary">{n.title}</span>
                      <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{n.message}</span>
                    </div>
                    <button
                      className="bg-transparent border-none text-text-muted cursor-pointer text-sm p-[4px] transition-colors duration-fast hover:text-prd-expired-text"
                      onClick={async () => {
                        await SideCarAdapter.dismissNotification(n.id);
                        setNotifications(prev => prev.filter(x => x.id !== n.id));
                      }}
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Prep Card (Baseball Card) Modal */}
      <AnimatePresence>
        {prepCardSailorId && (
          <PrepCard
            sailorId={prepCardSailorId}
            onClose={() => setPrepCardSailorId(null)}
            onOpenRecord={(id) => {
              setPrepCardSailorId(null);
              navigate(`/personnel/${id}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Comm Panel Slide-out */}
      <AnimatePresence>
        {commPanelOpen && selectedSailor && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommPanelOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 w-[420px] max-w-[90vw] bg-bg-elevated border-l border-surface-border shadow-xl z-[101] flex flex-col overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-between items-start p-lg border-b border-surface-border-subtle bg-bg-sunken">
                <div>
                  <span className={getPrdClass(computePRDTier(selectedSailor).tier)}>
                    {computePRDTier(selectedSailor).tier}
                  </span>
                  <h3 className="text-[1.125rem] font-bold text-text-primary my-sm mb-[2px]">{selectedSailor.lastName}, {selectedSailor.firstName}</h3>
                  <span className="text-xs text-text-muted">{selectedSailor.rate} {selectedSailor.payGrade} · {selectedSailor.command}</span>
                </div>
                <button className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-[4px] hover:text-text-primary" onClick={() => setCommPanelOpen(false)}>✕</button>
              </div>

              <div className="grid grid-cols-2 gap-sm py-md px-lg border-b border-surface-border-subtle">
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">PRD</span>
                  <span className="font-data text-[0.8125rem] text-text-primary">{formatYYMM(selectedSailor.prd)}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">EAOS</span>
                  <span className="font-data text-[0.8125rem] text-text-primary">{selectedSailor.eaos}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">Billet</span>
                  <span className="font-data text-[0.8125rem] text-text-primary">{selectedSailor.billet}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em]">Last Contact</span>
                  <span className={`font-data text-[0.8125rem] text-text-primary ${getContactClass(daysSinceContact(selectedSailor))}`}>
                    {selectedSailor.lastContact} ({daysSinceContact(selectedSailor)}d ago)
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-md px-lg pb-sm">
                <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">Communication Log</h4>
                <span className="font-data text-[0.6875rem] text-text-muted">{commLog.length} entries</span>
              </div>

              <div className="flex-1 px-lg overflow-y-auto">
                {commLog.map((entry, i) => (
                  <div key={i} className="flex gap-sm py-sm border-b border-surface-border-subtle last:border-b-0">
                    <span className="text-[0.875rem] shrink-0 mt-[2px]">
                      {entry.type === 'phone' ? '📞' : entry.type === 'email' ? '📧' : entry.type === 'teams' ? '💬' : '📋'}
                    </span>
                    <div className="flex flex-col gap-[2px]">
                      <span className="font-data text-[0.6875rem] text-text-muted">{entry.date}</span>
                      <span className="text-[0.8125rem] text-text-primary leading-[1.4]">{entry.summary}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link to={`/personnel/${selectedSailor.id}`} className="block py-md px-lg text-center text-[0.8125rem] font-semibold text-brand-gold no-underline border-t border-surface-border-subtle transition-colors duration-fast hover:text-brand-gold-bright">
                View Full Record →
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
