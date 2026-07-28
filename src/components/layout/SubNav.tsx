import { cn } from '../../lib/utils';
import { type IconType } from 'react-icons';

export interface SubNavTab<T extends string> {
  id: T;
  label: string;
  icon: IconType;
}

interface SubNavProps<T extends string> {
  tabs: SubNavTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function SubNav<T extends string>({ tabs, activeTab, onTabChange }: SubNavProps<T>) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto pt-3 pb-2 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 flex justify-center -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 pointer-events-none">
      <div className="pointer-events-auto flex gap-1 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200/70 dark:border-slate-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] w-full max-w-lg overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 active:scale-95 min-w-0",
                isActive
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <Icon size={18} className={cn("shrink-0 transition-transform duration-300", isActive && "scale-110")} />
              <span className={cn(
                "text-[10px] sm:text-xs font-bold truncate w-full text-center leading-tight transition-colors duration-300",
                isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
