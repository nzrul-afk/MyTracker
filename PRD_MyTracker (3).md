# Product Requirements Document (PRD)
# MyTracker

**Versi:** 1.0
**Tanggal:** 26 Juli 2026
**Status:** Draft
**Pemilik Produk:** [Nama kamu]

---

## 1. Ringkasan Produk (Overview)

MyTracker adalah web application berbasis **PWA (Progressive Web App)** yang membantu mahasiswa mengelola tiga aspek utama kehidupan sehari-hari: **keuangan, waktu, dan perencanaan** — dalam satu aplikasi terintegrasi.

Aplikasi ini dibangun dengan konsep **"Lite App"** seperti Facebook Lite / Instagram Lite: ringan, cepat, hemat kuota, terasa seperti aplikasi native meskipun berjalan di browser, dan bisa **di-install ke home screen HP** tanpa perlu dipublikasikan ke Google Play Store atau App Store.

Seluruh pengembangan dan operasional aplikasi menggunakan **layanan gratis (free tier)**, tanpa biaya modal.

---

## 2. Latar Belakang & Masalah

Mahasiswa umumnya menghadapi:
- Kesulitan mengatur keuangan bulanan (uang saku, biaya kos, kebutuhan kuliah) sehingga sering kehabisan uang di tengah bulan
- Jadwal kuliah, tugas, dan aktivitas pribadi yang tersebar di berbagai aplikasi berbeda (catatan HP, kalender, reminder terpisah)
- Kurangnya alat perencanaan sederhana untuk to-do list, wishlist, dan tracking project/tugas kelompok
- Aplikasi manajemen keuangan/produktivitas yang ada di pasaran sering terlalu kompleks, berbayar, atau tidak dirancang khusus untuk kebutuhan mahasiswa

MyTracker hadir sebagai solusi **all-in-one, gratis, ringan, dan sederhana**.

---

## 3. Tujuan Produk (Goals)

1. Menyediakan satu platform terpadu untuk mencatat & memantau keuangan, jadwal, dan rencana mahasiswa
2. Memberikan pengalaman seperti aplikasi native (cepat, installable, bisa dipakai offline) tanpa biaya development/hosting
3. Mendorong kebiasaan baik (disiplin finansial & manajemen waktu) lewat insight/analisis sederhana dan motivasi harian
4. Bisa diakses nyaman baik dari HP maupun laptop dengan satu basis kode (responsive)

### Non-Goals (di luar cakupan versi awal)
- Tidak menjadi aplikasi perbankan/pembayaran (tidak ada transaksi uang riil, hanya pencatatan manual)
- Tidak dipublikasikan ke Play Store/App Store
- Tidak mendukung multi-organisasi/tim (kolaborasi project bersifat personal, bukan multi-user real-time)
- Tidak mendukung multi-currency — seluruh pencatatan keuangan menggunakan **Rupiah (IDR)** saja

---

## 4. Target Pengguna

**Persona utama:** Mahasiswa (S1/D3), usia 18–24 tahun, mengelola keuangan pribadi dari uang saku/kiriman orang tua/kerja paruh waktu, memiliki jadwal kuliah + tugas + kegiatan organisasi yang padat, terbiasa menggunakan smartphone sebagai alat utama.

**Kebutuhan mereka:**
- Cepat mencatat pemasukan/pengeluaran tanpa proses ribet
- Pengingat otomatis untuk tagihan, tugas, dan jadwal
- Melihat gambaran besar (summary) keuangan & aktivitas dalam sekali buka app
- Bisa dipakai walau sinyal internet lemah (kos, kampus dengan wifi terbatas)

---

## 5. Konsep Produk & Prinsip Desain

