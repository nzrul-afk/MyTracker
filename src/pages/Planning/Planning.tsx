import { useState } from 'react';
import { TodoList } from './components/TodoList';
import { ProjectTracker } from './components/ProjectTracker';
import { SubNav, type SubNavTab } from '../../components/layout/SubNav';
import { FiCheckSquare, FiLayers } from 'react-icons/fi';

type Tab = 'todo' | 'project';

export function Planning() {
  const [activeTab, setActiveTab] = useState<Tab>('todo');

  const tabs: SubNavTab<Tab>[] = [
    { id: 'todo', label: 'To-Do List', icon: FiCheckSquare },
    { id: 'project', label: 'Project Tracker', icon: FiLayers },
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

      {/* Sub Navigation */}
      <SubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
