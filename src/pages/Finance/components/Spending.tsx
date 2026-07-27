import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { FiArrowUpRight, FiArrowDownRight, FiTrash2, FiX, FiDollarSign } from 'react-icons/fi';
import { cn, getLocalISODate } from '../../../lib/utils';

export function Spending() {
  const allTransactions = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().toArray()
  ) || [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'income' | 'outcome'>('outcome');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  // Use local ISO date so that the form default doesn't shift
  const [date, setDate] = useState(getLocalISODate());

  const incomeCategories = ['Gaji', 'Bonus', 'Pemberian', 'Investasi', 'Lainnya'];
  const outcomeCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Edukasi', 'Lainnya'];

  const handleOpenForm = (type: 'income' | 'outcome') => {
    setFormType(type);
    setCategory(type === 'income' ? incomeCategories[0] : outcomeCategories[0]);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    // Store as local ISO date string, e.g., '2026-07-27' or '2026-07-27T12:00:00'
    // This allows startsWith('2026-07') to work correctly.
    // If the user inputs a date from the datepicker, we'll just save that date string directly.
    await db.transactions.add({
      type: formType,
      amount: Number(amount),
      category,
      note,
      date: date, // YYYY-MM-DD
      synced: false,
      updatedAt: Date.now()
    });

    setAmount('');
    setNote('');
    setIsFormOpen(false);
  };

  const handleDelete = async (id: number) => {
    if(confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      await db.transactions.delete(id);
    }
  };

  const totalBalance = allTransactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTransactions = allTransactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutcome = monthlyTransactions.filter(t => t.type === 'outcome').reduce((acc, curr) => acc + curr.amount, 0);

  const recentTransactions = allTransactions.slice(0, 100); // Display only top 100 in list

  return (
    <div className="flex flex-col gap-6">
      {/* Total Balance Card */}
      <div className="glass-card relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-lg shadow-primary-500/30 p-6 sm:p-8">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FiDollarSign size={120} className="-mr-6 -mt-6" />
        </div>
        <div className="relative z-10">
          <p className="text-primary-100 font-medium mb-1 tracking-wide">Total Saldo Tersedia</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiArrowUpRight size={64} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pemasukan Bulan Ini</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Rp {totalIncome.toLocaleString('id-ID')}
          </h3>
        </div>
        
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiArrowDownRight size={64} className="text-rose-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pengeluaran Bulan Ini</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Rp {totalOutcome.toLocaleString('id-ID')}
          </h3>
        </div>
      </div>

      {/* Actions */}
      {!isFormOpen ? (
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenForm('income')}
            className="flex items-center justify-center gap-2 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-500/20"
          >
            <FiArrowUpRight size={18} />
            Catat Pemasukan
          </button>
          <button 
            onClick={() => handleOpenForm('outcome')}
            className="flex items-center justify-center gap-2 flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm shadow-rose-500/20"
          >
            <FiArrowDownRight size={18} />
            Catat Pengeluaran
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 border-2 border-primary-500/20 shadow-lg relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            type="button" 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <FiX size={20} />
          </button>
          
          <h3 className={cn(
            "text-lg font-bold mb-4 flex items-center gap-2",
            formType === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {formType === 'income' ? <FiArrowUpRight /> : <FiArrowDownRight />}
            Tambah {formType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nominal (Rp)</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              >
                {(formType === 'income' ? incomeCategories : outcomeCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
              <input 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Makan siang..."
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              className={cn(
                "px-6 py-2.5 rounded-xl font-medium text-white transition-colors",
                formType === 'income' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
              )}
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      )}

      {/* Transaction List */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h4 className="font-semibold text-slate-900 dark:text-white">Riwayat Terakhir</h4>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{recentTransactions.length} Transaksi</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[400px] overflow-y-auto">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada transaksi bulan ini. Mulai catat keuangan Anda!</div>
          ) : (
            recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl flex items-center justify-center",
                    t.type === 'income' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                  )}>
                    {t.type === 'income' ? <FiArrowUpRight size={20} /> : <FiArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{t.category}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {t.note || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "font-bold",
                    t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </div>
                  <button 
                    onClick={() => handleDelete(t.id!)}
                    className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