| Prinsip | Penjelasan |
|---|---|
| **Lite & Cepat** | Ukuran bundle kecil, loading cepat, minim animasi berat, prioritas performa di jaringan lambat |
| **Installable (PWA)** | Bisa di-"Add to Home Screen" dari browser, tampil seperti app native, punya ikon & splash screen sendiri |
| **Offline-first** | Data utama (transaksi, to-do, catatan) tetap bisa diakses & diisi tanpa internet, lalu sinkron otomatis saat online |
| **Responsive dua wajah** | Layout **sidebar** di layar lebar (laptop/tablet) dan tetap sidebar/collapsible di HP (bukan bottom nav, sesuai keputusan produk) |
| **Zero-cost stack** | Semua layanan pendukung (hosting, database, auth, API) memakai tingkat gratis |

---

## 6. Struktur Navigasi & Arsitektur Informasi

Navigasi utama menggunakan **sidebar** (di HP bisa collapsible/hamburger, di laptop persisten) dengan 6 menu utama:

1. **Dashboard**
2. **Finance**
3. **Planning**
4. **Schedule** (gabungan Jadwal harian/mingguan/bulanan + Kalender)
5. **Note**
6. **Setting**

```
┌──────────────┐
│   MyTracker  │
├──────────────┤
│ 🏠 Dashboard │
│ 💰 Finance   │
│ 🗂  Planning │
│ 📅 Schedule  │
│ 📝 Note      │
│ ⚙️  Setting  │
└──────────────┘
```

### Sub-navigasi di Dalam Setiap Menu

Setiap menu utama membuka halamannya sendiri, dan sebagian besar punya **sub-navigasi (nav internal)** untuk berpindah antar bagian di dalam menu tersebut. **Note** dan **Setting** tidak punya sub-navigasi — begitu diklik langsung tampil full screen.

| Menu Utama | Sub-navigasi Internal | Full Screen Langsung? |
|---|---|---|
| **Dashboard** | Tab ringkasan: Finance, Planning, Schedule | — |
| **Finance** | Spending, Anggaran, Tagihan, Data (Analisis & Perbandingan) | — |
| **Planning** | To-Do List, Wishlist, Project Tracker | — |
| **Schedule** | Jadwal, Kalender | — |
| **Note** | *(tidak ada)* | ✅ Ya |
| **Setting** | *(tidak ada)* | ✅ Ya |

Contoh alur: user klik **Finance** di sidebar → masuk halaman Finance → di dalamnya ada sub-nav (mis. tab/segmented control) untuk berpindah antara Spending, Anggaran, Tagihan, dan Data.

---

## 7. Rincian Fitur per Modul

### 7.1 Dashboard
| Fitur | Deskripsi |
|---|---|
| Kutipan motivasi harian | Menampilkan 1 kutipan motivasi yang berganti tiap hari, diambil dari API eksternal gratis (misal Quotable API / ZenQuotes / Quotes API lain), di-cache lokal agar tetap muncul walau offline |
| Tab ringkasan | 3 tombol/tab untuk berpindah tampilan ringkasan: **Finance**, **Planning**, **Schedule** — masing-masing menampilkan kartu status singkat (misal: sisa saldo bulan ini, jumlah to-do belum selesai, agenda terdekat) |
| Quick action | Tombol cepat untuk tambah transaksi / tambah to-do / tambah catatan langsung dari dashboard |

### 7.2 Finance
Sub-navigasi internal: **Spending | Anggaran | Tagihan | Data**

| Sub-tab | Deskripsi |
|---|---|
| **Spending** | Pencatatan pemasukan & pengeluaran (income & outcome), dengan kategori (makan, transport, kos, hiburan, dll), tanggal, nominal, catatan opsional |
| **Anggaran** | User menentukan target/limit per kategori per bulan (misal: makan Rp800rb/bulan), sistem menampilkan progress bar realisasi vs target, notifikasi saat mendekati/melebihi limit |
| **Tagihan** | Catat hutang & piutang (siapa berhutang/dipinjami, jumlah, jatuh tempo) serta tagihan bulanan rutin (listrik, kos, internet, cicilan) dengan reminder jatuh tempo |
| **Data** | Analisis & perbandingan: grafik pengeluaran per kategori (pie/bar chart), tren bulan-ke-bulan, perbandingan anggaran vs realisasi, insight sederhana ("pengeluaran makan naik 20% dari bulan lalu") |

