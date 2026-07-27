import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Sidebar only visible on desktop (lg:flex) */}
      <div className="hidden lg:block">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:p-8 lg:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
