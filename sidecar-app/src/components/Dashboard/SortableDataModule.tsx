import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

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

export interface SortableDataModuleProps {
  id: string;
  title: string;
  expandedModule: string | null;
  onExpand: (id: string | null) => void;
  children: React.ReactNode;
}

export default function SortableDataModule({ id, title, expandedModule, onExpand, children }: SortableDataModuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 99 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isExpanded = expandedModule === id;
  
  const baseClass = "bg-bg-elevated rounded-lg p-lg mb-lg border border-surface-border shadow-sm";
  const expandedClass = isExpanded 
    ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[900px] max-h-[90vh] overflow-y-auto z-[1000] shadow-[0_24px_64px_rgba(0,0,0,0.3)] bg-bg-elevated border border-surface-border" 
    : "relative";

  return (
    <div ref={setNodeRef} style={style} className={`${baseClass} ${expandedClass}`} data-module-id={id}>
      <div className="flex flex-row items-center justify-between mb-md gap-sm">
        {!isExpanded && (
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing text-text-muted opacity-40 hover:opacity-100 p-1 -ml-2 transition-opacity"
            title="Drag to move"
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="3" cy="2" r="1.5" />
              <circle cx="7" cy="2" r="1.5" />
              <circle cx="3" cy="7" r="1.5" />
              <circle cx="7" cy="7" r="1.5" />
              <circle cx="3" cy="12" r="1.5" />
              <circle cx="7" cy="12" r="1.5" />
            </svg>
          </div>
        )}
        
        <h2 className="flex-1 font-body text-[20px] font-extrabold m-0 tracking-[0.01em] text-primary-navy">
          {title}
        </h2>
        
        <button
          className="flex items-center justify-center w-[28px] h-[28px] border border-surface-border-subtle rounded-sm bg-bg-primary text-text-muted cursor-pointer transition-all duration-150 shrink-0 hover:bg-bg-sunken hover:text-text-primary hover:border-surface-border"
          onClick={() => onExpand(isExpanded ? null : id)}
          type="button"
          aria-label={isExpanded ? 'Close modal' : 'Expand module'}
        >
          {isExpanded ? <CloseIcon /> : <MaximizeIcon />}
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}