### 7.3 Planning
Sub-navigasi internal: **To-Do List | Wishlist | Project Tracker**

| Sub-tab | Deskripsi |
|---|---|
| **To-Do List** | Daftar tugas dengan kategori (kuliah, organisasi, pribadi, dll), status (belum/proses/selesai), prioritas, deadline |
| **Wishlist** | Daftar rencana barang yang ingin dibeli, estimasi harga, prioritas, opsional dikaitkan ke target tabungan di modul Finance |
| **Project Tracker** | Kelola project/tugas besar dengan breakdown sub-task, progress %, deadline, catatan |

### 7.4 Schedule (Jadwal + Kalender jadi satu)
Sub-navigasi internal: **Jadwal | Kalender**

| Sub-tab | Deskripsi |
|---|---|
| **Jadwal** | Tampilan harian/mingguan/bulanan untuk kuliah, kegiatan, dan agenda pribadi; dilengkapi pengingat berupa **pop-up di layar** dan **alarm bersuara** untuk agenda mendatang, dengan **nada/suara yang bisa dikustomisasi** oleh user per pengingat (lihat catatan keterbatasan teknis di bagian 9) |
| **Kalender** | Tampilan kalender yang terintegrasi dengan Google Calendar — sinkron dua arah (atau minimal import) via Google Calendar API |

### 7.5 Note
Tanpa sub-navigasi — langsung tampil **full screen** saat menu diklik.
- Catatan bebas (judul + isi teks), bisa dikategorikan/di-pin, pencarian catatan, disimpan offline

### 7.6 Setting
Tanpa sub-navigasi — langsung tampil **full screen** saat menu diklik.
- Ganti tema (Dark/Light mode)
- Preferensi notifikasi: pilih nada/suara default untuk pop-up & alarm pengingat
- Backup & restore data (export/import, serta sync ke cloud jika login)
- Retensi data: user bisa memilih jangka waktu penyimpanan histori (mis. 6 bulan/1 tahun) atau membiarkannya **disimpan selamanya** (default)
- Hubungi admin (link WhatsApp & email — tanpa form in-app)
- **Login/Register** menggunakan **Google Sign-In (OAuth 2.0)** — setelah login, data user tersimpan terhubung ke akun Google-nya (mendukung sync multi-device)
- Kelola akun & logout

---

## 8. Alur Data: Offline-First + Sync

Karena keputusan produk adalah **offline-first dengan kemampuan sync/backup**, berikut prinsip kerjanya:

1. Semua input (transaksi, to-do, catatan, jadwal) pertama-tama disimpan **lokal di perangkat** (via IndexedDB), sehingga app tetap berfungsi penuh tanpa internet
2. Saat koneksi internet tersedia dan user sudah login, data disinkronkan otomatis ke **database cloud gratis** (misal Firebase Firestore)
3. Jika user memakai lebih dari satu perangkat, data akan sinkron begitu online
4. Fitur backup manual juga tersedia di menu Setting (export ke file/import dari file, sebagai lapisan aman tambahan)
5. Konflik data (jika ada perubahan di 2 device sebelum sync) ditangani dengan pendekatan sederhana: **data terbaru (last write wins)**

---

## 9. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| **Performa** | First load < 3 detik di koneksi 3G, ukuran bundle awal dioptimalkan (code splitting) |
| **Installable** | Memenuhi kriteria PWA (manifest.json, service worker, HTTPS) agar muncul prompt "Add to Home Screen" |
| **Offline** | Modul Finance, Planning, Note bisa dipakai penuh tanpa internet |
| **Responsive** | Layout menyesuaikan dari lebar HP (≥320px) hingga desktop |
| **Keamanan** | Lihat rincian lengkap di bawah tabel |
| **Notifikasi** | Dua bentuk pengingat: **pop-up** (tampil di layar via Web Notification API) dan **alarm** (bunyi menggunakan file audio kustom, diputar lewat browser saat app terbuka/di-background via Service Worker). User bisa memilih nada/suara sendiri untuk tiap pengingat. **Catatan**: dukungan penuh (termasuk saat app tertutup) hanya optimal di Android/Chrome; iOS Safari baru mendukung push notification untuk PWA yang sudah ter-install (iOS 16.4+), dan pemutaran suara custom saat app tertutup memiliki keterbatasan tergantung browser/OS — ini perlu dikomunikasikan sebagai keterbatasan platform, bukan bug |

