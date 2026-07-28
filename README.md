# 🚀 MyTracker - All-in-One Personal Management PWA

MyTracker adalah aplikasi web progresif (*Progressive Web App / PWA*) bergaya modern (Glassmorphism) yang dirancang khusus untuk mahasiswa dan profesional muda dalam mengelola **Keuangan**, **Jadwal Harian**, **Tugas (Trello-like/Pomodoro)**, dan **Catatan Pribadi** dalam satu tempat. 

Dibangun dengan **React**, **Vite**, **TypeScript**, dan **TailwindCSS**, aplikasi ini mengusung konsep *Local-First* menggunakan **IndexedDB (Dexie.js)** sehingga sangat ringan dan cepat.

---

## 🌐 Live Demo / Cara Pakai
Anda dapat langsung mencoba dan menggunakan aplikasi ini tanpa perlu mengunduh atau menginstal apa pun. Cukup kunjungi tautan berikut:

👉 **[https://my-tracker-woad-chi.vercel.app](https://my-tracker-woad-chi.vercel.app)**

*(Saran: Buka tautan di atas melalui browser HP Anda, lalu pilih opsi "Tambahkan ke Layar Utama" atau "Add to Home Screen" untuk menginstalnya sebagai aplikasi PWA).*

---

## ✨ Fitur Utama
- 💰 **Finance Tracker:** Pencatatan pemasukan, pengeluaran, anggaran bulanan, tagihan rutin, hingga *wishlist* barang impian lengkap dengan grafik visual (*Recharts*).
- 📅 **Schedule & Habit:** Kalender interaktif, manajemen rutinitas harian, dan pelacak kebiasaan (*Habit Tracker*).
- 🎯 **Planning:** Sistem Todo-List terintegrasi dengan *Pomodoro Timer*, serta pelacak *Project/Tugas Akhir* dengan sub-task.
- 📝 **Notes:** Penyimpanan catatan dan materi penting (mendukung fitur *Pin*).
- ⚙️ **Settings & Security:** Mode Gelap/Terang, Backup/Restore data (JSON), Injeksi Data Demo, dan Perlindungan Keamanan Kelas Militer (HSTS, CSP, Anti-XSS).

---

## 🌟 Kelebihan (Pros)

1. **Local-First & Offline Capable 📶**  
   Data utama disimpan di memori *browser* perangkat Anda sendiri (IndexedDB). Artinya, aplikasi akan berjalan super cepat, instan, dan **tetap bisa dibuka secara normal walau Anda tidak memiliki koneksi internet (Offline)**.
2. **Bisa Di-install (Progressive Web App) 📱**  
   Bukan sekadar situs web biasa. MyTracker bisa di-install (ditambahkan ke *Home Screen*) di Android, iOS, maupun PC Windows/Mac layaknya aplikasi *native*.
3. **Privasi Super Aman (Privacy-Focused) 🔒**  
   Karena *database* berada di dalam gawai/laptop Anda sendiri, tidak ada orang (bahkan pembuat aplikasi) yang bisa mengintip data keuangan atau tugas Anda. 
4. **Hardened Security 🛡️**  
   Dilengkapi fitur **Self-Destruct Protocol**—jika Anda menekan tombol *Logout*, seluruh memori lokal akan dihapus seketika untuk menghindari pencurian data saat meminjamkan HP/Laptop ke orang lain. Aplikasi juga diproteksi dengan header CSP dan HSTS secara *native*.
5. **Modern & Responsif 🎨**  
   Antarmuka dibuat dengan estetika *Glassmorphism* yang memanjakan mata, lengkap dengan *Bottom Navigation Bar* khusus bagi pengguna ponsel (Mobile-First UX).

---

## ⚠️ Kekurangan (Cons)

1. **Sinkronisasi Multi-Perangkat Terbatas 🔄**  
   Karena menggunakan arsitektur *Local-First*, data secara *default* terjebak di perangkat yang Anda gunakan (contoh: input di HP tidak akan langsung muncul di Laptop). *Solusi: Anda harus menggunakan fitur Backup/Restore JSON manual untuk memindahkan data.*
2. **Risiko Data Hilang (Volatile Storage) 🧹**  
   Jika Anda melakukan *Clear Cache* / *Clear Site Data* pada peramban (Chrome/Safari) dengan sengaja, maka **seluruh data Anda akan hilang**. Selalu lakukan *Export/Backup Data* secara berkala melalui menu Pengaturan.
3. **Ketergantungan Browser Lama 🌐**  
   Fitur *Service Worker* dan dukungan PWA terbaik (terutama instalasi) memerlukan *browser* versi modern (Chrome/Edge terbaru). Di *browser* yang sangat usang, aplikasi mungkin hanya berjalan sebagai web standar.

---

### 💻 Tech Stack
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** TailwindCSS v4 + Framer Motion (Animations)
- **Database (Local):** Dexie.js (IndexedDB wrapper)
- **Authentication:** Firebase Auth
- **Icons:** React-Icons (Feather Icons)
- **Charts:** Recharts
- **PWA:** Vite-Plugin-PWA + Workbox
