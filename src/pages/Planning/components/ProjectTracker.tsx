import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SubTask, type Project } from '../../../lib/db';
import { FiPlus, FiTrash2, FiCheck, FiX, FiFolder, FiChevronDown, FiChevronUp, FiClock, FiAlertCircle } from 'react-icons/fi';
import { cn, getLocalISODate } from '../../../lib/utils';

export function ProjectTracker() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [subtasksInput, setSubtasksInput] = useState<{ id: string; title: string }[]>([
    { id: Date.now().toString(), title: '' }
  ]);

  const projects = useLiveQuery(() => {
    if (!db.projects) return [];
    return db.projects.orderBy('deadline').toArray();
  }) || [];

  const handleOpenForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setSubtasksInput([{ id: Date.now().toString(), title: '' }]);
    setIsFormOpen(true);
  };

  const handleAddSubtaskInput = () => {
    setSubtasksInput([...subtasksInput, { id: Date.now().toString(), title: '' }]);
  };

  const handleUpdateSubtaskInput = (id: string, value: string) => {
    setSubtasksInput(subtasksInput.map(s => s.id === id ? { ...s, title: value } : s));
  };

  const handleRemoveSubtaskInput = (id: string) => {
    setSubtasksInput(subtasksInput.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;
    
    // Filter out empty subtasks
    const validSubtasks: SubTask[] = subtasksInput
      .filter(s => s.title.trim() !== '')
      .map(s => ({
        id: s.id,
        title: s.title,
        isCompleted: false
      }));

    if (validSubtasks.length === 0) {
      alert("Masukkan minimal 1 sub-tugas!");
      return;
    }
    
    await db.projects.add({
      title,
      description,
      deadline: getLocalISODate(new Date(deadline)),
      subtasks: validSubtasks,
      status: 'active',
      synced: false,
      updatedAt: Date.now()
    });

    setIsFormOpen(false);
  };

  const handleToggleSubtask = async (project: Project, subtaskId: string) => {
    const updatedSubtasks = project.subtasks.map(st => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    const allCompleted = updatedSubtasks.every(st => st.isCompleted);

    await db.projects.update(project.id!, {
      subtasks: updatedSubtasks,
      status: allCompleted ? 'completed' : 'active',
      synced: false,
      updatedAt: Date.now()
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini secara permanen?')) {
      await db.projects.delete(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  const isOverdue = (date: string, status: string) => {
    if (status === 'completed') return false;
    return date < getLocalISODate(new Date());
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Form or Add Button */}
      {!isFormOpen ? (
        <button 
          onClick={handleOpenForm}
          className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-500/20"
        >
          <FiPlus size={20} />
          Buat Proyek Baru
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
            <FiFolder /> Proyek Baru
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Proyek / Tugas Besar</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Skripsi Bab 1-3"
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi (Opsional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan kecil mengenai proyek ini..."
                rows={2}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deadline (Tenggat Waktu)</label>
              <input 
                type="date" 
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
                Rincian Sub-Tugas (Langkah-langkah)
              </label>
              
              {subtasksInput.map((st, index) => (
                <div key={st.id} className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <input 
                    type="text" 
                    required={index === 0} // Only first is strictly required by HTML
                    value={st.title}
                    onChange={(e) => handleUpdateSubtaskInput(st.id, e.target.value)}
                    placeholder="Contoh: Cari referensi jurnal..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  {subtasksInput.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveSubtaskInput(st.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button"
                onClick={handleAddSubtaskInput}
                className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline self-start"
              >
                <FiPlus size={16} /> Tambah Langkah Lain
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium text-white transition-colors bg-indigo-500 hover:bg-indigo-600 w-full sm:w-auto"
            >
              Simpan Proyek
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        {projects.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center">
            <FiFolder size={48} className="mb-4 text-indigo-500/30" />
            <p className="font-medium text-slate-600 dark:text-slate-300">Belum Ada Proyek Aktif</p>
            <p className="text-sm mt-1">Pecah tugas besar Anda menjadi langkah-langkah kecil di sini.</p>
          </div>
        ) : (
          projects.map(project => {
            const completedCount = project.subtasks.filter(st => st.isCompleted).length;
            const totalCount = project.subtasks.length;
            const progressPercent = Math.round((completedCount / totalCount) * 100);
            const isCompleted = project.status === 'completed';
            const overdue = isOverdue(project.deadline, project.status);
            const isExpanded = expandedProjectId === project.id;

            return (
              <div 
                key={project.id} 
                className={cn(
                  "glass-card transition-all overflow-hidden border-l-4",
                  isCompleted ? "border-emerald-500 opacity-70" : (overdue ? "border-rose-500" : "border-indigo-500"),
                  isExpanded ? "shadow-md" : ""
                )}
              >
                {/* Header Section (Clickable) */}
                <div 
                  onClick={() => toggleExpand(project.id!)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={cn("font-bold text-lg", isCompleted ? "line-through text-slate-500" : "text-slate-900 dark:text-white")}>
                          {project.title}
                        </h4>
                        {isCompleted && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                            Selesai
                          </span>
                        )}
                        {overdue && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 flex items-center gap-1">
                            <FiAlertCircle size={12} /> Overdue
                          </span>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <FiClock size={14} className={overdue ? "text-rose-500" : ""} /> 
                          {new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                          <FiCheck size={14} /> 
                          {completedCount} / {totalCount} Tugas
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {progressPercent}%
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isCompleted ? "bg-emerald-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Subtasks Section */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Daftar Sub-Tugas:</h5>
                    
                    <div className="flex flex-col gap-2">
                      {project.subtasks.map((st) => (
                        <label key={st.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm">
                          <div className="pt-0.5 relative">
                            <input 
                              type="checkbox" 
                              checked={st.isCompleted}
                              onChange={() => handleToggleSubtask(project, st.id)}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center transition-colors">
                              <FiCheck className="text-white opacity-0 peer-checked:opacity-100" size={14} />
                            </div>
                          </div>
                          <span className={cn(
                            "text-sm font-medium transition-all select-none",
                            st.isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
                          )}>
                            {st.title}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                      <button 
                        onClick={() => handleDelete(project.id!)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={16} />
                        Hapus Proyek
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