### Detail Kebutuhan Keamanan

- **Enkripsi data in-transit**: seluruh komunikasi client–server menggunakan HTTPS/TLS (otomatis tersedia dari hosting Vercel/Netlify)
- **Enkripsi data at-rest**: mengandalkan enkripsi bawaan dari penyedia database (Firebase Firestore mengenkripsi data secara default di sisi server) — **tidak ada lapisan enkripsi tambahan khusus di level aplikasi untuk data keuangan** (keputusan produk: cukup HTTPS + enkripsi bawaan Firestore, tanpa enkripsi tambahan)
- **Kontrol akses data**: Firestore Security Rules memastikan tiap user hanya bisa membaca/menulis data miliknya sendiri (berdasarkan UID dari Firebase Auth)
- **Autentikasi**: menggunakan Google Sign-In (OAuth 2.0), sehingga MyTracker tidak menyimpan password sendiri
- **Data lokal (mode offline)**: data yang tersimpan di IndexedDB perangkat tidak dienkripsi secara khusus — mengandalkan keamanan bawaan perangkat/browser milik user
- **Sesi login**: token sesi dikelola otomatis oleh Firebase Auth (auto-refresh), dan dihapus saat user logout
- **File backup/export**: file backup yang diunduh user (format JSON) tidak terenkripsi otomatis — tanggung jawab penyimpanan file yang aman ada di tangan user

---

## 10. Rekomendasi Tech Stack (Zero-Budget)

| Kebutuhan | Opsi Gratis yang Direkomendasikan |
|---|---|
| Frontend framework | React / Next.js atau Vue (dengan plugin PWA seperti `next-pwa` / `vite-plugin-pwa`) |
| Styling | Tailwind CSS |
| Autentikasi | Firebase Authentication (Google provider) — free tier |
| Database & Sync | Firebase Firestore (free tier / Spark plan) |
| Local/offline storage | IndexedDB (lewat library Dexie.js) |
| Hosting | Vercel atau Netlify (free tier, mendukung HTTPS otomatis) |
| API kutipan motivasi | API kutipan gratis tanpa API key (misal Quotable/ZenQuotes — perlu dicek ketersediaan terkini) |
| Integrasi kalender | Google Calendar API (free quota, via Google Cloud Console) |
| Grafik/analisis | Chart.js atau Recharts (gratis, open source) |

> Catatan: semua opsi di atas memiliki *free tier* dengan batas kuota tertentu (misal jumlah baca/tulis database per hari). Perlu dipantau agar tidak melebihi limit gratis seiring bertambahnya pengguna.

---

## 11. Metrik Keberhasilan (Success Metrics)

- Retensi: % user yang kembali membuka app dalam 7 hari setelah instalasi
- Engagement: rata-rata jumlah transaksi/to-do yang dicatat per user per minggu
- Adopsi PWA: % user yang benar-benar melakukan "Add to Home Screen"
- Efektivitas anggaran: % user yang tetap berada dalam budget yang mereka set sendiri

---

## 12. Roadmap (Usulan)

| Fase | Fokus |
|---|---|
| **MVP** | Auth Google, Finance (income/outcome + anggaran), Planning (to-do), Note, mode offline dasar, PWA installable |
| **V1.1** | Hutang/piutang & tagihan bulanan, analisis & grafik, dark/light mode |
| **V1.2** | Integrasi Google Calendar, notifikasi & alarm, project tracker |
| **V1.3** | Backup/restore lengkap, wishlist, kutipan motivasi harian via API |

