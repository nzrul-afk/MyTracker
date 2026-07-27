import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Note } from '../../lib/db';
import { FiPlus, FiStar, FiTrash2, FiSearch, FiX, FiTag } from 'react-icons/fi';
import { cn } from '../../lib/utils';

export function Note() {
  const notes = useLiveQuery(async () => {
    if (!db.notes) return [];
    const allNotes = await db.notes.toArray();
    return allNotes.sort((a, b) => b.updatedAt - a.updatedAt);
  }) || [];
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  // States for writing new note or editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('Pribadi');
  const [isPinned, setIsPinned] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  const categories = ['Pribadi', 'Kuliah', 'Ide', 'Tugas', 'Lainnya'];

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    if (editingId) {
      await db.notes.update(editingId, {
        title, content, category, isPinned, updatedAt: Date.now(), synced: false
      });
    } else {
      await db.notes.add({
        title, content, category, isPinned, updatedAt: Date.now(), synced: false
      });
    }
    
    // Reset
    setIsWriting(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('Pribadi');
    setIsPinned(false);
  };

  const editNote = (note: Note) => {
    setEditingId(note.id!);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'Pribadi');
    setIsPinned(note.isPinned);
    setIsWriting(true);
  };

  const deleteNote = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Hapus catatan ini?')) {
      await db.notes.delete(id);
    }
  };

  const togglePin = async (e: React.MouseEvent, id: number, currentPinned: boolean) => {
    e.stopPropagation();
    await db.notes.update(id, { isPinned: !currentPinned, updatedAt: Date.now(), synced: false });
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory ? n.category === filterCategory : true;
      return matchSearch && matchCategory;
    });
  }, [notes, search, filterCategory]);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Pribadi': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
      case 'Kuliah': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Ide': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'Tugas': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  if (isWriting) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)] sm:min-h-full gap-4 max-w-3xl mx-auto w-full relative animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between glass-card p-4 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => { setIsWriting(false); setEditingId(null); setTitle(''); setContent(''); setCategory('Pribadi'); setIsPinned(false); }}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-500 font-medium transition-colors"
          >
            <FiX size={20} /> Batal
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className={cn("p-2 rounded-lg transition-colors border", isPinned ? "border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")}
            >
              <FiStar size={20} className={isPinned ? "fill-amber-500" : ""} />
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold transition-colors shadow-md shadow-indigo-500/20"
            >
              Simpan
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 mt-2">
          {/* Category Selector */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                  category === c 
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <input 
            type="text" 
            placeholder="Judul Catatan..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-black bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 w-full px-1"
          />
          <textarea 
            placeholder="Mulai menulis ide dan catatan Anda di sini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[300px] resize-none text-lg bg-transparent border-none outline-none focus:ring-0 text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600 leading-relaxed px-1"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Note</h1>
          <p className="text-slate-500 dark:text-slate-400">Catat ide, tugas, dan informasi penting.</p>
        </div>
        
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari catatan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterCategory(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
            filterCategory === null 
              ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
              : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
          )}
        >
          Semua
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1",
              filterCategory === c 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
            )}
          >
            <FiTag size={10} /> {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiStar className="fill-slate-400" /> Dipin
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => editNote(note)}
                  className="glass-card p-5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all group flex flex-col h-56 relative border-t-4 border-t-amber-400"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", getCategoryColor(note.category || 'Pribadi'))}>
                      {note.category || 'Pribadi'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={(e) => togglePin(e, note.id!, note.isPinned)} className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-1 rounded">
                        <FiStar size={14} className="fill-amber-500" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 mb-2 pr-2">{note.title || 'Tanpa Judul'}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 flex-1 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(note.updatedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</p>
                    <button onClick={(e) => deleteNote(e, note.id!)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Catatan Lainnya</h3>
          {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 glass-card border border-dashed border-slate-200 dark:border-slate-700">
              <FiTag size={32} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">Belum ada catatan di kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unpinnedNotes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => editNote(note)}
                  className="glass-card p-5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all group flex flex-col h-56 relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", getCategoryColor(note.category || 'Pribadi'))}>
                      {note.category || 'Pribadi'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={(e) => togglePin(e, note.id!, note.isPinned)} className="text-slate-300 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiStar size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 mb-2 pr-2">{note.title || 'Tanpa Judul'}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 flex-1 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(note.updatedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</p>
                    <button onClick={(e) => deleteNote(e, note.id!)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50">
        <button 
          onClick={() => setIsWriting(true)}
          className="flex items-center justify-center w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/40 transition-transform hover:scale-105 active:scale-95"
        >
          <FiPlus size={28} />
        </button>
      </div>
    </div>
  );
}
