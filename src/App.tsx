import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Finance } from './pages/Finance/Finance';
import { Setting } from './pages/Setting/Setting';
import { Planning } from './pages/Planning/Planning';
import { Note } from './pages/Note/Note';
import { Schedule } from './pages/Schedule/Schedule';
import { useSync } from './hooks/useSync';
import { useNotificationSystem } from './hooks/useNotificationSystem';
import { FiX, FiInfo } from 'react-icons/fi';
import { db } from './lib/db';
import { PomodoroProvider, usePomodoro } from './context/PomodoroContext';
import { PomodoroTimer } from './pages/Planning/components/PomodoroTimer';

// Global Sync Wrapper
function GlobalSync() {
  useSync();
  useNotificationSystem();
  return null;
}

function PomodoroGlobal() {
  const { activeTask } = usePomodoro();
  if (!activeTask) return null;
  return <PomodoroTimer />;
}

function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem('mytracker_is_demo') === 'true');
  }, []);

  const handleExitDemo = async () => {
    if (!confirm('Keluar dari Mode Demo dan kembalikan data asli Anda?')) return;
    
    try {
      const backupStr = localStorage.getItem('mytracker_demo_backup');
      if (backupStr) {
        const data = JSON.parse(backupStr);
        for (const tableName of Object.keys(data)) {
          const table = db.table(tableName);
          await table.clear();
          await table.bulkPut(data[tableName]);
        }
      } else {
        // If no backup found (unlikely), just clear
        for (const table of db.tables) {
          await table.clear();
        }
      }
      
      localStorage.removeItem('mytracker_demo_backup');
      localStorage.removeItem('mytracker_is_demo');
      alert('Berhasil keluar dari mode demo. Data asli Anda telah dikembalikan!');
      window.location.href = '/';
    } catch (e) {
      console.error(e);
      alert('Gagal mengembalikan data asli.');
    }
  };

  if (!isDemo) return null;

  return (
    <div className="fixed top-2 lg:top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 lg:gap-3 bg-amber-500 text-white px-4 py-2 lg:py-2.5 rounded-full shadow-xl shadow-amber-500/30 animate-in slide-in-from-top-10">
      <FiInfo size={18} className="shrink-0" />
      <span className="text-xs lg:text-sm font-bold tracking-wide whitespace-nowrap">MODE DEMO AKTIF</span>
      <button 
        onClick={handleExitDemo}
        className="ml-1 lg:ml-2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors shrink-0"
        title="Keluar dari Mode Demo"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GlobalSync />
      <DemoBanner />
      <PomodoroProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/note" element={<Note />} />
            <Route path="/setting" element={<Setting />} />
          </Routes>
        </Layout>
        <PomodoroGlobal />
      </PomodoroProvider>
    </BrowserRouter>
  );
}

export default App;