---

## 13. Alur Pengerjaan (Development Workflow)

Roadmap di atas menjelaskan **apa** yang dikerjakan di tiap fase. Bagian ini menjelaskan **urutan kerja konkret**, dari nol sampai rilis, supaya proses development terstruktur dan tidak bolak-balik.

```
Tahap 0          Tahap 1        Tahap 2          Tahap 3               Tahap 4     Tahap 5          Tahap 6
Persiapan  →  Desain UI/UX  →  Setup Fondasi  →  Development Fitur  →  Testing  →  Deployment  →  Monitoring
                                   Teknis         (MVP → V1.1 → V1.2       Awal      & Launch      & Iterasi
                                                   → V1.3)                                          (loop balik
                                                                                                     ke Tahap 3)
```

### Tahap 0 — Persiapan
- Buat repository kode (GitHub, gratis) untuk version control
- Buat papan kerja sederhana (Trello / Notion / GitHub Projects — gratis) untuk tracking task per fitur
- Daftar & siapkan akun layanan gratis yang dibutuhkan: Firebase project, Google Cloud Console (untuk OAuth & Calendar API), akun Vercel/Netlify
- Tentukan target rilis MVP (mis. deadline realistis dalam minggu/bulan)

### Tahap 1 — Desain (UI/UX)
- Buat **wireframe low-fidelity** untuk tiap menu: Dashboard, Finance, Planning, Schedule, Note, Setting (termasuk sub-navigasinya)
- Tentukan **design system** dasar: palet warna (mode terang & gelap), tipografi, gaya komponen (button, card, input, progress bar)
- Buat **mockup high-fidelity** untuk layar-layar kunci (Dashboard, Finance-Spending, Planning-ToDo)
- Validasi alur navigasi sidebar + sub-nav sudah sesuai kebutuhan sebelum masuk coding, karena perubahan struktur navigasi setelah coding jauh lebih mahal

### Tahap 2 — Setup Fondasi Teknis
- Inisialisasi project (Next.js/Vite + Tailwind CSS)
- Setup konfigurasi **PWA**: manifest.json, ikon aplikasi, service worker dasar
- Setup **Firebase**: Authentication (Google provider) + Firestore, termasuk Security Rules dasar (user hanya akses data sendiri)
- Bangun **kerangka layout**: sidebar + routing 6 menu utama, termasuk state untuk sub-navigasi tiap menu
- Setup **offline storage**: IndexedDB (Dexie.js) sebagai sumber data utama, plus mekanisme sync dasar ke Firestore
- Setup **auto-deploy**: hubungkan repository ke Vercel/Netlify agar tiap push ke branch utama otomatis ter-deploy

> Tahap 2 adalah fondasi — pastikan auth, navigasi, dan offline storage sudah jalan dengan baik sebelum lanjut ke fitur, karena semua modul di atasnya bergantung pada fondasi ini.

### Tahap 3 — Development Fitur (Urutan Prioritas)

Urutan berikut disusun berdasarkan dependency (fitur dasar dulu) dan nilai bagi pengguna (fitur yang paling sering dipakai duluan):

