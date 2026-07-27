import { useState } from 'react';
import { TodoList } from './components/TodoList';
import { ProjectTracker } from './components/ProjectTracker';
import { cn } from '../../lib/utils';

type Tab = 'todo' | 'project';

export function Planning() {
  const [activeTab, setActiveTab] = useState<Tab>('todo');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'todo', label: 'To-Do List' },
    { id: 'project', label: 'Project Tracker' },
  ];

  return (
    <div className="flex flex-col min-h-full relative pb-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Produktivitas</h1>
        <p className="text-slate-500 dark:text-slate-400">Atur tugas dan rencanakan proyek Anda.</p>
      </div>

      {/* Content Area */}
      <div className="flex flex-col mb-auto pb-6">
        {activeTab === 'todo' && <TodoList />}
        {activeTab === 'project' && <ProjectTracker />}
      </div>

      {/* Sub Navigation (Sticky Bottom Navbar) */}
      <div className="sticky bottom-0 z-20 mt-auto pt-4 pb-2 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 flex justify-center -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto flex gap-1.5 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] w-full max-w-lg overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 px-2 py-3 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 active:scale-95",
                activeTab === tab.id 
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
