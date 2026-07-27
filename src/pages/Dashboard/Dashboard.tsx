import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiDollarSign, 
  FiCalendar, 
  FiFileText, 
  FiClock, 
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiChevronRight
} from 'react-icons/fi';
import { cn, getLocalISODate } from '../../lib/utils';

export function Dashboard() {
  // Quote logic
  const [quote, setQuote] = useState<{content: string, author: string} | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const cached = localStorage.getItem('daily_quote');
        const cachedDate = localStorage.getItem('daily_quote_date');
        const todayStr = new Date().toDateString();

        if (cached && cachedDate === todayStr) {
          setQuote(JSON.parse(cached));
        } else {
          const adviceRes = await fetch('https://api.adviceslip.com/advice', { cache: 'no-cache' });
          if (!adviceRes.ok) throw new Error('Advice API failed');
          const adviceData = await adviceRes.json();
          const englishAdvice: string = adviceData.slip.advice;

          let translatedContent = englishAdvice;
          try {
            const translateRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishAdvice)}&langpair=en|id`);
            if (translateRes.ok) {
              const translateData = await translateRes.json();
              if (translateData.responseData && translateData.responseData.translatedText) {
                translatedContent = translateData.responseData.translatedText;
              }
            }
          } catch {}

          const newQuote = { content: translatedContent, author: 'Advice Slip' };
          setQuote(newQuote);
          localStorage.setItem('daily_quote', JSON.stringify(newQuote));
          localStorage.setItem('daily_quote_date', todayStr);
        }
      } catch {
        setQuote({ content: "Lakukan yang terbaik hari ini.", author: "Anonymous" });
      } finally {
        setLoadingQuote(false);
      }
    };
    fetchQuote();
  }, []);

  // Time & Greeting
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayString = today.toLocaleDateString('id-ID', dateOptions);
  
  const localTodayISO = getLocalISODate(); // Standardized local ISO date

  // Data Fetching
  const todos = useLiveQuery(() => db.todos.where('status').notEqual('completed').toArray()) || [];
  const highPriorityTodos = todos.filter(t => t.priority === 'high').slice(0, 4);
  
  const allNotes = useLiveQuery(() => db.notes.toArray()) || [];
  const pinnedNotes = allNotes.filter(n => n.isPinned);
  
  const bills = useLiveQuery(() => db.bills.filter(b => !b.isPaid).toArray()) || [];
  // Use string comparison to avoid UTC timezone parsing bugs with new Date("YYYY-MM-DD")
  const overdueBills = bills.filter(b => b.dueDate < localTodayISO);

  const routines = useLiveQuery(() => db.routines.where('dayOfWeek').equals(today.getDay()).toArray()) || [];
  
  // Habits
  const habits = useLiveQuery(() => db.habits.toArray()) || [];
  const habitsCompleted = habits.filter(h => h.records.includes(localTodayISO)).length;

  // Fetch upcoming schedules (next 14 days)
  const allSchedules = useLiveQuery(() => db.schedules.toArray()) || [];
  const upcomingSchedules = allSchedules
    .filter(s => {
      const eventDate = new Date(s.date);
      eventDate.setHours(0, 0, 0, 0);
      const todayCopy = new Date(today);
      todayCopy.setHours(0, 0, 0, 0);
      const diffMs = eventDate.getTime() - todayCopy.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 14;
    })
    .map(s => {
      const eventDate = new Date(s.date);
      eventDate.setHours(0, 0, 0, 0);
      const todayCopy = new Date(today);
      todayCopy.setHours(0, 0, 0, 0);
      const diffDays = Math.round((eventDate.getTime() - todayCopy.getTime()) / (1000 * 60 * 60 * 24));
      let relativeLabel = '';
      if (diffDays === 0) relativeLabel = 'Hari ini';
      else if (diffDays === 1) relativeLabel = 'Besok';
      else relativeLabel = `${diffDays} hari lagi`;
      
      return {
        ...s,
        diffDays,
        relativeLabel,
        dateFormatted: eventDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 5);

  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const thisMonth = today.getMonth();
  const monthlyTransactions = transactions.filter(t => new Date(t.date).getMonth() === thisMonth);
  const totalOutcome = monthlyTransactions.filter(t => t.type === 'outcome').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. HEADER & GREETING */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {greeting}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Hari ini {todayString}
        </p>
      </div>

      {/* 2. QUICK STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/finance" className="glass-card p-4 hover:shadow-md transition-all group flex flex-col gap-2 border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Arus Kas</span>
            <FiDollarSign className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {totalIncome > totalOutcome ? "+" : ""}Rp {(totalIncome - totalOutcome).toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Sisa dana bulan ini</p>
          </div>
        </Link>
        
        <Link to="/planning" className="glass-card p-4 hover:shadow-md transition-all group flex flex-col gap-2 border-t-4 border-t-amber-500">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tugas Aktif</span>
            <FiCheckCircle className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{todos.length} Tugas</h3>
            <p className="text-xs text-slate-500 mt-1">{highPriorityTodos.length} prioritas tinggi</p>
          </div>
        </Link>
        
        <Link to="/schedule" className="glass-card p-4 hover:shadow-md transition-all group flex flex-col gap-2 border-t-4 border-t-indigo-500">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Mendatang</span>
            <FiCalendar className="text-indigo-500" />
          </div>
          <div>
            {upcomingSchedules.length > 0 ? (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{upcomingSchedules[0].title}</h3>
                <p className="text-xs text-indigo-500 font-bold mt-1">{upcomingSchedules[0].relativeLabel}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kosong</h3>
                <p className="text-xs text-slate-500 mt-1">Tidak ada event</p>
              </>
            )}
          </div>
        </Link>
        
        <Link to="/finance" className="glass-card p-4 hover:shadow-md transition-all group flex flex-col gap-2 border-t-4 border-t-rose-500">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tagihan</span>
            <FiAlertCircle className="text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bills.length} Tagihan</h3>
            <p className="text-xs text-slate-500 mt-1">
              {overdueBills.length > 0 ? <span className="text-rose-500 font-bold">{overdueBills.length} Overdue!</span> : "Menunggu pembayaran"}
            </p>
          </div>
        </Link>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Jadwal Hari Ini & Tugas */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
          
          {/* Jadwal Hari Ini */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiClock className="text-indigo-500" /> Jadwal Hari Ini
              </h2>
              <Link to="/schedule" className="text-sm font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                Selengkapnya <FiChevronRight />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              {routines.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  Tidak ada jadwal untuk hari ini. Waktunya bersantai!
                </div>
              ) : (
                routines.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((item, idx) => (
                  <div key={item.id} className="flex gap-4 items-start relative">
                    {idx !== routines.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-[-16px] w-[2px] bg-slate-200 dark:bg-slate-700"></div>
                    )}
                    
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-slate-900 shadow-sm">
                      <FiClock size={16} />
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.type} {item.location ? `· ${item.location}` : ''}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-white dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 shadow-sm whitespace-nowrap self-start sm:self-auto">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fokus Tugas (High Priority) */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiCheckCircle className="text-amber-500" /> Fokus Tugas
              </h2>
              <Link to="/planning" className="text-sm font-medium text-amber-500 hover:text-amber-600 flex items-center gap-1">
                Semua Tugas <FiChevronRight />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {highPriorityTodos.length === 0 ? (
                <div className="col-span-full text-center py-6 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  Tidak ada tugas prioritas tinggi. Bagus sekali!
                </div>
              ) : (
                highPriorityTodos.map(todo => (
                  <div key={todo.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow transition-shadow flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-100 dark:bg-amber-500/20"></div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1">{todo.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {todo.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: Habit, Keuangan & Catatan */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">

          {/* Habit Hari Ini */}
          {habits.length > 0 && (
            <div className="glass-card p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  ✨ Habit Hari Ini
                </h2>
                <Link to="/schedule" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                  Buka <FiChevronRight size={12} />
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 shrink-0">
                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-slate-100 dark:text-slate-800" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray={`${(habitsCompleted / habits.length) * 100}, 100`} strokeLinecap="round" className="text-emerald-500 transition-all duration-500" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-white">{habitsCompleted}/{habits.length}</span>
                </div>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {habits.slice(0, 6).map(h => (
                    <span key={h.id} className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border", h.records.includes(localTodayISO) ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 line-through opacity-70" : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700")}>
                      {h.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Status Keuangan */}
          <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiDollarSign className="text-emerald-500" /> Status Keuangan
              </h2>
              <Link to="/finance" className="text-sm font-medium text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                Detail <FiChevronRight />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><FiTrendingUp /> Pemasukan</span>
                  <span className="text-slate-900 dark:text-white">Rp {totalIncome.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: Math.max(totalIncome, totalOutcome) > 0 ? `${(totalIncome / Math.max(totalIncome, totalOutcome)) * 100}%` : '0%' }}></div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1"><FiTrendingDown /> Pengeluaran</span>
                  <span className="text-slate-900 dark:text-white">Rp {totalOutcome.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: Math.max(totalIncome, totalOutcome) > 0 ? `${(totalOutcome / Math.max(totalIncome, totalOutcome)) * 100}%` : '0%' }}></div>
                </div>
              </div>
            </div>

            {/* Overdue Warning */}
            {overdueBills.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 flex gap-3">
                <FiAlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">Tagihan Jatuh Tempo!</h4>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">Anda memiliki {overdueBills.length} tagihan yang belum dibayar dan sudah melewati batas waktu.</p>
                </div>
              </div>
            )}
          </div>

          {/* Catatan Disematkan */}
          <div className="glass-card p-6 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiFileText className="text-blue-500" /> Catatan Penting
              </h2>
              <Link to="/note" className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1">
                Buka Catatan <FiChevronRight />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {pinnedNotes.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  Belum ada catatan yang disematkan.
                </div>
              ) : (
                pinnedNotes.slice(0, 3).map(note => (
                  <div key={note.id} className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl shadow-sm group">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{note.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* 4. COMPACT QUOTE BANNER */}
      <div className="mt-2 relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 mix-blend-overlay"></div>
        <div className="absolute -top-10 -right-4 text-[100px] font-serif font-black text-white opacity-5 select-none leading-none">"</div>
        
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          {loadingQuote ? (
            <div className="animate-pulse space-y-2 w-full max-w-lg">
              <div className="h-4 bg-white/20 rounded w-full"></div>
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-lg md:text-xl font-medium leading-relaxed italic text-white/90 drop-shadow-sm">
                "{quote?.content}"
              </p>
              <p className="text-sm font-semibold tracking-wide text-indigo-300 uppercase mt-3">
                — {quote?.author}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
