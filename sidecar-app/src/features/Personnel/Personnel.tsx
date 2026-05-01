import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { SideCarAdapter } from '../../services/SideCarAdapter';
import { computePRDTier, formatYYMM } from '../../services/PrdEngine';
import type {
  ISailor, ICommEntry, IFormResponse,
  IBilletHistory, IQualification, IEducation, IPersonalInfo
} from '../../models/ISailor';

import Topbar from '../../components/Topbar';
import InfoBar from '../../components/InfoBar';
import ActionSidebar from '../../components/ActionSidebar';
import MasonryColumn from '../../components/Dashboard/MasonryColumn';
import SortableDataModule from '../../components/Dashboard/SortableDataModule';

/* ── Fallback synthetic data ────────────────── */
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


/* ── Helpers ─────────────────────────────────────── */
function isEnlisted(payGrade: string): boolean {
  return payGrade.startsWith('E');
}



/* ── Layout State ─────────────────────────── */
type LayoutState = { left: string[]; center: string[]; right: string[] };

const DEFAULT_LAYOUT: LayoutState = {
  left: ['mod-summary', 'mod-orders', 'mod-billet', 'mod-slating'],
  center: ['mod-milestones', 'mod-quals', 'mod-personal'],
  right: ['mod-physical', 'mod-separations', 'mod-comm']
};

/* ================================================================
   PERSONNEL — Main Component
   ================================================================ */
