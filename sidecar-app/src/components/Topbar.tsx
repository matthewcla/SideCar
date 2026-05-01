import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SideCarAdapter } from '../services/SideCarAdapter';
import type { ISailor } from '../models/ISailor';
import { computePRDTier } from '../services/PrdEngine';

interface TopbarProps {
  showDataMode?: boolean;
}

export default function Topbar({ showDataMode = false }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ISailor[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      // Do not hide results automatically on short queries so the Advanced Search button remains visible
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
        setShowResults(false);
        setQuery('');
      } else {
        const urlIdMatch = query.trim();
        if (urlIdMatch.length > 0) navigate(`/personnel/${urlIdMatch}`);
      }
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getPrdClass = (tier: string) => `prd-badge prd-badge--${tier.toLowerCase()}`;

  return (
    <header className="flex items-center justify-between h-16 px-xl bg-white border-b border-surface-border sticky top-0 z-50">
      <div className="flex items-center justify-start flex-1 min-w-[250px]">
        <Link to="/" className="font-display font-extrabold text-xl tracking-widest text-primary-navy no-underline transition-colors duration-fast shrink-0 hover:text-command-gold">
          SIDE<span className="text-command-gold font-light">[</span><span className="text-command-gold font-extrabold">CAR</span><span className="text-command-gold font-light">]</span>
        </Link>
      </div>

      <div className="flex-[2] w-full max-w-[600px] flex justify-center">
        <div className="w-full relative bg-bg-elevated border border-surface-border rounded-lg flex items-center py-[8px] px-[16px] transition-all duration-fast focus-within:border-brand-gold focus-within:shadow-glow" ref={searchRef}>
        <input
          className="w-full border-none bg-transparent outline-none font-body text-[0.9375rem] text-text-primary"
          type="text"
          placeholder="Global search (DOD ID, name, command)..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleSearchKeyDown}
        />
        <AnimatePresence>
          {showResults && (
            <motion.div
              className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-elevated border border-surface-border rounded-md shadow-xl max-h-[400px] overflow-y-auto z-[100]"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {results.length > 0 && (
                <div className="py-[8px] px-[16px] text-xs font-semibold text-text-muted uppercase border-b border-surface-border-subtle bg-bg-sunken">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </div>
              )}
              {results.slice(0, 10).map(s => {
                const prd = computePRDTier(s);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-[12px] py-[10px] px-[16px] cursor-pointer transition-colors duration-fast hover:bg-brand-gold-glow"
                    onClick={() => {
                      navigate(`/personnel/${s.id}`);
                      setShowResults(false);
                      setQuery('');
                    }}
                  >
                    <span className={getPrdClass(prd.tier)}>{prd.tier === 'EXPIRED' ? 'EXP' : prd.tier}</span>
                    <span className="text-[0.8125rem] font-semibold text-text-primary flex-1">{s.lastName}, {s.firstName}</span>
                    <span className="font-data text-xs text-text-muted">{s.rate}</span>
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
        </div>
      </div>

      <div className="flex items-center justify-end flex-1 min-w-[250px] gap-md">
        {showDataMode && (
          <div className="flex gap-sm items-center">
            <span className="font-data text-[0.625rem] font-semibold text-brand-gold bg-brand-gold-glow py-[2px] px-[8px] rounded-full tracking-widest">SYNTH</span>
            <span className="font-data text-xs text-text-secondary">PERS-401</span>
          </div>
        )}
        {location.pathname !== '/' && location.pathname !== '/landing' && (
          <button className="flex items-center gap-[6px] py-sm px-md bg-transparent border border-surface-border rounded-full font-data text-xs uppercase tracking-[0.05em] text-text-muted cursor-pointer transition-colors duration-fast shrink-0 no-underline hover:border-brand-gold hover:text-brand-navy" onClick={() => navigate(-1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
        )}
      </div>
    </header>
  );
}
