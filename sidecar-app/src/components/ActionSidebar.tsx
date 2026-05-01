import { useState } from 'react';
import { 
  Phone, 
  CalendarPlus, 
  Mail, 
  FileText, 
  ClipboardList, 
  MessageSquarePlus,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function ActionSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const groups = [
    {
      title: 'Communicate',
      actions: [
        { id: 'call', icon: Phone, label: 'Call Now' },
        { id: 'schedule', icon: CalendarPlus, label: 'Schedule Call' },
        { id: 'email', icon: Mail, label: 'Email' },
      ]
    },
    {
      title: 'Generate',
      actions: [
        { id: 'export-psr', icon: FileText, label: 'Export PSR' },
        { id: 'export-orders', icon: ClipboardList, label: 'Export Orders Status' },
      ]
    },
    {
      title: 'Log',
      actions: [
        { id: 'add-note', icon: MessageSquarePlus, label: 'Add Note to Record' },
      ]
    }
  ];

  return (
    <div 
      className={`flex sticky mt-6 ml-2 h-[max-content] flex-col bg-white border border-surface-border shadow-lg shadow-black/5 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-30 rounded-2xl ${
        isExpanded ? 'w-[260px]' : 'w-[68px] items-center'
      }`}
      style={{ top: 'calc(var(--header-height, 136px) + 24px)' }}
    >
      
      {/* Floating Pop-out Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center w-8 h-8 rounded-full bg-white border border-surface-border shadow-sm hover:border-brand-gold hover:shadow-md transition-all absolute -right-4 top-1/2 -translate-y-1/2 z-40 text-text-muted hover:text-brand-navy`}
        title={isExpanded ? "Collapse Dock" : "Expand Dock"}
      >
        {isExpanded ? <ChevronLeft size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
      </button>

      <div className={`flex flex-col w-full py-4 ${isExpanded ? 'px-3' : 'px-2'}`}>
        {groups.map((group, groupIdx) => (
          <div key={group.title} className="flex flex-col w-full relative">
            
            {/* Header / Divider */}
            {isExpanded ? (
              <span className="text-[0.625rem] font-semibold text-text-muted uppercase tracking-[0.08em] ml-2 mt-4 mb-2">
                {group.title}
              </span>
            ) : (
              groupIdx !== 0 && <div className="w-8 h-[1px] bg-surface-border-subtle mx-auto my-3" />
            )}

            {/* Actions */}
            <div className={`flex flex-col ${isExpanded ? 'gap-1' : 'gap-2'}`}>
              {group.actions.map((action) => (
                <button
                  key={action.id}
                  className={`group relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 border border-transparent hover:bg-surface-parchment hover:border-surface-border hover:shadow-sm ${
                    isExpanded ? 'w-full justify-start' : 'w-11 h-11 justify-center mx-auto'
                  }`}
                >
                  <action.icon size={22} className="text-text-secondary group-hover:text-brand-navy shrink-0 transition-colors" strokeWidth={2} />
                  
                  {isExpanded ? (
                    <span className="text-[0.8125rem] font-medium text-text-primary tracking-wide whitespace-nowrap overflow-hidden">
                      {action.label}
                    </span>
                  ) : (
                    /* Custom Instant Tooltip */
                    <div className="absolute left-[calc(100%+16px)] opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50">
                      <div className="bg-bg-glass-dark text-white text-[0.75rem] font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        {action.label}
                        {/* Triangle pointer */}
                        <div className="absolute top-1/2 -left-[3px] -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-bg-glass-dark" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