export default function Personnel() {
  const { id } = useParams<{ id: string }>();
  const [sailor, setSailor] = useState<ISailor | null>(null);
  const [commLog, setCommLog] = useState<ICommEntry[]>([]);
  const [formResponse, setFormResponse] = useState<IFormResponse | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const [layout, setLayout] = useState<LayoutState>(() => {
    const saved = localStorage.getItem('sidecar_dashboard_layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.left && parsed.center && parsed.right) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved layout', e);
      }
    }
    return DEFAULT_LAYOUT;
  });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  /* ── DND Handlers ─────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );



  const saveLayout = (newLayout: LayoutState) => {
    setLayout(newLayout);
    localStorage.setItem('sidecar_dashboard_layout', JSON.stringify(newLayout));
  };

  /* ── Data loading ───────────────────── */
  useEffect(() => {
    async function load(): Promise<void> {
      if (!id) return;
      const s: ISailor | null = await SideCarAdapter.getSailor(id);
      if (!s) return;
      setSailor(s);
      const log: ICommEntry[] = await SideCarAdapter.getCommLog(id);
      setCommLog(log.sort((a: ICommEntry, b: ICommEntry) => b.date.localeCompare(a.date)));
      const fr: IFormResponse | null = await SideCarAdapter.getFormResponses(id);
      setFormResponse(fr);
      
      // Ensure all required modules are present (handles users with cached old layouts)
      setLayout(prev => {
        const allModules = [...prev.left, ...prev.center, ...prev.right];
        const newLeft = [...prev.left];
        const newCenter = [...prev.center];
        const newRight = [...prev.right];
        let changed = false;

        const ensureModule = (modId: string, defaultCol: 'left' | 'center' | 'right') => {
          if (!allModules.includes(modId)) {
            if (defaultCol === 'left') newLeft.push(modId);
            else if (defaultCol === 'center') newCenter.push(modId);
            else newRight.push(modId);
            allModules.push(modId);
            changed = true;
          }
        };

        // Enforce base layout modules
        ensureModule('mod-summary', 'left');
        ensureModule('mod-orders', 'left');
        ensureModule('mod-billet', 'left');
        ensureModule('mod-slating', 'left');

        ensureModule('mod-milestones', 'center');
        ensureModule('mod-quals', 'center');
        ensureModule('mod-personal', 'center');

        ensureModule('mod-physical', 'right');
        ensureModule('mod-separations', 'right');
        ensureModule('mod-comm', 'right');

        // Conditionally merge prefs module if they have a form response
        if (fr && !allModules.includes('mod-prefs')) {
          newCenter.push('mod-prefs');
          changed = true;
        }

        return changed ? { left: newLeft, center: newCenter, right: newRight } : prev;
      });
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

  if (!sailor) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Topbar />
        <div className="flex items-center justify-center p-3xl text-text-muted">Loading sailor record...</div>
      </div>
    );
  }

  const prd = computePRDTier(sailor);
  const getPrdClass = (tier: string): string => {
    const base = 'font-data text-[0.625rem] font-semibold py-[3px] px-[8px] rounded-sm uppercase tracking-[0.06em] whitespace-nowrap';
    const t = tier.toLowerCase();
    if (t === 'expired') return `${base} bg-prd-expired-bg text-prd-expired-text`;
    if (t === 'critical') return `${base} bg-prd-critical-bg text-prd-critical-text`;
    if (t === 'urgent') return `${base} bg-prd-urgent-bg text-prd-urgent-text`;
    if (t === 'watch') return `${base} bg-prd-watch-bg text-prd-watch-text`;
    return `${base} bg-prd-stable-bg text-prd-stable-text`;
  };

  const billetHistory: IBilletHistory[] = sailor.billetHistory ?? FALLBACK_BILLET_HISTORY;
  const qualifications: IQualification[] = sailor.qualifications ?? FALLBACK_QUALIFICATIONS;
  const education: IEducation[] = sailor.education ?? FALLBACK_EDUCATION;
  const personalInfo: IPersonalInfo = sailor.personalInfo ?? FALLBACK_PERSONAL_INFO;
  const qualLabel: string = isEnlisted(sailor.payGrade) ? 'NECs' : 'AQDs';

  const handleExpand = (moduleId: string | null): void => setExpandedModule(moduleId);

  const findContainer = (id: string) => {
    if (layout.left.includes(id)) return 'left';
    if (layout.center.includes(id)) return 'center';
    if (layout.right.includes(id)) return 'right';
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId; // If over is a column

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setLayout((prev) => {
      const activeItems = prev[activeContainer as keyof LayoutState];
      const overItems = prev[overContainer as keyof LayoutState];
      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overItems.indexOf(overId);

      let newIndex;
      if (overId in prev) { // Dropping on an empty column
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: prev[activeContainer as keyof LayoutState].filter((item) => item !== activeId),
        [overContainer]: [
          ...prev[overContainer as keyof LayoutState].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer as keyof LayoutState].slice(newIndex, prev[overContainer as keyof LayoutState].length),
        ],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveDragId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId;

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = layout[activeContainer as keyof LayoutState].indexOf(activeId);
      const overIndex = layout[overContainer as keyof LayoutState].indexOf(overId);
      if (activeIndex !== overIndex) {
        const newCol = arrayMove(layout[activeContainer as keyof LayoutState], activeIndex, overIndex);
        saveLayout({ ...layout, [activeContainer]: newCol });
      }
    } else {
      // Just persist what handleDragOver arranged
      saveLayout(layout);
    }
    setActiveDragId(null);
  };

  /* ── Widget Registry ─────────────────── */
  const WIDGETS: Record<string, React.ReactNode> = {
    'mod-summary': (
      <SortableDataModule id="mod-summary" title="Professional Summary" expandedModule={expandedModule} onExpand={handleExpand}>
        <div className="flex items-center justify-center p-md text-text-muted italic text-[0.8125rem]">
          Content pending...
        </div>
      </SortableDataModule>
    ),
    'mod-slating': (
      <SortableDataModule id="mod-slating" title="Slating" expandedModule={expandedModule} onExpand={handleExpand}>
        <div className="flex items-center justify-center p-md text-text-muted italic text-[0.8125rem]">
          Content pending...
        </div>
      </SortableDataModule>
    ),
    'mod-milestones': (
      <SortableDataModule id="mod-milestones" title="Milestones" expandedModule={expandedModule} onExpand={handleExpand}>
        <div className="flex items-center justify-center p-md text-text-muted italic text-[0.8125rem]">
          Content pending...
        </div>
      </SortableDataModule>
    ),
    'mod-physical': (
      <SortableDataModule id="mod-physical" title="Physical Readiness" expandedModule={expandedModule} onExpand={handleExpand}>
        <div className="flex items-center justify-center p-md text-text-muted italic text-[0.8125rem]">
          Content pending...
        </div>
      </SortableDataModule>
    ),
    'mod-separations': (
      <SortableDataModule id="mod-separations" title="Separations" expandedModule={expandedModule} onExpand={handleExpand}>
        <div className="flex items-center justify-center p-md text-text-muted italic text-[0.8125rem]">
          Content pending...
        </div>
      </SortableDataModule>
    ),
    'mod-orders': (
      <SortableDataModule id="mod-orders" title="Career / Orders" expandedModule={expandedModule} onExpand={handleExpand}>
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
            <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Billet</span>
            <span className="text-[0.8125rem] font-medium text-text-primary">{sailor.billet}</span>
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">PRD / Avail Date</span>
            <span className="text-[0.8125rem] font-medium text-text-primary font-data">{formatYYMM(sailor.prd)}</span>
          </div>
        </div>
      </SortableDataModule>
    ),
    'mod-billet': (
      <SortableDataModule id="mod-billet" title="Billet History" expandedModule={expandedModule} onExpand={handleExpand}>
        <table className="w-full border-collapse font-data text-[0.75rem]">
          <thead className="text-left text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em] border-b border-surface-border">
            <tr>
              <th className="py-xs px-sm">Command</th>
              <th className="py-xs px-sm">Start</th>
              <th className="py-xs px-sm">End</th>
            </tr>
          </thead>
          <tbody>
            {billetHistory.map((bh: IBilletHistory, i: number) => (
              <tr key={i} className="border-b border-surface-border-subtle last:border-b-0 hover:bg-surface-border transition-colors duration-150 cursor-default" title={`UIC: ${bh.uic} | BSC: ${bh.bsc ?? 'N/A'}\nCommand: ${bh.command}\nBillet: ${bh.billet}`}>
                <td className="py-xs px-sm text-text-secondary truncate max-w-[160px] border-b border-dashed border-text-muted/30">{bh.command}</td>
                <td className="py-xs px-sm text-text-secondary truncate max-w-[70px]">{formatYYMM(bh.startDate)}</td>
                <td className="py-xs px-sm text-text-secondary truncate max-w-[70px]">{formatYYMM(bh.detachDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SortableDataModule>
    ),
    'mod-quals': (
      <SortableDataModule id="mod-quals" title="Qualifications & Education" expandedModule={expandedModule} onExpand={handleExpand}>
        <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-muted m-0 mb-sm">{qualLabel}</h3>
        <ol className="list-decimal pl-lg m-0 mb-sm">
          {qualifications.map((q: IQualification, i: number) => (
            <li key={i} className="text-[0.8125rem] text-text-secondary py-[2px]">
              <span className="font-data text-[0.75rem] font-semibold text-brand-gold mr-sm">{q.code}</span>
              <span className="text-text-primary">{q.title}</span>
            </li>
          ))}
        </ol>
        <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-text-muted m-0 mb-sm mt-lg">Education</h3>
        <table className="w-full border-collapse font-data text-[0.75rem]">
          <thead className="text-left text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em] border-b border-surface-border">
            <tr>
              <th className="py-xs px-sm">Degree</th>
              <th className="py-xs px-sm">Year</th>
              <th className="py-xs px-sm">Major</th>
            </tr>
          </thead>
          <tbody>
            {education.map((ed: IEducation, i: number) => (
              <tr key={i} className="border-b border-surface-border-subtle last:border-b-0">
                <td className="py-xs px-sm text-text-secondary truncate max-w-[80px]" title={ed.degree}>{ed.degree}</td>
                <td className="py-xs px-sm text-text-secondary truncate max-w-[60px]" title={ed.year}>{ed.year}</td>
                <td className="py-xs px-sm text-text-secondary truncate max-w-[120px]" title={ed.major}>{ed.major}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SortableDataModule>
    ),
    'mod-personal': (
      <SortableDataModule id="mod-personal" title="Personal Information" expandedModule={expandedModule} onExpand={handleExpand}>
        <div className="flex flex-col gap-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Family / Dependents</span>
            <span className="text-[0.8125rem] text-text-primary font-medium">{personalInfo.family ?? 'No data'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Duty Station</span>
            <span className="text-[0.8125rem] text-text-primary font-medium">{personalInfo.dutyStation ?? 'No data'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">Contact Info</span>
            <span className="text-[0.8125rem] text-text-primary font-medium">{personalInfo.contactInfo ?? 'No data'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.06em]">EFMP</span>
            <span className="text-[0.8125rem] text-text-primary font-medium">{personalInfo.efmp ?? 'Not enrolled'}</span>
          </div>
        </div>
      </SortableDataModule>
    ),
    'mod-prefs': formResponse ? (
      <SortableDataModule id="mod-prefs" title="Preferences Submitted" expandedModule={expandedModule} onExpand={handleExpand}>
        <div className="">
          {formResponse.billetChoices.map(c => (
            <div key={c.rank} className="flex items-start gap-sm py-sm border-b border-surface-border-subtle last:border-b-0">
              <span className="font-data text-[0.75rem] font-bold text-brand-gold min-w-[24px]">#{c.rank}</span>
              <div className="flex flex-col gap-[2px] min-w-0 flex-1">
                <span className="text-[0.8125rem] font-semibold text-text-primary truncate" title={c.billet}>{c.billet}</span>
                <span className="text-[0.75rem] text-text-muted truncate" title={`${c.command} — ${c.location}`}>{c.command} — {c.location}</span>
              </div>
            </div>
          ))}
        </div>
      </SortableDataModule>
    ) : null,

    'mod-comm': (
      <SortableDataModule id="mod-comm" title="Communication Log" expandedModule={expandedModule} onExpand={handleExpand}>
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
      </SortableDataModule>
    )
  };

  return (
    <div className="min-h-screen bg-surface-parchment flex flex-col font-sans">
      <Topbar />
      <InfoBar sailor={sailor} prdTier={prd.tier} getPrdClass={getPrdClass} />

      {expandedModule && (
        <div
          className="fixed inset-0 bg-bg-glass-dark z-[999]"
          onClick={() => setExpandedModule(null)}
          role="presentation"
        />
      )}

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto relative">
        <ActionSidebar />
        
        <main className="flex-1 p-lg px-xl min-w-0 transition-all duration-300">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col md:flex-row gap-lg items-start">
              <MasonryColumn id="left" items={layout.left}>
                {layout.left.map((id) => WIDGETS[id] ? <React.Fragment key={id}>{WIDGETS[id]}</React.Fragment> : null)}
              </MasonryColumn>
              <MasonryColumn id="center" items={layout.center}>
                {layout.center.map((id) => WIDGETS[id] ? <React.Fragment key={id}>{WIDGETS[id]}</React.Fragment> : null)}
              </MasonryColumn>
              <MasonryColumn id="right" items={layout.right}>
                {layout.right.map((id) => WIDGETS[id] ? <React.Fragment key={id}>{WIDGETS[id]}</React.Fragment> : null)}
              </MasonryColumn>
            </div>

            <DragOverlay dropAnimation={defaultDropAnimation}>
              {activeDragId ? (
                <div className="opacity-90 scale-105 shadow-2xl rounded-lg">
                  {WIDGETS[activeDragId]}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
    </div>
  );
}
