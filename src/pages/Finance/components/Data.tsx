import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiPieChart, FiBarChart2, FiAlertCircle } from 'react-icons/fi';
import { cn } from '../../../lib/utils';

export function Data() {
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  const today = new Date();
  
  // 1. Month-over-month calculation (last 6 months)
  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    };
  }).reverse();

  const trendData = last6Months.map(m => {
    const monthTx = transactions.filter(t => t.date.startsWith(m.monthKey));
    return {
      name: m.label,
      Pemasukan: monthTx.filter(t => t.type === 'income').reduce((a, c) => a + c.amount, 0),
      Pengeluaran: monthTx.filter(t => t.type === 'outcome').reduce((a, c) => a + c.amount, 0),
    };
  });

  // 2. Current vs Previous Month calculation
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentOutcomes = transactions.filter(t => t.type === 'outcome' && t.date.startsWith(currentMonthKey));
  const prevOutcomes = transactions.filter(t => t.type === 'outcome' && t.date.startsWith(prevMonthKey));

  const currentTotalOutcome = currentOutcomes.reduce((a, c) => a + c.amount, 0);
  const prevTotalOutcome = prevOutcomes.reduce((a, c) => a + c.amount, 0);
  
  const outcomeDiff = currentTotalOutcome - prevTotalOutcome;
  const outcomePercent = prevTotalOutcome > 0 ? (outcomeDiff / prevTotalOutcome) * 100 : (currentTotalOutcome > 0 ? 100 : 0);

  // 3. Category Distribution (Pie Chart)
  const categoryMap = new Map<string, number>();
  currentOutcomes.forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });
  
  const pieData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);
    
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#64748b'];

  // 4. Insight Generation
  const prevCategoryMap = new Map<string, number>();
  prevOutcomes.forEach(t => prevCategoryMap.set(t.category, (prevCategoryMap.get(t.category) || 0) + t.amount));

  let topIncreaseCat = '';
  let topIncreaseVal = 0;
  categoryMap.forEach((val, cat) => {
    const prevVal = prevCategoryMap.get(cat) || 0;
    const diff = val - prevVal;
    if (diff > topIncreaseVal && prevVal > 0) {
      topIncreaseVal = diff;
      topIncreaseCat = cat;
    }
  });
  
  const topIncreasePercent = topIncreaseCat && prevCategoryMap.get(topIncreaseCat) 
    ? (topIncreaseVal / prevCategoryMap.get(topIncreaseCat)!) * 100 
    : 0;

  // Custom tooltip for Recharts to show IDR formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: Rp {entry.value.toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      
      {/* INSIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Insight 1: Month over Month comparison */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FiActivity size={80} className="-mr-4 -mt-4" />
          </div>
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Tren Pengeluaran Bulan Ini</h4>
          <div className="flex items-end gap-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Rp {currentTotalOutcome.toLocaleString('id-ID')}
            </h3>
          </div>
          
          <div className="mt-4 flex items-start gap-2">
            <div className={cn(
              "p-1.5 rounded-md flex shrink-0 mt-0.5",
              outcomePercent > 0 ? "bg-rose-100 text-rose-600" : outcomePercent < 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
            )}>
              {outcomePercent > 0 ? <FiTrendingUp size={14}/> : <FiTrendingDown size={14}/>}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
              <span className="font-semibold">
                {Math.abs(outcomePercent).toFixed(1)}% {outcomePercent > 0 ? 'lebih tinggi' : 'lebih rendah'}
              </span> dari bulan lalu.
              {outcomePercent > 0 && " Hati-hati, kontrol pengeluaran Anda!"}
            </p>
          </div>
        </div>

        {/* Insight 2: Category Increase */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FiPieChart size={80} className="-mr-4 -mt-4" />
          </div>
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Peringatan Kategori</h4>
          {topIncreaseCat ? (
            <>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {topIncreaseCat} Naik Tajam!
              </h3>
              <div className="mt-4 flex items-start gap-2">
                <div className="p-1.5 rounded-md bg-amber-100 text-amber-600 flex shrink-0 mt-0.5">
                  <FiAlertCircle size={14}/>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                  Pengeluaran <span className="font-semibold">{topIncreaseCat}</span> naik <span className="font-semibold text-rose-500">{topIncreasePercent.toFixed(0)}%</span> (Naik Rp {topIncreaseVal.toLocaleString('id-ID')}) dibanding bulan sebelumnya.
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col justify-center text-center">
              <p className="text-sm text-slate-500 mt-2">Tidak ada lonjakan kategori yang signifikan bulan ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Pengeluaran Per Kategori */}
        <div className="glass-card p-5 flex flex-col h-[350px]">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-indigo-500" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Pengeluaran per Kategori (Bulan Ini)</h4>
          </div>
          
          <div className="flex-1 w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                Belum ada pengeluaran bulan ini.
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Tren 6 Bulan Terakhir */}
        <div className="glass-card p-5 flex flex-col h-[350px]">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-emerald-500" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Tren Cashflow (6 Bulan)</h4>
          </div>
          
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
