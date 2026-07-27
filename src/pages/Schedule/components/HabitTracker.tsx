import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Habit } from '../../../lib/db';
import { FiPlus, FiTrash2, FiCheck, FiAward, FiActivity } from 'react-icons/fi';
import { cn, getLocalISODate } from '../../../lib/utils';

export function HabitTracker() {
  const habits = useLiveQuery(() => db.habits.toArray()) || [];
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pribadi');
  const [newColor, setNewColor] = useState('bg-indigo-500');

  // Today's date string
  const todayStr = getLocalISODate();

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await db.habits.add({
      title: newTitle,
      category: newCategory,
      color: newColor,
      records: [],
      synced: false,
      updatedAt: Date.now()
    });

    setNewTitle('');
  };

  const toggleToday = async (habit: Habit) => {
    const isDoneToday = habit.records.includes(todayStr);
    let newRecords = [...habit.records];
    
    if (isDoneToday) {
      newRecords = newRecords.filter(d => d !== todayStr);
    } else {
      newRecords.push(todayStr);
    }

    await db.habits.update(habit.id!, {
      records: newRecords,
      synced: false,
      updatedAt: Date.now()
    });
  };

  const deleteHabit = async (id: number) => {
    if (confirm('Hapus habit ini beserta semua riwayatnya?')) {
      await db.habits.delete(id);
    }
  };

  const colors = [
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-emerald-500', label: 'Emerald' },
    { value: 'bg-rose-500', label: 'Rose' },
    { value: 'bg-amber-500', label: 'Amber' },
    { value: 'bg-sky-500', label: 'Sky' },
  ];

  // Stats
  const completedToday = habits.filter(h => h.records.includes(todayStr)).length;
  const totalHabits = habits.length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* Daily Progress Banner */}
      {totalHabits > 0 && (
        <div className="glass-card p-5 flex items-center gap-5 border-l-4 border-l-indigo-500">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-100 dark:text-slate-800"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0}, 100`}
                strokeLinecap="round"
                className="text-indigo-500 transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900 dark:text-white">
              {completedToday}/{totalHabits}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {completedToday === totalHabits && totalHabits > 0 
                ? "🎉 Semua selesai!" 
                : completedToday === 0 
                  ? "Ayo mulai hari ini!" 
                  : "Terus lanjutkan!"}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {completedToday} dari {totalHabits} kebiasaan sudah dilakukan hari ini.
            </p>
          </div>
        </div>
      )}

      {/* Add New Habit Form */}
      <form onSubmit={handleAddHabit} className="glass-card p-5 border border-indigo-100 dark:border-indigo-500/20 shadow-md flex flex-col gap-4">
        <input 
          type="text" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Kebiasaan baru apa yang ingin Anda bangun?" 
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 px-0"
        />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option>Kesehatan</option>
              <option>Belajar</option>
              <option>Pribadi</option>
              <option>Karir</option>
            </select>

            <div className="flex items-center gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewColor(c.value)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all border-2",
                    c.value,
                    newColor === c.value ? "scale-125 border-white dark:border-slate-800 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={!newTitle.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:dark:bg-slate-800 text-white disabled:text-slate-400 rounded-xl font-bold transition-all w-full sm:w-auto justify-center"
          >
            <FiPlus size={18} /> Tambah Habit
          </button>
        </div>
      </form>

      {/* Habit List — Daily Checklist */}
      <div className="flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 opacity-70">
            <FiActivity size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Belum Ada Habit</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">Mulai bangun kebiasaan positif Anda dengan menambahkannya di atas.</p>
          </div>
        ) : (
          habits.map(habit => {
            const isDoneToday = habit.records.includes(todayStr);

            return (
              <div 
                key={habit.id} 
                onClick={() => toggleToday(habit)}
                className={cn(
                  "glass-card p-4 sm:p-5 flex items-center gap-4 group cursor-pointer transition-all hover:shadow-md relative",
                  isDoneToday && "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200/50 dark:border-emerald-500/20"
                )}
              >
                {/* Check Circle */}
                <button
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all border-2",
                    isDoneToday 
                      ? cn(habit.color, "border-transparent text-white shadow-md scale-110") 
                      : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-transparent hover:text-slate-300"
                  )}
                >
                  <FiCheck size={20} strokeWidth={3} />
                </button>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-bold text-lg transition-all",
                    isDoneToday 
                      ? "text-slate-400 dark:text-slate-500 line-through" 
                      : "text-slate-900 dark:text-white"
                  )}>
                    {habit.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <span className={cn("w-2 h-2 rounded-full", habit.color)}></span>
                      {habit.category}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <FiAward size={11} /> {habit.records.length} hari
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id!); }} 
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
