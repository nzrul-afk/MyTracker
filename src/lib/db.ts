import Dexie, { type EntityTable } from 'dexie';

export interface Transaction {
  id?: number;
  type: 'income' | 'outcome';
  amount: number;
  category: string;
  date: string; // ISO date string
  note?: string;
  synced: boolean;
  updatedAt: number;
}

export interface Budget {
  id?: number;
  category: string;
  limit: number;
  month: string; // YYYY-MM
  synced: boolean;
  updatedAt: number;
}

export interface Todo {
  id?: number;
  title: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  synced: boolean;
  updatedAt: number;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  isPinned: boolean;
  category?: string;
  synced: boolean;
  updatedAt: number;
}

export interface Bill {
  id?: number;
  type: 'tagihan' | 'utang' | 'piutang';
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  synced: boolean;
  updatedAt: number;
}

export interface Wishlist {
  id?: number;
  title: string;
  price: number;
  priority: 'low' | 'medium' | 'high';
  isAchieved: boolean;
  synced: boolean;
  updatedAt: number;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Project {
  id?: number;
  title: string;
  description: string;
  deadline: string;
  subtasks: SubTask[];
  status: 'active' | 'completed';
  synced: boolean;
  updatedAt: number;
}

export interface Schedule {
  id?: number;
  title: string;
  type: 'kuliah' | 'kegiatan' | 'pribadi';
  date: string; // ISO string Date or Datetime
  isRecurring: boolean;
  reminderEnabled: boolean; // legacy
  reminderType?: 'none' | 'popup' | 'alarm';
  reminderSound?: string;
  synced: boolean;
  updatedAt: number;
}

export interface Routine {
  id?: number;
  title: string;
  type: 'kuliah' | 'kegiatan' | 'pribadi';
  dayOfWeek: number; // 0=Sunday, 1=Monday...
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  location?: string;
  reminderType?: 'none' | 'popup' | 'alarm';
  synced: boolean;
  updatedAt: number;
}

export interface Habit {
  id?: number;
  title: string;
  category: string;
  color: string;
  records: string[]; // Array of YYYY-MM-DD
  synced: boolean;
  updatedAt: number;
}

const db = new Dexie('MyTrackerDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  budgets: EntityTable<Budget, 'id'>;
  todos: EntityTable<Todo, 'id'>;
  notes: EntityTable<Note, 'id'>;
  bills: EntityTable<Bill, 'id'>;
  wishlists: EntityTable<Wishlist, 'id'>;
  projects: EntityTable<Project, 'id'>;
  schedules: EntityTable<Schedule, 'id'>;
  routines: EntityTable<Routine, 'id'>;
  habits: EntityTable<Habit, 'id'>;
};

// Schema definition V1
db.version(1).stores({
  transactions: '++id, type, date, category, synced',
  budgets: '++id, category, month, synced',
  todos: '++id, status, priority, dueDate, synced',
  notes: '++id, isPinned, title, synced'
});

// Schema definition V2 (Added bills)
db.version(2).stores({
  transactions: '++id, type, date, category, synced',
  budgets: '++id, category, month, synced',
  todos: '++id, status, priority, dueDate, synced',
  notes: '++id, isPinned, title, synced',
  bills: '++id, type, dueDate, isPaid, synced'
});

// Schema definition V3 (Added wishlists)
db.version(3).stores({
  transactions: '++id, type, date, category, synced',
  budgets: '++id, category, month, synced',
  todos: '++id, status, priority, dueDate, synced',
  notes: '++id, isPinned, title, synced',
  bills: '++id, type, dueDate, isPaid, synced',
  wishlists: '++id, priority, isAchieved, synced'
});

// Schema definition V4 (Added projects)
db.version(4).stores({
  transactions: '++id, type, date, category, synced',
  budgets: '++id, category, month, synced',
  todos: '++id, status, priority, dueDate, synced',
  notes: '++id, isPinned, title, synced',
  bills: '++id, type, dueDate, isPaid, synced',
  wishlists: '++id, priority, isAchieved, synced',
  projects: '++id, status, deadline, synced'
});

// Schema definition V5 (Added schedules)
db.version(5).stores({
  transactions: '++id, type, date, category, synced',
  budgets: '++id, category, month, synced',
  todos: '++id, status, priority, dueDate, synced',
  notes: '++id, isPinned, title, synced',
  bills: '++id, type, dueDate, isPaid, synced',
  wishlists: '++id, priority, isAchieved, synced',
  projects: '++id, status, deadline, synced',
  schedules: '++id, date, type, synced'
});

// Schema definition V6 (Added routines)
db.version(6).stores({
  transactions: '++id, type, date, category, synced',
  budgets: '++id, category, month, synced',
  todos: '++id, status, priority, dueDate, synced',
  notes: '++id, isPinned, title, synced',
  bills: '++id, type, dueDate, isPaid, synced',
  wishlists: '++id, priority, isAchieved, synced',
  projects: '++id, status, deadline, synced',
  schedules: '++id, date, type, synced',
  routines: '++id, dayOfWeek, type, synced'
});

// Schema definition V7 (Added habits)
db.version(7).stores({
  transactions: '++id, type, date, category, synced',
  budgets: '++id, category, month, synced',
  todos: '++id, status, priority, dueDate, synced',
  notes: '++id, isPinned, title, synced',
  bills: '++id, type, dueDate, isPaid, synced',
  wishlists: '++id, priority, isAchieved, synced',
  projects: '++id, status, deadline, synced',
  schedules: '++id, date, type, synced',
  routines: '++id, dayOfWeek, type, synced',
  habits: '++id, title, category, synced'
});

export { db };
