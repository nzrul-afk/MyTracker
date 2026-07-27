import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  FiHome, 
  FiDollarSign, 
  FiCheckSquare, 
  FiCalendar, 
  FiFileText
} from 'react-icons/fi';

const menus = [
  { path: '/', name: 'Beranda', icon: FiHome },
  { path: '/finance', name: 'Keuangan', icon: FiDollarSign },
  { path: '/planning', name: 'Plan', icon: FiCheckSquare },
  { path: '/schedule', name: 'Jadwal', icon: FiCalendar },
  { path: '/note', name: 'Catatan', icon: FiFileText },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-10px_40px_rgb(0,0,0,0.05)]">
      <nav className="flex items-center justify-around px-2 py-2">
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path || (menu.path !== '/' && location.pathname.startsWith(menu.path));
          return (
            <Link
              key={menu.path}
              to={menu.path}
              className="relative flex flex-col items-center justify-center w-16 h-12 transition-all group"
            >
              <div className={cn(
                "flex items-center justify-center p-1.5 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 mb-1 scale-110" 
                  : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )}>
                <menu.icon size={isActive ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[9px] font-bold transition-all duration-300 absolute bottom-0 opacity-0 transform translate-y-2",
                isActive ? "opacity-100 translate-y-0 text-indigo-600 dark:text-indigo-400" : ""
              )}>
                {menu.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
