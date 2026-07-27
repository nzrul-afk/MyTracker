import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  FiHome, 
  FiDollarSign, 
  FiCheckSquare, 
  FiCalendar, 
  FiFileText, 
  FiX 
} from 'react-icons/fi';

const menus = [
  { path: '/', name: 'Dashboard', icon: FiHome },
  { path: '/finance', name: 'Keuangan', icon: FiDollarSign },
  { path: '/planning', name: 'Produktivitas', icon: FiCheckSquare },
  { path: '/schedule', name: 'Jadwal', icon: FiCalendar },
  { path: '/note', name: 'Catatan', icon: FiFileText },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 glass-card rounded-none transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MyTracker" className="w-8 h-8 object-contain drop-shadow-sm" />
            <h1 className="text-2xl font-bold text-primary-500 tracking-tight">MyTracker</h1>
          </div>
          <button onClick={onClose} className="p-2 lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path || (menu.path !== '/' && location.pathname.startsWith(menu.path));
            return (
              <Link
                key={menu.path}
                to={menu.path}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/30" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <menu.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                {menu.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