| Urutan | Fitur | Alasan Prioritas |
|---|---|---|
| 1 | Login Google (di Setting) | Semua fitur lain butuh identitas user |
| 2 | Finance – Spending | Fitur inti paling sering dipakai harian |
| 3 | Finance – Anggaran | Melengkapi data spending yang sudah ada |
| 4 | Planning – To-Do List | Fitur planning paling dasar & sering dipakai |
| 5 | Note | Fitur sederhana, cepat selesai, menambah kelengkapan MVP |
| 6 | Dashboard (tab ringkasan) | Butuh data dari Finance & Planning agar ringkasannya bermakna, jadi dibuat setelah keduanya ada |
| 7 | Setting dasar (tema, hubungi admin, kelola akun) | Melengkapi MVP |
| 8 | Mode offline & sync — uji integrasi menyeluruh | Menutup fase MVP dengan memastikan semua fitur di atas tahan dipakai offline |
| 9 | Finance – Tagihan (hutang/piutang & tagihan bulanan) | Fase V1.1 |
| 10 | Finance – Data (analisis & grafik) | Fase V1.1, butuh data historis dari Spending & Anggaran |
| 11 | Backup/restore data | Fase V1.1 |
| 12 | Schedule – Jadwal (+ notifikasi & alarm custom) | Fase V1.2 |
| 13 | Schedule – Kalender (+ integrasi Google Calendar) | Fase V1.2, dibangun setelah Jadwal karena berbagi komponen tampilan |
| 14 | Planning – Project Tracker | Fase V1.2 |
| 15 | Planning – Wishlist | Fase V1.3 |
| 16 | Dashboard – kutipan motivasi harian (integrasi API) | Fase V1.3, murni tambahan, tidak bergantung fitur lain |
| 17 | Preferensi notifikasi & retensi data (di Setting) | Fase V1.3 |
| 18 | Polish UI/UX, animasi ringan, optimasi performa | Terakhir, setelah semua fitur fungsional selesai |

### Tahap 4 — Testing
- **Testing fungsional** tiap modul setelah selesai dibangun (jangan tunggu sampai semua fitur jadi baru testing)
- **Testing lintas perangkat**: Android (Chrome), iOS (Safari), dan browser desktop (Chrome/Edge/Firefox)
- **Testing PWA**: pastikan prompt "Add to Home Screen" muncul dan ikon/splash screen tampil benar di Android & iOS
- **Testing mode offline**: matikan koneksi internet, pastikan input data (transaksi, to-do, catatan) tetap bisa dilakukan, lalu nyalakan internet dan pastikan data ter-sync ke Firestore
- **Testing keamanan dasar**: coba akses data dengan akun berbeda untuk memastikan Firestore Security Rules bekerja (user A tidak bisa lihat data user B)
- **User Acceptance Testing (UAT)**: minta beberapa mahasiswa mencoba MVP, kumpulkan feedback sebelum lanjut ke fitur V1.1 dst.

### Tahap 5 — Deployment & Launch
- Deploy versi production ke Vercel/Netlify
- Siapkan panduan singkat cara install PWA ("Add to Home Screen") untuk Android & iOS, karena banyak user awam belum familiar dengan PWA
- Lakukan **soft launch** ke lingkup kecil dulu (teman satu kampus/kelas) sebelum disebar lebih luas
- Pantau penggunaan kuota free tier (Firebase, hosting) sejak awal launch

### Tahap 6 — Monitoring & Iterasi
- Kumpulkan feedback pengguna lewat fitur "Hubungi Admin"
- Pantau metrik keberhasilan (lihat bagian 11) secara berkala
- Prioritaskan perbaikan bug & feedback sebelum melanjutkan ke fase fitur berikutnya (V1.1 → V1.2 → V1.3)
- Ulangi siklus Tahap 3–6 untuk setiap fase roadmap berikutnya

---

## 14. Risiko & Batasan

- **Limit free tier**: jika pengguna bertambah banyak, kuota gratis Firebase/hosting bisa terlampaui
- **Keterbatasan push notification di iOS**: user iPhone mungkin mengalami pengalaman notifikasi yang berbeda dari Android
- **Keterbatasan alarm bersuara custom saat app tertutup**: pemutaran nada/suara kustom paling konsisten saat app terbuka; saat app tertutup penuh (terutama di iOS), suara alarm bisa mengikuti nada default sistem, bukan pilihan user
- **Ketergantungan API pihak ketiga**: API kutipan motivasi atau Google Calendar bisa berubah kebijakan/limit sewaktu-waktu
- **Sync conflict**: pendekatan "last write wins" sederhana bisa berisiko menimpa data jika user aktif di 2 device bersamaan tanpa internet

---

*Dokumen ini adalah draft awal dan dapat direvisi seiring proses desain & development.*
