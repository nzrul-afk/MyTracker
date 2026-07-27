import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Bill } from '../../../lib/db';
import { FiPlus, FiTrash2, FiCheck, FiClock, FiX, FiAlertCircle, FiRepeat } from 'react-icons/fi';
import { cn, getLocalISODate } from '../../../lib/utils';

type Tab = 'semua' | 'tagihan' | 'utang' | 'piutang';

export function Tagihan() {
  const [activeTab, setActiveTab] = useState<Tab>('semua');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [type, setType] = useState<'tagihan' | 'utang' | 'piutang'>('tagihan');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const allBills = useLiveQuery(() => {
    if (!db.bills) return [];
    return db.bills.orderBy('dueDate').toArray();
  }) || [];
  
  const displayedBills = activeTab === 'semua' 
    ? allBills 
    : allBills.filter(b => b.type === activeTab);

  const handleOpenForm = (t: 'tagihan' | 'utang' | 'piutang' = 'tagihan') => {
    setType(t);
    setTitle('');
    setAmount('');
    setDueDate('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !title || !dueDate) return;
    
    await db.bills.add({
      type,
      title,
      amount: Number(amount),
      dueDate: getLocalISODate(new Date(dueDate)),
      isPaid: false,
      synced: false,
      updatedAt: Date.now()
    });

    setIsFormOpen(false);
  };

  const handleTogglePaid = async (bill: Bill) => {
    await db.bills.update(bill.id!, {
      isPaid: !bill.isPaid,
      synced: false,
      updatedAt: Date.now()
    });

    // Fitur Tagihan Berulang
    if (!bill.isPaid && bill.type === 'tagihan') {
      if (confirm(`Tagihan "${bill.title}" LUNAS!\n\nApakah Anda ingin tagihan ini berulang dan otomatis dibuatkan untuk bulan depan?`)) {
        const nextDate = new Date(bill.dueDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        await db.bills.add({
          type: bill.type,
          title: bill.title,
          amount: bill.amount,
          dueDate: getLocalISODate(nextDate),
          isPaid: false,
          synced: false,
          updatedAt: Date.now()
        });
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      await db.bills.delete(id);
    }
  };

  const isOverdue = (date: string, isPaid: boolean) => {
    if (isPaid) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(date);
    due.setHours(0,0,0,0);
    return due < today;
  };

  const getBadgeColor = (t: string) => {
    switch (t) {
      case 'tagihan': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'utang': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'piutang': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getLabel = (t: string) => {
    switch (t) {
      case 'tagihan': return 'Tagihan Bulanan';
      case 'utang': return 'Hutang (Harus Dibayar)';
      case 'piutang': return 'Piutang (Uang Masuk)';
      default: return t;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex gap-2 p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {['semua', 'tagihan', 'utang', 'piutang'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-lg capitalize whitespace-nowrap transition-all",
              activeTab === tab 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form or Add Button */}
      {!isFormOpen ? (
        <button 
          onClick={() => handleOpenForm('tagihan')}
          className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-500/20"
        >
          <FiPlus size={20} />
          Catat Tagihan / Utang / Piutang
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
            <FiClock /> Tambah Catatan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jenis</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="tagihan">Tagihan Bulanan</option>
                <option value="utang">Hutang (Saya Harus Membayar)</option>
                <option value="piutang">Piutang (Orang Harus Membayar)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama (Tagihan/Orang)</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tagihan Listrik / Budi"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nominal (Rp)</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 150000"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tgl Jatuh Tempo</label>
              <input 
                type="date" 
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium text-white transition-colors bg-indigo-500 hover:bg-indigo-600"
            >
              Simpan Data
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {displayedBills.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center">
            <FiCheck size={48} className="mb-4 text-emerald-500/50" />
            <p className="font-medium text-slate-600 dark:text-slate-300">Tidak Ada Catatan</p>
            <p className="text-sm mt-1">Anda tidak memiliki tagihan atau utang yang perlu dibayar.</p>
          </div>
        ) : (
          displayedBills.map(bill => {
            const overdue = isOverdue(bill.dueDate, bill.isPaid);

            return (
              <div 
                key={bill.id} 
                className={cn(
                  "glass-card p-4 transition-all hover:shadow-md flex flex-col sm:flex-row gap-4 justify-between sm:items-center",
                  bill.type === 'tagihan' 
                    ? "border-l-4 border-l-amber-400 dark:border-l-amber-500 bg-amber-50/10 dark:bg-amber-900/10" 
                    : "",
                  bill.isPaid && "opacity-60 grayscale-[0.5]"
                )}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <button 
                    onClick={() => handleTogglePaid(bill)}
                    className={cn(
                      "mt-1 sm:mt-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                      bill.isPaid 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500"
                    )}
                  >
                    <FiCheck size={16} />
                  </button>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1", getBadgeColor(bill.type))}>
                        {bill.type === 'tagihan' && <FiRepeat size={10} />}
                        {getLabel(bill.type)}
                      </span>
                      {overdue && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800 flex items-center gap-1">
                          <FiAlertCircle size={12} /> Overdue
                        </span>
                      )}
                    </div>
                    <h4 className={cn("font-bold text-lg", bill.isPaid ? "text-slate-500 line-through" : "text-slate-900 dark:text-white")}>
                      {bill.title}
                    </h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <FiClock size={14} /> 
                      Jatuh tempo: {new Date(bill.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-12 sm:pl-0 mt-2 sm:mt-0 border-t sm:border-none border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                  <div className={cn(
                    "font-bold text-xl",
                    bill.isPaid ? "text-slate-400" : (bill.type === 'piutang' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")
                  )}>
                    Rp {bill.amount.toLocaleString('id-ID')}
                  </div>
                  <button 
                    onClick={() => handleDelete(bill.id!)}
                    className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
