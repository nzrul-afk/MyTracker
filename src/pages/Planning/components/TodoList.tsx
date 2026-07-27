import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { FiPlus, FiTrash2, FiCheck, FiFlag, FiTag, FiPlay } from 'react-icons/fi';
import { cn, getLocalISODate } from '../../../lib/utils';
import { usePomodoro } from '../../../context/PomodoroContext';

export function TodoList() {
  const todos = useLiveQuery(() => db.todos.orderBy('dueDate').toArray()) || [];
  const { startTask } = usePomodoro();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Pribadi');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await db.todos.add({
      title: newTaskTitle,
      category: newTaskCategory,
      status: 'pending',
      priority: newTaskPriority,
      dueDate: getLocalISODate(), // Use local ISO date
      synced: false,
      updatedAt: Date.now()
    });

    setNewTaskTitle('');
  };

  const toggleTodoStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await db.todos.update(id, {
      status: newStatus,
      synced: false,
      updatedAt: Date.now()
    });
  };

  const deleteTodo = async (id: number) => {
    if (confirm('Hapus tugas ini?')) {
      await db.todos.delete(id);
    }
  };

  const pendingTodos = todos.filter(t => t.status !== 'completed');
  const completedTodos = todos.filter(t => t.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'medium': return 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'low': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default: return 'border-slate-300';
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Add New Todo Form */}
      <form onSubmit={handleAddTodo} className="glass-card p-5 border border-indigo-100 dark:border-indigo-500/20 shadow-md flex flex-col gap-4 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>

        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Apa yang perlu Anda selesaikan?" 
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-xl font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 px-0"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <FiTag className="text-slate-400" size={14} />
              <select 
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="text-sm font-medium bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 p-0 focus:ring-0 cursor-pointer"
              >
                <option>Pribadi</option>
                <option>Kuliah</option>
                <option>Organisasi</option>
                <option>Pekerjaan</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <FiFlag className="text-slate-400" size={14} />
              <select 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="text-sm font-medium bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 p-0 focus:ring-0 cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95 w-full sm:w-auto justify-center"
          >
            <FiPlus size={18} /> Tambah
          </button>
        </div>
      </form>

      {/* Todo List */}
      <div className="flex flex-col gap-6">
        {/* Pending */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Tugas Aktif 
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded-full">
              {pendingTodos.length}
            </span>
          </h3>
          
          {pendingTodos.length === 0 ? (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <FiCheck className="text-slate-300 dark:text-slate-600" size={32} />
              </div>
              <p className="font-bold text-slate-600 dark:text-slate-300">Semua tugas sudah selesai!</p>
              <p className="text-sm text-slate-400 mt-1">Anda bisa bersantai sekarang.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={cn(
                    "glass-card p-4 sm:p-5 flex items-center justify-between group transition-all border-l-4 hover:shadow-md",
                    todo.priority === 'high' ? "border-l-rose-500" : todo.priority === 'medium' ? "border-l-amber-500" : "border-l-emerald-500"
                  )}
                >
                  <div className="flex items-center gap-4 sm:gap-5 flex-1 overflow-hidden">
                    {/* Custom Checkbox */}
                    <div className="relative pt-0.5 shrink-0">
                      <input 
                        type="checkbox" 
                        checked={false}
                        onChange={() => toggleTodoStatus(todo.id!, todo.status)}
                        className="peer sr-only"
                        id={`todo-${todo.id}`}
                      />
                      <label 
                        htmlFor={`todo-${todo.id}`}
                        className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 cursor-pointer transition-all"
                      >
                        <FiCheck className="text-white opacity-0 peer-checked:opacity-100" size={14} />
                      </label>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-lg text-slate-900 dark:text-white truncate">{todo.title}</span>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold mt-1.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {todo.category}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md uppercase tracking-wider border",
                          getPriorityColor(todo.priority)
                        )}>
                          {todo.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-2 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 gap-1">
                    <button 
                      onClick={() => startTask(todo)}
                      className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm flex items-center gap-2"
                      title="Mulai Fokus"
                    >
                      <FiPlay size={16} className="fill-current" />
                      <span className="text-xs font-bold hidden md:block">Fokus</span>
                    </button>
                    <button 
                      onClick={() => deleteTodo(todo.id!)} 
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        {completedTodos.length > 0 && (
          <div className="flex flex-col gap-3 mt-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Selesai 
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full">
                {completedTodos.length}
              </span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {completedTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className="glass-card p-4 flex items-center justify-between group transition-all opacity-70 hover:opacity-100"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="relative pt-0.5 shrink-0">
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => toggleTodoStatus(todo.id!, todo.status)}
                        className="peer sr-only"
                        id={`todo-completed-${todo.id}`}
                      />
                      <label 
                        htmlFor={`todo-completed-${todo.id}`}
                        className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500 cursor-pointer transition-all"
                      >
                        <FiCheck className="text-white" size={14} />
                      </label>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-slate-500 line-through truncate">{todo.title}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteTodo(todo.id!)} 
                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all ml-2"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
