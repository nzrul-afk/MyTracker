import { useState } from 'react';
import { Jadwal } from './components/Jadwal';
import { Kalender } from './components/Kalender';
import { HabitTracker } from './components/HabitTracker';
import { SubNav, type SubNavTab } from '../../components/layout/SubNav';
import { FiClock, FiTarget, FiCalendar } from 'react-icons/fi';

type Tab = 'jadwal' | 'habit' | 'kalender';

export function Schedule() {
  const [activeTab, setActiveTab] = useState<Tab>('jadwal');

  const tabs: SubNavTab<Tab>[] = [
    { id: 'jadwal', label: 'Jadwal Harian', icon: FiClock },
    { id: 'habit', label: 'Habits', icon: FiTarget },
    { id: 'kalender', label: 'Kalender Agenda', icon: FiCalendar },
  ];

  return (
    <div className="flex flex-col min-h-full relative pb-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Jadwal</h1>
        <p className="text-slate-500 dark:text-slate-400">Atur jadwal kuliah, kegiatan, dan pantau kebiasaan Anda.</p>
      </div>

      {/* Content Area */}
      <div className="flex flex-col mb-auto pb-6">
        {activeTab === 'jadwal' && <Jadwal />}
        {activeTab === 'habit' && <HabitTracker />}
        {activeTab === 'kalender' && <Kalender />}
      </div>

      {/* Sub Navigation */}
      <SubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
