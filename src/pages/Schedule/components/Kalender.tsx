import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { FiChevronLeft, FiChevronRight, FiPlus, FiX, FiTrash2, FiBell } from 'react-icons/fi';
import { cn } from '../../../lib/utils';

export function Kalender() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'kuliah' | 'kegiatan' | 'pribadi'>('kegiatan');
  const [time, setTime] = useState('');
  const [reminderType, setReminderType] = useState<'none'|'popup'|'alarm'>('none');

  const schedules = useLiveQuery(() => {
    if (!db.schedules) return [];
    return db.schedules.toArray();
  }) || [];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-16"></div>);
    }
    
    // Cells for current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const daySchedules = schedules.filter(s => s.date.startsWith(dateStr));
      
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year;
      
      days.push(
        <button
          key={i}
          onClick={() => {
            setSelectedDate(new Date(year, month, i));
            setIsFormOpen(false); // close form if open
          }}
          className={cn(
            "h-12 sm:h-16 flex flex-col items-center justify-start pt-2 rounded-xl border transition-all relative group",
            isSelected 
              ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/30" 
              : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-indigo-300",
            isToday && !isSelected && "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-500/10"
          )}
        >
          <span className="text-sm font-semibold">{i}</span>
          
          {/* Event Dots */}
          {daySchedules.length > 0 && (
            <div className="flex gap-0.5 mt-1 px-1">
              {daySchedules.slice(0, 3).map((ds, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white" : (ds.type === 'kuliah' ? 'bg-blue-500' : ds.type === 'kegiatan' ? 'bg-amber-500' : 'bg-purple-500')
                  )}
                />
              ))}
              {daySchedules.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
            </div>
          )}
        </button>
      );
    }
    
    return days;
  };

  const handleOpenForm = () => {
    setTitle('');
    setType('kegiatan');
    setTime('09:00');
    setReminderType('none');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) return;
    
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dateTime = `${dateStr}T${time}:00`;

    await db.schedules.add({
      title,
      type,
      date: dateTime,
      isRecurring: false,
      reminderEnabled: reminderType !== 'none', // legacy field
      reminderType,
      synced: false,
      updatedAt: Date.now()
    });

    setIsFormOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus agenda ini?')) {
      await db.schedules.delete(id);
    }
  };

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedSchedules = schedules.filter(s => s.date.startsWith(selectedDateStr));

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Calendar Card */}
      <div className="glass-card p-4 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <FiChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {generateCalendarDays()}
        </div>
      </div>

      {/* Selected Date Agenda Section */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            Agenda: {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          
          {!isFormOpen && (
            <button 
              onClick={handleOpenForm}
              className="text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
            >
              <FiPlus size={14} /> Tambah
            </button>
          )}
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="glass-card p-5 border border-indigo-200 dark:border-indigo-500/30 shadow-md relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <FiX size={18} />
            </button>
            <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 mb-3">Agenda Baru</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nama Acara/Event"
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <select 
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="kegiatan">Kegiatan / Organisasi</option>
                  <option value="kuliah">Kuliah / Ujian</option>
                  <option value="pribadi">Pribadi</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <input 
                  type="time" 
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1 mt-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Pengingat</label>
                <select 
                  value={reminderType}
                  onChange={(e: any) => setReminderType(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                >
                  <option value="none">Tanpa Pengingat</option>
                  <option value="popup">Notifikasi Layar (Pop-up)</option>
                  <option value="alarm">Notifikasi & Alarm Suara</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg font-bold text-sm text-white transition-colors bg-indigo-500 hover:bg-indigo-600"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {!isFormOpen && selectedSchedules.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-sm italic glass-card border border-dashed border-slate-200 dark:border-slate-700">
            Tidak ada agenda khusus hari ini.
          </div>
        ) : (
          !isFormOpen && (
            <div className="flex flex-col gap-3">
              {selectedSchedules.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(item => {
                const d = new Date(item.date);
                return (
                  <div key={item.id} className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-indigo-500 group">
                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300 shrink-0 w-16 text-center">
                      {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.type}
                        </span>
                        {item.reminderType === 'alarm' && <FiBell size={12} className="text-rose-500" />}
                        {item.reminderType === 'popup' && <FiBell size={12} className="text-indigo-500" />}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight mt-1">{item.title}</h4>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id!)}
                      className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

    </div>
  );
}
