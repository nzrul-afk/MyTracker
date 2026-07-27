import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { FiPlus, FiTrash2, FiCheck, FiX, FiStar, FiGift } from 'react-icons/fi';
import { cn } from '../../../lib/utils';

export function Wishlist() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const wishlists = useLiveQuery(() => {
    if (!db.wishlists) return [];
    return db.wishlists.orderBy('priority').reverse().toArray();
  }) || [];

  const handleOpenForm = () => {
    setTitle('');
    setPrice('');
    setPriority('medium');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price)) || !title) return;
    
    await db.wishlists.add({
      title,
      price: Number(price),
      priority,
      isAchieved: false,
      synced: false,
      updatedAt: Date.now()
    });

    setIsFormOpen(false);
  };

  const handleToggleAchieved = async (id: number, currentAchieved: boolean) => {
    await db.wishlists.update(id, {
      isAchieved: !currentAchieved,
      synced: false,
      updatedAt: Date.now()
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini dari wishlist?')) {
      await db.wishlists.delete(id);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'high': return 'Tinggi';
      case 'medium': return 'Sedang';
      case 'low': return 'Rendah';
      default: return p;
    }
  };

  const totalRequired = wishlists
    .filter(w => !w.isAchieved)
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Summary Card */}
      <div className="glass-card p-5 relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FiGift size={100} className="-mr-6 -mt-6" />
        </div>
        <h4 className="text-sm font-medium text-indigo-100 mb-1">Total Dana yang Dibutuhkan</h4>
        <h3 className="text-3xl font-bold">
          Rp {totalRequired.toLocaleString('id-ID')}
        </h3>
        <p className="text-xs text-indigo-200 mt-2">Untuk merealisasikan wishlist yang belum tercapai.</p>
      </div>

      {/* Form or Add Button */}
      {!isFormOpen ? (
        <button 
          onClick={handleOpenForm}
          className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-500/20"
        >
          <FiPlus size={20} />
          Tambah Wishlist
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
            <FiStar /> Tambah Wishlist
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Barang / Impian</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Laptop Baru"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estimasi Harga (Rp)</label>
              <input 
                type="number" 
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 15000000"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prioritas</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
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
        {wishlists.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center">
            <FiGift size={48} className="mb-4 text-indigo-500/30" />
            <p className="font-medium text-slate-600 dark:text-slate-300">Belum Ada Wishlist</p>
            <p className="text-sm mt-1">Catat barang-barang yang ingin Anda capai di masa depan.</p>
          </div>
        ) : (
          wishlists.map(item => (
            <div 
              key={item.id} 
              className={cn(
                "glass-card p-4 transition-all hover:shadow-md flex flex-col sm:flex-row gap-4 justify-between sm:items-center relative overflow-hidden",
                item.isAchieved && "opacity-60 grayscale-[0.3]"
              )}
            >
              {item.isAchieved && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              )}
              
              <div className="flex items-start sm:items-center gap-4">
                <button 
                  onClick={() => handleToggleAchieved(item.id!, item.isAchieved)}
                  className={cn(
                    "mt-1 sm:mt-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                    item.isAchieved 
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                      : "border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500"
                  )}
                >
                  <FiCheck size={16} />
                </button>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", getPriorityColor(item.priority))}>
                      Prioritas {getPriorityLabel(item.priority)}
                    </span>
                    {item.isAchieved && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md border bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-800">
                        Tercapai
                      </span>
                    )}
                  </div>
                  <h4 className={cn("font-bold text-lg", item.isAchieved ? "text-slate-500" : "text-slate-900 dark:text-white")}>
                    {item.title}
                  </h4>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-12 sm:pl-0 mt-2 sm:mt-0 border-t sm:border-none border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                <div className={cn(
                  "font-bold text-xl",
                  item.isAchieved ? "text-slate-400" : "text-slate-900 dark:text-slate-200"
                )}>
                  Rp {item.price.toLocaleString('id-ID')}
                </div>
                <button 
                  onClick={() => handleDelete(item.id!)}
                  className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
