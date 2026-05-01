import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SideCarAdapter } from '../../services/SideCarAdapter';
import { computePRDTier, daysSinceContact, formatYYMM } from '../../services/PrdEngine';
import type { ISailor } from '../../models/ISailor';

export default function Landing() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ISailor[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hoveredSailor, setHoveredSailor] = useState<ISailor | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load notification count for Smart Pill
  useEffect(() => {
    async function loadSummary() {
      const notifications = await SideCarAdapter.getNotifications();
      setNotificationCount(notifications.length);
    }
    loadSummary();
  }, []);

  // Search handler
  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const sailors = await SideCarAdapter.getSailors();
    // Multi-term AND search — matches sidecar-concept filterSailors logic
    const terms = q.trim().toLowerCase().split(/\s+/);
    const matched = sailors.filter(s => {
      const text = [s.lastName, s.firstName, s.rate, s.payGrade, s.command, s.uic].join(' ').toLowerCase();
      return terms.every(t => text.includes(t));
    });
    setResults(matched);
    setShowResults(true);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (results.length > 0) {
        navigate(`/personnel/${results[0].id}`);
      }
    }
  };

  // Hover card
  const handleMouseEnter = (sailor: ISailor, e: React.MouseEvent) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoverPos({ x: rect.right + 12, y: rect.top });
    setHoveredSailor(sailor);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredSailor(null), 200);
  };

  // Close results on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    if (days > 60) return 'text-prd-expired-text font-bold';
    if (days > 30) return 'text-prd-critical-text font-semibold';
    if (days > 14) return 'text-prd-urgent-text';
    return 'text-prd-stable-text';
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-xl relative bg-bg-primary"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Corner Brackets */}
      <div className="fixed w-[40px] h-[40px] z-[100] top-[20px] left-[20px] border-t-2 border-l-2 border-brand-gold max-md:w-[24px] max-md:h-[24px]" />
      <div className="fixed w-[40px] h-[40px] z-[100] top-[20px] right-[20px] border-t-2 border-r-2 border-brand-gold max-md:w-[24px] max-md:h-[24px]" />
      <div className="fixed w-[40px] h-[40px] z-[100] bottom-[20px] left-[20px] border-b-2 border-l-2 border-brand-gold max-md:w-[24px] max-md:h-[24px]" />
      <div className="fixed w-[40px] h-[40px] z-[100] bottom-[20px] right-[20px] border-b-2 border-r-2 border-brand-gold max-md:w-[24px] max-md:h-[24px]" />

      {/* Version tag */}
      <div className="fixed top-[24px] right-[72px] font-data text-[0.6875rem] text-text-muted tracking-[0.1em]">SIDECAR v1.0</div>

      {/* Main centered content */}
      <main className="w-full max-w-[680px] flex flex-col items-center gap-lg -mt-[12vh] px-sm md:px-0">
        {/* Brand */}
        <motion.div
          className="text-center mb-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display font-extrabold text-[clamp(2.5rem,5vw,4rem)] tracking-[0.12em] text-text-primary leading-none">
            SIDE<span className="text-brand-gold font-light">[</span><span className="text-brand-gold">CAR</span><span className="text-brand-gold font-light">]</span>
          </h1>
        </motion.div>

        {/* Intelligence Bar */}
        <motion.div
          className="w-full flex items-center bg-bg-elevated border border-surface-border rounded-lg shadow-md p-xs relative transition-all duration-base ease-out focus-within:border-brand-gold focus-within:shadow-glow"
          ref={searchRef}
          layoutId="global-search"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Advanced Search Button */}
          <button
            className="flex items-center gap-[6px] py-[10px] px-[14px] bg-bg-sunken border border-surface-border-subtle rounded-md font-body text-[0.8125rem] font-semibold text-text-primary cursor-pointer transition-all duration-fast ease-out whitespace-nowrap shrink-0 hover:bg-bg-primary hover:border-brand-gold hover:text-brand-gold"
            onClick={() => navigate('/advanced-search')}
            aria-label="Open Advanced Search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Advanced
          </button>

          {/* Search Input + Button */}
          <div className="flex-1 flex items-center gap-xs">
            <input
              className="flex-1 py-[12px] px-[16px] bg-transparent border-none outline-none font-body text-[0.9375rem] text-text-primary placeholder:text-text-muted placeholder:font-normal"
              type="text"
              placeholder="Search sailors, billets, commands..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              className="flex items-center justify-center w-[42px] h-[42px] bg-brand-navy border-none rounded-full text-text-inverse cursor-pointer shrink-0 transition-all duration-fast ease-out hover:bg-brand-navy-light hover:shadow-sm active:bg-brand-navy-deep"
              type="button"
              aria-label="Execute search"
              onClick={() => { if (results.length > 0) navigate(`/personnel/${results[0].id}`); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-elevated border border-surface-border rounded-md shadow-xl max-h-[360px] overflow-y-auto z-40"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {results.length > 0 && (
                  <div className="py-[10px] px-[16px] text-xs font-semibold text-text-muted uppercase tracking-[0.08em] border-b border-surface-border-subtle">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </div>
                )}
                {results.map(s => {
                  const prd = computePRDTier(s);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-sm py-[10px] px-[16px] cursor-pointer transition-colors duration-fast hover:bg-brand-gold-glow"
                      onMouseEnter={(e) => handleMouseEnter(s, e)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => { navigate(`/personnel/${s.id}`); }}
                    >
                      <span className={getPrdClass(prd.tier)}>{prd.tier}</span>
                      <span className="font-semibold text-[0.875rem] text-text-primary min-w-[140px]">
                        {s.lastName}, {s.firstName}
                      </span>
                      <span className="font-data text-xs text-text-secondary min-w-[50px]">
                        {s.rate} {s.payGrade}
                      </span>
                      <span className="text-xs text-text-muted overflow-hidden text-ellipsis whitespace-nowrap">{s.command}</span>
                    </div>
                  );
                })}
                
                <div 
                  className="flex items-center gap-[8px] py-[12px] px-[16px] font-semibold text-brand-gold cursor-pointer border-t border-surface-border-subtle bg-bg-sunken" 
                  onClick={() => navigate('/advanced-search')}
                >
                  <span style={{ fontSize: '1.2rem' }}>🔍</span> Advanced Search...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Smart Pill — Workspace Summary */}
        <motion.div
          className="flex items-center justify-between w-full py-md px-lg bg-bg-elevated border border-surface-border-subtle rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col gap-[2px]">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em]">
              Workspace Summary
            </span>
            <span className="text-base font-bold text-text-primary">
              {notificationCount} priority items
            </span>
          </div>
          <Link className="text-[0.8125rem] font-semibold text-brand-gold no-underline tracking-[0.02em] transition-colors duration-fast hover:text-brand-gold-bright" to="/workspace">
            Enter Workspace →
          </Link>
        </motion.div>

      </main>

      {/* Hover Card */}
      <AnimatePresence>
        {hoveredSailor && (
          <motion.div
            className="fixed w-[300px] bg-bg-elevated border border-surface-border rounded-md shadow-xl z-[200] overflow-hidden hidden md:block"
            style={{ top: hoverPos.y, left: Math.min(hoverPos.x, window.innerWidth - 320) }}
            initial={{ opacity: 0, x: -8, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            onMouseEnter={() => hoverTimeout.current && clearTimeout(hoverTimeout.current)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-sm py-[14px] px-[16px] border-b border-surface-border-subtle bg-bg-sunken">
              <span className={getPrdClass(computePRDTier(hoveredSailor).tier)}>
                {computePRDTier(hoveredSailor).tier}
              </span>
              <h3 className="text-[0.9375rem] font-bold text-text-primary">
                {hoveredSailor.lastName}, {hoveredSailor.firstName}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-[1px] py-sm px-md">
              <div className="py-[6px] px-0">
                <span className="block text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] mb-[2px]">Rate/Grade</span>
                <span className="text-[0.8125rem] font-medium text-text-primary leading-[1.3]">{hoveredSailor.rate} {hoveredSailor.payGrade}</span>
              </div>
              <div className="py-[6px] px-0">
                <span className="block text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] mb-[2px]">Command</span>
                <span className="text-[0.8125rem] font-medium text-text-primary leading-[1.3]">{hoveredSailor.command}</span>
              </div>
              <div className="py-[6px] px-0">
                <span className="block text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] mb-[2px]">PRD</span>
                <span className="text-[0.8125rem] font-medium text-text-primary leading-[1.3] font-data text-xs">{formatYYMM(hoveredSailor.prd)}</span>
              </div>
              <div className="py-[6px] px-0">
                <span className="block text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] mb-[2px]">EAOS</span>
                <span className="text-[0.8125rem] font-medium text-text-primary leading-[1.3] font-data text-xs">{hoveredSailor.eaos}</span>
              </div>
              <div className="py-[6px] px-0">
                <span className="block text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] mb-[2px]">Last Contact</span>
                <span className={`text-[0.8125rem] font-medium leading-[1.3] font-data text-xs ${getContactClass(daysSinceContact(hoveredSailor))}`}>
                  {hoveredSailor.lastContact} ({daysSinceContact(hoveredSailor)}d ago)
                </span>
              </div>
              <div className="py-[6px] px-0">
                <span className="block text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] mb-[2px]">Billet</span>
                <span className="text-[0.8125rem] font-medium text-text-primary leading-[1.3]">{hoveredSailor.billet}</span>
              </div>
            </div>
            <div className="py-[10px] px-[16px] text-center text-[0.6875rem] font-semibold text-brand-gold border-t border-surface-border-subtle bg-bg-sunken">
              Click to open record →
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
