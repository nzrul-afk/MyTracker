import { useState } from 'react';
import { Spending } from './components/Spending';
import { Anggaran } from './components/Anggaran';
import { Tagihan } from './components/Tagihan';
import { Data } from './components/Data';
import { Wishlist } from './components/Wishlist';
import { SubNav, type SubNavTab } from '../../components/layout/SubNav';
import { FiBarChart2, FiPieChart, FiCreditCard, FiClock, FiHeart } from 'react-icons/fi';

type Tab = 'spending' | 'anggaran' | 'tagihan' | 'data' | 'wishlist';

export function Finance() {
  const [activeTab, setActiveTab] = useState<Tab>('spending');

  const tabs: SubNavTab<Tab>[] = [
    { id: 'spending', label: 'Statistik', icon: FiBarChart2 },
    { id: 'anggaran', label: 'Anggaran', icon: FiPieChart },
    { id: 'tagihan', label: 'Tagihan', icon: FiCreditCard },
    { id: 'data', label: 'Riwayat', icon: FiClock },
    { id: 'wishlist', label: 'Impian', icon: FiHeart },
  ];

  return (
    <div className="flex flex-col min-h-full relative pb-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Keuangan</h1>
        <p className="text-slate-500 dark:text-slate-400">Kelola keuangan, pemasukan, dan anggaran bulanan.</p>
      </div>

      {/* Content Area */}
      <div className="flex flex-col mb-auto pb-6">
        {activeTab === 'spending' && <Spending />}
        {activeTab === 'anggaran' && <Anggaran />}
        {activeTab === 'tagihan' && <Tagihan />}
        {activeTab === 'data' && <Data />}
        {activeTab === 'wishlist' && <Wishlist />}
      </div>

      {/* Sub Navigation */}
      <SubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
