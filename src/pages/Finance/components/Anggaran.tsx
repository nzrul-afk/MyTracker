import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { FiPlus, FiTrash2, FiTarget, FiAlertCircle, FiX } from 'react-icons/fi';
import { cn, getLocalISOMonth } from '../../../lib/utils';

export function Anggaran() {
  const currentMonth = getLocalISOMonth(); // "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [category, setCategory] = useState('Makanan');
  const [amount, setAmount] = useState('');

  const outcomeCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Edukasi', 'Lainnya'];

  const budgets = useLiveQuery(() => db.budgets.where('month').equals(selectedMonth).toArray(), [selectedMonth]) || [];
  
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const monthlyOutcomes = transactions.filter(t => t.type === 'outcome' && t.date.startsWith(selectedMonth));

  const handleOpenForm = () => {
    setCategory(outcomeCategories[0]);
    setAmount('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    // Cek apakah kategori sudah ada anggarannya
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      await db.budgets.update(existing.id!, {
        limit: Number(amount),
        synced: false,
        updatedAt: Date.now()
      });
    } else {
      await db.budgets.add({
        category,
        limit: Number(amount),
        month: selectedMonth,
        synced: false,
        updatedAt: Date.now()
      });
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (id: number) => {
    if(confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) {
      await db.budgets.delete(id);
    }
  };

  // Kalkulasi total
  const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const totalSpent = monthlyOutcomes.reduce((acc, curr) => acc + curr.amount, 0);
  const overallPercentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverBudgetOverall = totalSpent > totalBudget && totalBudget > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Month Selector */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-transparent border-none outline-none font-medium text-slate-700 dark:text-slate-300 focus:ring-0 px-2"
        />
      </div>

      {/* Main Card */}
      <div className="glass-card relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-lg shadow-indigo-500/30 p-6 sm:p-8">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FiTarget size={120} className="-mr-6 -mt-6" />
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <p className="text-indigo-100 font-medium tracking-wide">Total Anggaran Bulan Ini</p>
          <h2 className="text-4xl font-bold tracking-tight">
            Rp {totalBudget.toLocaleString('id-ID')}
          </h2>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Terpakai: Rp {totalSpent.toLocaleString('id-ID')}</span>
              <span>{overallPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-indigo-900/50 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", isOverBudgetOverall ? "bg-rose-400" : "bg-white")} 
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
            {isOverBudgetOverall && (
              <p className="text-xs text-rose-300 mt-2 flex items-center gap-1">
                <FiAlertCircle /> Anda telah melebihi total anggaran bulan ini!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions / Form */}
      {!isFormOpen ? (
        <button 
          onClick={handleOpenForm}
          className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-500/20"
        >
          <FiPlus size={20} />
          Buat Anggaran Kategori
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
            <FiTarget />
            Atur Anggaran Kategori
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {outcomeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batas Anggaran (Rp)</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 1000000"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium text-white transition-colors bg-indigo-500 hover:bg-indigo-600"
            >
              Simpan Anggaran
            </button>
          </div>
        </form>
      )}

      {/* Budgets List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Rincian per Kategori</h3>
        {budgets.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500">
            Belum ada anggaran di bulan ini. Mulai atur keuanganmu!
          </div>
        ) : (
          budgets.map(budget => {
            const spent = monthlyOutcomes.filter(t => t.category === budget.category).reduce((acc, curr) => acc + curr.amount, 0);
            const percent = Math.min((spent / budget.limit) * 100, 100);
            const isWarning = percent >= 80 && percent < 100;
            const isDanger = percent >= 100;
            const sisa = budget.limit - spent;

            return (
              <div key={budget.id} className="glass-card p-5 group transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{budget.category}</h4>
                    <p className={cn("text-sm font-medium", sisa < 0 ? "text-rose-500" : "text-slate-500")}>
                      {sisa < 0 ? `Overbudget: Rp ${Math.abs(sisa).toLocaleString('id-ID')}` : `Sisa: Rp ${sisa.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(budget.id!)}
                    className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                
                <div className="flex justify-between text-xs mb-1 mt-4 text-slate-600 dark:text-slate-400 font-medium">
                  <span>Terpakai: Rp {spent.toLocaleString('id-ID')}</span>
                  <span>Batas: Rp {budget.limit.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isDanger ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                    )} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                {isDanger && (
                  <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-medium">
                    <FiAlertCircle /> Anggaran untuk kategori ini sudah habis!
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
