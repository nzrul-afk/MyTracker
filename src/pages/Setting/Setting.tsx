import { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, type User } from 'firebase/auth';
import { FiLogOut, FiMoon, FiSun, FiDatabase, FiDownload, FiUpload, FiBell, FiPlayCircle, FiInfo, FiMail, FiMessageCircle, FiUser, FiSmartphone } from 'react-icons/fi';
import { db } from '../../lib/db';
import { cn } from '../../lib/utils';

export function Setting() {
  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Preference States
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [alarmPattern, setAlarmPattern] = useState(localStorage.getItem('alarmPattern') || 'beep');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    if (localStorage.getItem('theme') === 'dark' || 
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    return () => unsubscribe();
  }, []);

  // --- AUTHENTICATION ---
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Security Hardening: Wipe local database to prevent sensitive data exposure on shared devices
      for (const table of db.tables) {
        await table.clear();
      }
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // --- PREFERENCES ---
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAlarmChange = (pattern: string) => {
    setAlarmPattern(pattern);
    localStorage.setItem('alarmPattern', pattern);
  };

  const testAlarm = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = alarmPattern === 'siren' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(1, startTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      };

      const now = ctx.currentTime;
      if (alarmPattern === 'beep') {
        playTone(880, now, 0.3);
        playTone(880, now + 0.4, 0.3);
        playTone(880, now + 0.8, 0.3);
      } else if (alarmPattern === 'pulse') {
        for(let i=0; i<6; i++) {
          playTone(1000, now + i*0.15, 0.1);
        }
      } else if (alarmPattern === 'siren') {
        playTone(600, now, 0.4);
        playTone(800, now + 0.4, 0.4);
        playTone(600, now + 0.8, 0.4);
        playTone(800, now + 1.2, 0.4);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // --- BACKUP & RESTORE & DUMMY ---
  const handleExport = async () => {
    try {
      const data: any = {};
      for (const table of db.tables) {
        data[table.name] = await table.toArray();
      }
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MyTracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('Data berhasil dicadangkan!');
    } catch (err) {
      alert('Gagal mencadangkan data.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!confirm('Peringatan: Ini akan menimpa (overwrite) data lokal Anda dengan data dari file backup. Lanjutkan?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        for (const tableName of Object.keys(data)) {
          const table = db.table(tableName);
          await table.clear(); 
          await table.bulkPut(data[tableName]);
        }
        alert('Data berhasil dipulihkan! Aplikasi akan dimuat ulang.');
        window.location.reload();
      } catch (err) {
        alert('File backup tidak valid atau rusak.');
      }
    };
    reader.readAsText(file);
  };

  const handleInjectDummyData = async () => {
    if (!confirm('Masuk ke Mode Demo (Mahasiswa IT)?\n\nData asli Anda akan disembunyikan sementara dan dikembalikan seperti semula setelah Anda keluar dari mode demo.')) return;
    
    try {
      // 1. Backup user data to localStorage
      const userBackup: any = {};
      for (const table of db.tables) {
        userBackup[table.name] = await table.toArray();
      }
      localStorage.setItem('mytracker_demo_backup', JSON.stringify(userBackup));
      localStorage.setItem('mytracker_is_demo', 'true');

      // 2. Clear all tables for fresh demo state
      for (const table of db.tables) {
        await table.clear();
      }

      // 3. Inject dummy data
      const now = Date.now();
      const today = new Date();
      const todayISO = today.toISOString();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const getRelDate = (days: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return d.toISOString();
      };

      await db.transaction('rw', db.tables, async () => {
        // --- TODOS ---
        await db.todos.bulkAdd([
          { title: "Slicing UI Dashboard React", category: "Kuliah", status: "pending", priority: "high", dueDate: todayISO, synced: false, updatedAt: now },
          { title: "Fix bug autentikasi Firebase", category: "Freelance", status: "in-progress", priority: "high", dueDate: todayISO, synced: false, updatedAt: now },
          { title: "Belajar TypeScript Generics", category: "Belajar", status: "completed", priority: "medium", dueDate: todayISO, synced: false, updatedAt: now },
          { title: "Mengerjakan Laporan Praktikum Jarkom", category: "Kuliah", status: "completed", priority: "low", dueDate: todayISO, synced: false, updatedAt: now },
          { title: "Setup Virtual Machine Ubuntu", category: "Kuliah", status: "in-progress", priority: "high", dueDate: todayISO, synced: false, updatedAt: now },
          { title: "Beli kuota internet / token listrik", category: "Pribadi", status: "pending", priority: "high", dueDate: todayISO, synced: false, updatedAt: now },
          { title: "Olahraga lari pagi", category: "Pribadi", status: "pending", priority: "medium", dueDate: todayISO, synced: false, updatedAt: now },
          { title: "Baca dokumentasi Tailwind v4", category: "Belajar", status: "completed", priority: "low", dueDate: todayISO, synced: false, updatedAt: now },
        ]);
        
        // --- NOTES ---
        await db.notes.bulkAdd([
          { title: "Cheat Sheet Git & Docker", content: "- `git rebase -i HEAD~3`\n- `docker compose up -d`\n- `git stash pop`\n- `git cherry-pick <commit-hash>`", isPinned: true, category: "Materi", synced: false, updatedAt: now },
          { title: "Ide Judul Skripsi Web3", content: "1. Sistem supply chain dengan blockchain\n2. Smart contract untuk lelang NFT\n3. DApp Voting System E-Pemilu", isPinned: false, category: "Kuliah", synced: false, updatedAt: now },
          { title: "Kumpulan Link API Publik", content: "Buat project iseng-iseng:\n- PokeAPI\n- JSONPlaceholder\n- TheMovieDB\n- DummyJSON", isPinned: true, category: "Materi", synced: false, updatedAt: now },
        ]);
        
        // --- PROJECTS ---
        await db.projects.bulkAdd([
          { title: "Sistem Kasir Cafe (Client)", description: "Proyek freelance cafe di Bandung", deadline: getRelDate(7).split('T')[0], status: "active", synced: false, updatedAt: now, subtasks: [{ id: "1", title: "Setup Repo & Vercel", isCompleted: true }, { id: "2", title: "Integrasi Payment Gateway", isCompleted: false }, { id: "3", title: "Testing & UAT", isCompleted: false }] },
          { title: "Website Portofolio V2", description: "Bikin portofolio baru pake Next.js 14 + Framer Motion", deadline: getRelDate(14).split('T')[0], status: "active", synced: false, updatedAt: now, subtasks: [{ id: "1", title: "Design Figma", isCompleted: true }, { id: "2", title: "Slicing Komponen", isCompleted: true }, { id: "3", title: "Implementasi Animasi", isCompleted: false }] },
          { title: "Tugas Akhir PBO", description: "Sistem manajemen perpustakaan console based", deadline: getRelDate(-5).split('T')[0], status: "completed", synced: false, updatedAt: now, subtasks: [{ id: "1", title: "Bikin Class Diagram", isCompleted: true }, { id: "2", title: "Koding Java", isCompleted: true }] }
        ]);

        // --- TRANSACTIONS ---
        await db.transactions.bulkAdd([
          { type: 'income', amount: 1500000, category: 'Freelance', date: todayISO, note: 'DP Project Kasir', synced: false, updatedAt: now },
          { type: 'outcome', amount: 300000, category: 'Hosting/Cloud', date: getRelDate(-2), note: 'Sewa VPS DigitalOcean', synced: false, updatedAt: now },
          { type: 'outcome', amount: 150000, category: 'Langganan', date: getRelDate(-3), note: 'Langganan ChatGPT Plus (Patungan)', synced: false, updatedAt: now },
          { type: 'outcome', amount: 35000, category: 'Makan', date: todayISO, note: 'Ayam Geprek + Es Teh', synced: false, updatedAt: now },
          { type: 'outcome', amount: 25000, category: 'Nongkrong / Kopi', date: getRelDate(-1), note: 'Kopi Janji Jiwa', synced: false, updatedAt: now },
          { type: 'income', amount: 500000, category: 'Uang Saku', date: getRelDate(-5), note: 'Kiriman Ortu', synced: false, updatedAt: now },
        ]);

        // --- BUDGETS ---
        await db.budgets.bulkAdd([
          { category: "Makan", limit: 1200000, month: currentMonth, synced: false, updatedAt: now },
          { category: "Nongkrong / Kopi", limit: 400000, month: currentMonth, synced: false, updatedAt: now },
          { category: "Transportasi", limit: 300000, month: currentMonth, synced: false, updatedAt: now },
          { category: "Hosting/Cloud", limit: 350000, month: currentMonth, synced: false, updatedAt: now },
        ]);

        // --- BILLS & DEBTS ---
        await db.bills.bulkAdd([
          { title: "Uang Kos Bulan Ini", type: "tagihan", amount: 800000, dueDate: getRelDate(5), isPaid: false, synced: false, updatedAt: now },
          { title: "Internet Wifi Kos", type: "tagihan", amount: 150000, dueDate: getRelDate(-1), isPaid: true, synced: false, updatedAt: now },
          { title: "Utang makan siang ke Budi", type: "utang", amount: 35000, dueDate: getRelDate(2), isPaid: false, synced: false, updatedAt: now },
          { title: "Uang patungan Netflix dari Andi", type: "piutang", amount: 45000, dueDate: getRelDate(3), isPaid: false, synced: false, updatedAt: now },
        ]);

        // --- WISHLISTS ---
        await db.wishlists.bulkAdd([
          { title: "Mechanical Keyboard Keychron K2", price: 1250000, priority: "high", isAchieved: false, synced: false, updatedAt: now },
          { title: "Monitor LG 27 Inch IPS", price: 2300000, priority: "medium", isAchieved: false, synced: false, updatedAt: now },
          { title: "SSD NVMe 1TB Samsung", price: 1100000, priority: "high", isAchieved: false, synced: false, updatedAt: now },
          { title: "Kursi Ergonomis", price: 800000, priority: "low", isAchieved: false, synced: false, updatedAt: now },
          { title: "Lisensi Github Copilot Setahun", price: 1500000, priority: "medium", isAchieved: true, synced: false, updatedAt: now },
        ]);
        
        // --- ROUTINES (Daily Schedule) ---
        await db.routines.bulkAdd([
          { title: "Olahraga Pagi", type: "pribadi", dayOfWeek: 0, startTime: "07:00", endTime: "09:00", location: "Taman", reminderType: "popup", synced: false, updatedAt: now },
          { title: "Istirahat & Nonton Series", type: "pribadi", dayOfWeek: 0, startTime: "10:00", endTime: "14:00", reminderType: "none", synced: false, updatedAt: now },
          
          { title: "Kuliah Struktur Data", type: "kuliah", dayOfWeek: 1, startTime: "08:00", endTime: "10:30", location: "Gedung A, Ruang 102", reminderType: "alarm", synced: false, updatedAt: now },
          { title: "Praktikum Jaringan Komputer", type: "kuliah", dayOfWeek: 1, startTime: "13:00", endTime: "15:00", location: "Lab Komputer 1", reminderType: "popup", synced: false, updatedAt: now },
          { title: "Coding Freelance", type: "pribadi", dayOfWeek: 1, startTime: "20:00", endTime: "23:00", reminderType: "none", synced: false, updatedAt: now },
          
          { title: "Kuliah Sistem Operasi", type: "kuliah", dayOfWeek: 2, startTime: "09:00", endTime: "12:00", location: "Gedung B, Ruang 204", reminderType: "popup", synced: false, updatedAt: now },
          { title: "Meeting Kelompok PBO", type: "kegiatan", dayOfWeek: 2, startTime: "16:00", endTime: "18:00", location: "Perpustakaan", reminderType: "popup", synced: false, updatedAt: now },
          { title: "Main Valorant bareng Discord", type: "pribadi", dayOfWeek: 2, startTime: "19:00", endTime: "22:00", reminderType: "none", synced: false, updatedAt: now },
          
          { title: "Kuliah Kecerdasan Buatan", type: "kuliah", dayOfWeek: 3, startTime: "10:00", endTime: "12:30", location: "Gedung A, Ruang 301", reminderType: "alarm", synced: false, updatedAt: now },
          { title: "Eksplorasi Framework Baru (Tugas)", type: "pribadi", dayOfWeek: 3, startTime: "14:00", endTime: "17:00", reminderType: "none", synced: false, updatedAt: now },
          
          { title: "Kuliah Keamanan Siber", type: "kuliah", dayOfWeek: 4, startTime: "08:00", endTime: "11:00", location: "Gedung C, Ruang 105", reminderType: "popup", synced: false, updatedAt: now },
          { title: "Rapat Himpunan Mahasiswa IT", type: "kegiatan", dayOfWeek: 4, startTime: "15:00", endTime: "17:00", location: "Sekretariat HIMA", reminderType: "alarm", synced: false, updatedAt: now },
          { title: "Mengerjakan Tugas Kuliah", type: "pribadi", dayOfWeek: 4, startTime: "20:00", endTime: "23:00", reminderType: "none", synced: false, updatedAt: now },
          
          { title: "Kerja Kelompok Makalah", type: "kegiatan", dayOfWeek: 5, startTime: "09:00", endTime: "11:00", location: "Cafe Dekat Kampus", reminderType: "popup", synced: false, updatedAt: now },
          { title: "Kuliah Basis Data Lanjut", type: "kuliah", dayOfWeek: 5, startTime: "13:30", endTime: "15:30", location: "Lab Database", reminderType: "popup", synced: false, updatedAt: now },
          
          { title: "Tech Meetup / Seminar IT", type: "kegiatan", dayOfWeek: 6, startTime: "09:00", endTime: "15:00", location: "Auditorium", reminderType: "alarm", synced: false, updatedAt: now },
          { title: "Nongkrong Refreshing", type: "pribadi", dayOfWeek: 6, startTime: "18:00", endTime: "22:00", reminderType: "none", synced: false, updatedAt: now },
        ]);

        // --- SCHEDULES (Calendar Events) ---
        await db.schedules.bulkAdd([
          { title: "Ujian Tengah Semester - Jarkom", type: "kuliah", date: getRelDate(1), isRecurring: false, reminderEnabled: true, reminderType: "alarm", synced: false, updatedAt: now },
          { title: "Tech Meetup Jakarta Pagi", type: "kegiatan", date: getRelDate(2), isRecurring: false, reminderEnabled: true, reminderType: "popup", synced: false, updatedAt: now },
          { title: "Batas Pengumpulan Proposal Skripsi", type: "kuliah", date: getRelDate(7), isRecurring: false, reminderEnabled: true, reminderType: "alarm", synced: false, updatedAt: now },
          { title: "Interview Magang Startup (Online)", type: "kegiatan", date: getRelDate(10), isRecurring: false, reminderEnabled: true, reminderType: "alarm", synced: false, updatedAt: now },
          { title: "Deadline Freelance Aplikasi Kasir", type: "pribadi", date: getRelDate(5), isRecurring: false, reminderEnabled: true, reminderType: "popup", synced: false, updatedAt: now },
        ]);
      });
      alert('Berhasil masuk ke Mode Demo! Anda akan diarahkan ke Dashboard.');
      window.location.href = '/';
    } catch (e) {
      console.error(e);
      alert('Gagal memasukkan data dummy.');
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full max-w-2xl mx-auto w-full pb-24">
      
      {/* Header */}
      <div className="flex flex-col gap-1 mb-2 mt-4 text-center items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-2 rotate-3 hover:rotate-0 transition-all">
          <span className="text-2xl font-black text-white">MT</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pengaturan</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Sesuaikan MyTracker dengan gaya Anda.</p>
      </div>

      {/* Account Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
          <FiUser /> Profil Akun
        </h2>
        
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-6 animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-14 w-14"></div>
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </div>
            </div>
          ) : user ? (
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 w-full">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-[3px] border-indigo-500 p-0.5 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xl truncate">{user.displayName || 'Pengguna MT'}</h4>
                  <p className="text-sm text-slate-500 font-medium truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-all active:scale-95 w-full sm:w-auto"
              >
                <FiLogOut /> Keluar
              </button>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-6">
              <div className="text-center bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-indigo-800 dark:text-indigo-300 text-sm font-semibold">
                  Login sekarang untuk mengaktifkan Cloud Sync. Data Anda akan aman dan bisa diakses dari perangkat lain!
                </p>
              </div>
              
              <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
                {/* Email Login Form */}
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                  {authError && <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-xs rounded-lg font-medium text-center">{authError}</div>}
                  <input 
                    type="email" 
                    placeholder="Alamat Email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <input 
                    type="password" 
                    placeholder="Kata Sandi" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button type="submit" className="mt-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95">
                    {isLoginMode ? 'Masuk' : 'Daftar Akun Baru'}
                  </button>
                  <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-xs font-bold text-slate-500 hover:text-indigo-500 mt-2 text-center transition-colors">
                    {isLoginMode ? 'Belum punya akun? Klik untuk daftar.' : 'Sudah punya akun? Klik untuk masuk.'}
                  </button>
                </form>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Atau</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                {/* Google Auth */}
                <button 
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Lanjutkan dengan Google
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
          <FiSmartphone /> Preferensi Aplikasi
        </h2>
        
        <div className="glass-card overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          {/* Theme Toggle */}
          <div 
            onClick={toggleTheme}
            className="flex items-center justify-between p-5 sm:p-6 gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm">
                {theme === 'light' ? <FiSun size={22} className="text-amber-500" /> : <FiMoon size={22} className="text-indigo-400" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Tema Gelap</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Lindungi mata di malam hari.</p>
              </div>
            </div>
            
            <button 
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none pointer-events-none"
              style={{ backgroundColor: theme === 'dark' ? '#6366f1' : '#e2e8f0' }}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                  theme === 'dark' ? "translate-x-8" : "translate-x-1"
                )}
              />
            </button>
          </div>
          
          {/* Notification / Alarm Sound */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm">
                <FiBell size={22} className="text-rose-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Suara Alarm</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Nada untuk jadwal Anda.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={alarmPattern}
                onChange={(e) => handleAlarmChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="beep">Beep</option>
                <option value="pulse">Pulse</option>
                <option value="siren">Siren</option>
              </select>
              
              <button 
                onClick={testAlarm}
                className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                title="Test Suara"
              >
                <FiPlayCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instalasi Aplikasi PWA */}
        {isInstallable && (
          <div className="glass-card p-6 flex flex-col gap-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden mt-6 shadow-lg shadow-indigo-500/20">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <FiSmartphone size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Install MyTracker PWA</h3>
                <p className="text-sm text-indigo-50 opacity-90 leading-relaxed">
                  Pasang aplikasi ini di layar utama (Home Screen) Anda agar bisa dibuka dengan cepat dan dapat berjalan meski tanpa koneksi internet (Offline).
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleInstallClick}
              className="mt-2 w-full py-3 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-xl transition-colors shadow-sm relative z-10"
            >
              Pasang Aplikasi Sekarang
            </button>
          </div>
        )}

      {/* Data Backup Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
          <FiDatabase /> Data & Keamanan
        </h2>
        
        <div className="glass-card p-5 sm:p-6 flex flex-col gap-5">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Cadangkan semua data Anda ke dalam satu file. Sangat berguna jika Anda ingin pindah perangkat tapi tidak menggunakan fitur sinkronisasi cloud.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <FiDownload size={18} /> Cadangkan Data
            </button>
            
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImport} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <FiUpload size={18} /> Pulihkan File
            </button>
          </div>
          
          <button 
            onClick={handleInjectDummyData}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm active:scale-95 mt-2"
          >
            <FiDatabase size={18} /> Isi Data Dummy (Mahasiswa IT)
          </button>
        </div>
      </div>

      {/* About Us Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
          <FiInfo /> Tentang Aplikasi
        </h2>
        
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">MyTracker v1.2.0</h4>
            <p className="text-sm font-medium text-slate-500 mt-1">Dibuat khusus untuk Anda mengatur segala aktivitas harian.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 w-full mt-2">
            <a 
              href="https://whatsapp.com/channel/0000000000000000000000" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20 rounded-xl transition-colors border border-teal-200 dark:border-teal-500/20"
            >
              <FiMessageCircle size={18} /> Saluran WhatsApp
            </a>
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-500/20"
            >
              <FiMessageCircle size={18} /> Chat WhatsApp
            </a>
            <a 
              href="mailto:contact@mytracker.app"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              <FiMail size={18} /> Email Kami
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
