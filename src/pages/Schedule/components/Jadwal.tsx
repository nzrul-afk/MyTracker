import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { FiPlus, FiTrash2, FiX, FiMapPin, FiCalendar, FiBell } from 'react-icons/fi';
import { cn } from '../../../lib/utils';

export function Jadwal() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Day Selector (0 = Sunday, 1 = Monday)
  const todayIndex = new Date().getDay();
  // Adjust to make Monday first (1 to 7, where 7 is Sunday)
  const [selectedDay, setSelectedDay] = useState(todayIndex === 0 ? 7 : todayIndex); 

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'kuliah' | 'kegiatan' | 'pribadi'>('kuliah');
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [reminderType, setReminderType] = useState<'none'|'popup'|'alarm'>('none');

  const routines = useLiveQuery(() => {
    if (!db.routines) return [];
    return db.routines.where('dayOfWeek').equals(selectedDay).toArray();
  }, [selectedDay]) || [];

  const handleOpenForm = () => {
    setTitle('');
    setType('kuliah');
    setDayOfWeek(selectedDay);
    setStartTime('08:00');
    setEndTime('09:40');
    setLocation('');
    setReminderType('none');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    
    // Validasi input waktu tidak terbalik
    if (startTime >= endTime) {
      alert('Waktu mulai harus lebih awal dari waktu selesai.');
      return;
    }

    // Cek konflik dengan jadwal yang sudah ada di hari yang sama
    const existingRoutines = await db.routines.where('dayOfWeek').equals(dayOfWeek).toArray();
    const hasConflict = existingRoutines.some(routine => {
      // Kondisi overlap:
      // Waktu mulai baru lebih awal dari waktu selesai yang sudah ada, DAN
      // Waktu selesai baru lebih lambat dari waktu mulai yang sudah ada.
      return startTime < routine.endTime && endTime > routine.startTime;
    });

    if (hasConflict) {
      alert('Jadwal ini bertabrakan dengan jadwal yang sudah ada di jam tersebut!');
      return;
    }
    
    await db.routines.add({
      title,
      type,
      dayOfWeek,
      startTime,
      endTime,
      location,
      reminderType,
      synced: false,
      updatedAt: Date.now()
    });

    setIsFormOpen(false);
    setSelectedDay(dayOfWeek);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus rutinitas ini?')) {
      await db.routines.delete(id);
    }
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'kuliah': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      case 'kegiatan': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'pribadi': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'kuliah': return 'Kuliah';
      case 'kegiatan': return 'Organisasi';
      case 'pribadi': return 'Pribadi';
      default: return t;
    }
  };

  const days = [
    { id: 1, name: 'Sen', full: 'Senin' },
    { id: 2, name: 'Sel', full: 'Selasa' },
    { id: 3, name: 'Rab', full: 'Rabu' },
    { id: 4, name: 'Kam', full: 'Kamis' },
    { id: 5, name: 'Jum', full: 'Jumat' },
    { id: 6, name: 'Sab', full: 'Sabtu' },
    { id: 7, name: 'Min', full: 'Minggu' }
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Day Selector */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {days.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDay(d.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[3.5rem] py-3 rounded-2xl transition-all font-bold",
              selectedDay === d.id 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105"
                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700/50"
            )}
          >
            <span className="text-sm">{d.name}</span>
          </button>
        ))}
      </div>

      {!isFormOpen ? (
        <button 
          onClick={handleOpenForm}
          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 py-3 px-4 rounded-xl font-medium transition-all"
        >
          <FiPlus size={20} />
          Tambah Jadwal di Hari {days.find(d => d.id === selectedDay)?.full}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 border-2 border-indigo-500/20 shadow-lg relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            type="button" 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <FiX size={20} />
          </button>
          
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <FiCalendar /> Jadwal Rutin
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mata Kuliah / Kegiatan</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Algoritma & Pemrograman"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jenis</label>
              <select 
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="kuliah">Kuliah / Kelas</option>
                <option value="kegiatan">Kegiatan / Organisasi</option>
                <option value="pribadi">Pribadi</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hari</label>
              <select 
                value={dayOfWeek}
                onChange={(e: any) => setDayOfWeek(Number(e.target.value))}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {days.map(d => (
                  <option key={d.id} value={d.id}>{d.full}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mulai - Selesai</label>
              <div className="flex items-center gap-2">
                <input 
                  type="time" 
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="time" 
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ruangan (Opsional)</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Gedung A Lt.2"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pengingat Jadwal</label>
              <select 
                value={reminderType}
                onChange={(e: any) => setReminderType(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="none">Tanpa Pengingat</option>
                <option value="popup">Notifikasi Layar (Pop-up)</option>
                <option value="alarm">Notifikasi & Alarm Suara</option>
              </select>
            </div>
            
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium text-white transition-colors bg-indigo-500 hover:bg-indigo-600 w-full sm:w-auto"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      )}

      {/* Timetable List */}
      <div className="flex flex-col gap-4 mt-2">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          Jadwal Hari {days.find(d => d.id === selectedDay)?.full}
        </h4>
        
        {routines.length === 0 ? (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-slate-400 text-sm text-center">
              <FiCalendar size={32} className="mb-2 opacity-50" />
              <p>Belum ada jadwal tetap untuk hari ini.</p>
            </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 dark:border-slate-700 ml-2 sm:ml-4 flex flex-col gap-6 pl-4 sm:pl-6 pb-4">
            {routines.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(item => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[23px] sm:-left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900"></div>
                
                <div className={cn("glass-card p-4 flex flex-col sm:flex-row gap-4 border-l-4 transition-all hover:shadow-md", getTypeColor(item.type))}>
                  
                  {/* Time Block */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2 shrink-0 sm:w-20">
                    <span className="font-black text-lg text-slate-800 dark:text-white leading-none">{item.startTime}</span>
                    <span className="text-xs font-bold text-slate-400">{item.endTime}</span>
                  </div>
                  
                  {/* Content Block */}
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center gap-2 w-fit">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-white/50 dark:bg-slate-900/50">
                        {getTypeLabel(item.type)}
                      </span>
                      {item.reminderType === 'alarm' && <FiBell size={12} className="text-rose-500" />}
                      {item.reminderType === 'popup' && <FiBell size={12} className="text-indigo-500" />}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-lg mt-0.5">
                      {item.title}
                    </h3>
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                        <FiMapPin size={12} />
                        {item.location}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(item.id!)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
