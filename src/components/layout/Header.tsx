import { useState, useRef, useEffect } from 'react';
import { FiBell, FiSettings, FiAlertCircle, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { cn, getLocalISODate } from '../../lib/utils';

export function Header() {
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Data for Notifications
  const bills = useLiveQuery(() => db.bills.toArray()) || [];
  const schedules = useLiveQuery(() => db.schedules.toArray()) || [];
  const todos = useLiveQuery(() => db.todos.toArray()) || [];

  const notifications: any[] = [];
  const today = new Date();
  const localTodayISO = getLocalISODate(); // Correct local ISO date

  // 1. Overdue Bills
  const overdueBills = bills.filter(b => b.dueDate < localTodayISO && !b.isPaid);
  overdueBills.forEach(b => {
    notifications.push({
      id: `bill-${b.id}`,
      title: 'Tagihan Jatuh Tempo!',
      message: `${b.title} (Rp ${b.amount.toLocaleString('id-ID')}) belum dibayar.`,
      icon: <FiAlertCircle className="text-rose-500 mt-0.5" size={16} />,
      color: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
    });
  });

  // 2. Upcoming Schedules (Today & Tomorrow)
  const upcomingSchedules = schedules.filter(s => {
    const eventDate = new Date(s.date);
    eventDate.setHours(0, 0, 0, 0);
    const todayCopy = new Date(today);
    todayCopy.setHours(0, 0, 0, 0);
    const diffDays = Math.round((eventDate.getTime() - todayCopy.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays === 0 || diffDays === 1;
  });
  upcomingSchedules.forEach(s => {
    const eventDate = new Date(s.date);
    eventDate.setHours(0, 0, 0, 0);
    const todayCopy = new Date(today);
    todayCopy.setHours(0, 0, 0, 0);
    const diffDays = Math.round((eventDate.getTime() - todayCopy.getTime()) / (1000 * 60 * 60 * 24));
    const label = diffDays === 0 ? 'Hari ini' : 'Besok';
    notifications.push({
      id: `schedule-${s.id}`,
      title: `Agenda ${label}`,
      message: `${s.title} dijadwalkan ${label.toLowerCase()}.`,
      icon: <FiCalendar className="text-indigo-500 mt-0.5" size={16} />,
      color: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30'
    });
  });

  // 3. High Priority Todos
  const highPriorityTodos = todos.filter(t => t.priority === 'high' && t.status !== 'completed');
  if (highPriorityTodos.length > 0) {
    notifications.push({
      id: 'high-priority-todos',
      title: 'Fokus Tugas',
      message: `Ada ${highPriorityTodos.length} tugas prioritas tinggi yang belum selesai.`,
      icon: <FiCheckCircle className="text-amber-500 mt-0.5" size={16} />,
      color: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
    });
  }

  const hasNotif = notifications.length > 0;

  const NotificationPopup = () => (
    <div className="absolute top-full mt-3 right-0 w-[320px] max-h-[400px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 p-4 z-50">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
        <h3 className="font-bold text-slate-900 dark:text-white">Notifikasi</h3>
        {hasNotif && (
          <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
            {notifications.length} Baru
          </span>
        )}
      </div>
      
      {hasNotif ? (
        <div className="flex flex-col gap-3">
          {notifications.map(n => (
            <div key={n.id} className={cn("flex gap-3 p-3 rounded-xl border", n.color)}>
              <div className="shrink-0">{n.icon}</div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1">{n.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
          <FiBell className="w-10 h-10 mb-3 opacity-20 text-indigo-500" />
          <p className="text-sm font-semibold">Belum ada notifikasi</p>
          <p className="text-xs mt-1 text-center opacity-80">Jadwal dan pengingat yang akan datang akan muncul di sini.</p>
        </div>
      )}
    </div>
  );

  return (
    <div ref={notifRef}>
      {/* Mobile Header */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">MyTracker</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors relative"
            >
              <FiBell size={20} />
              {hasNotif && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
            </button>
            {showNotif && <div className="lg:hidden"><NotificationPopup /></div>}
          </div>
          
          <Link to="/setting" className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors">
            <FiSettings size={20} />
          </Link>
        </div>
      </header>

      {/* Desktop Floating Actions */}
      <div className="hidden lg:flex absolute top-6 right-8 z-30 items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 relative"
          >
            <FiBell size={20} />
            {hasNotif && <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm animate-pulse"></span>}
          </button>
          {showNotif && <div className="hidden lg:block"><NotificationPopup /></div>}
        </div>
        
        <Link to="/setting" className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95">
          <FiSettings size={20} />
        </Link>
      </div>
    </div>
  );
}

