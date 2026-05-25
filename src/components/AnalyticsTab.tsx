import React, { useState } from 'react';
import { OnlineTransaction, OfflineCashExpense, Income, Category } from '../types';
import { renderFinanceIcon, TAILWIND_COLORS } from './IconMap';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Calendar, BarChart2, PieChart as PieIcon, ArrowRightLeft, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface AnalyticsTabProps {
  incomes: Income[];
  onlineTxs: OnlineTransaction[];
  offlineExpenses: OfflineCashExpense[];
  categories: Category[];
}

const PIE_COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#4f46e5', '#a855f7', '#f43f5e', '#f59e0b', '#f97316', '#10b981', '#64748b'];

export default function AnalyticsTab({ incomes, onlineTxs, offlineExpenses, categories }: AnalyticsTabProps) {
  const [reportSlice, setReportSlice] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const currentMonthValue = '2026-05';
  const previousMonthValue = '2026-04';

  // 1. Calculate general stats
  const filterByTimeSlice = <T extends { date?: string; dateTime?: string }>(list: T[]): T[] => {
    return list.filter(item => {
      const dateStr = item.date || item.dateTime?.split('T')[0] || '';
      if (!dateStr) return false;
      
      if (reportSlice === 'weekly') {
        // Last 7 days from now (May 25, 2026)
        return dateStr >= '2026-05-18' && dateStr <= '2026-05-25';
      } else if (reportSlice === 'monthly') {
        // Active month May 2026
        return dateStr.startsWith(currentMonthValue);
      } else {
        // Whole year 2026
        return dateStr.startsWith('2026');
      }
    });
  };

  const sliceIncomes = filterByTimeSlice(incomes);
  const sliceOnline = filterByTimeSlice(onlineTxs);
  const sliceOffline = filterByTimeSlice(offlineExpenses);

  const totalIncomeSum = sliceIncomes.reduce((acc, i) => acc + i.amount, 0);
  const totalOnlineSpent = sliceOnline.reduce((acc, x) => acc + x.amount, 0);
  const totalOfflineSpent = sliceOffline.reduce((acc, y) => acc + y.amount, 0);
  const totalExpenseSum = totalOnlineSpent + totalOfflineSpent;
  const netSavings = Math.max(0, totalIncomeSum - totalExpenseSum);

  // 2. Category Distribution
  const categoryChartMap: Record<string, number> = {};
  categories.forEach(c => {
    categoryChartMap[c.name] = 0;
  });

  sliceOnline.forEach(ot => {
    categoryChartMap[ot.category] = (categoryChartMap[ot.category] || 0) + ot.amount;
  });
  sliceOffline.forEach(cl => {
    categoryChartMap[cl.category] = (categoryChartMap[cl.category] || 0) + cl.amount;
  });

  const categoryDistributionData = Object.keys(categoryChartMap)
    .map(name => ({ name, value: parseFloat(categoryChartMap[name].toFixed(2)) }))
    .filter(item => item.value > 0);

  // 3. Online vs Offline digital cash comparison
  const digitalVsCashData = [
    { name: 'Online Digital', value: parseFloat(totalOnlineSpent.toFixed(2)), color: '#6366f1' },
    { name: 'Offline Cash', value: parseFloat(totalOfflineSpent.toFixed(2)), color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // 4. Monthly comparative data (current vs prev)
  const getMonthTotalIn = (m: string) => incomes.filter(i => i.date.startsWith(m)).reduce((s, x) => s + x.amount, 0);
  const getMonthTotalOut = (m: string) => {
    const on = onlineTxs.filter(t => t.dateTime.startsWith(m)).reduce((s, x) => s + x.amount, 0);
    const off = offlineExpenses.filter(t => t.date.startsWith(m)).reduce((s, x) => s + x.amount, 0);
    return on + off;
  };

  const currentIn = getMonthTotalIn(currentMonthValue);
  const currentOut = getMonthTotalOut(currentMonthValue);
  const prevIn = getMonthTotalIn(previousMonthValue);
  const prevOut = getMonthTotalOut(previousMonthValue);

  const monthlyTrendData = [
    { name: 'April 2026', Income: prevIn, Expense: prevOut },
    { name: 'May 2026', Income: currentIn, Expense: currentOut }
  ];

  const highestSpendingCategory = categoryDistributionData.length > 0
    ? [...categoryDistributionData].sort((a, b) => b.value - a.value)[0]
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Time Slice Selection Dashboard */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            Financial Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Deep comparative evaluation across electronic online card payments, cash, savings goals, and dynamic ratios.
          </p>
        </div>

        {/* Weekly Month Year filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-150/20 max-w-xs cursor-pointer">
          <button
            onClick={() => setReportSlice('weekly')}
            className={`flex-1 py-1 px-4 text-xs font-bold rounded-lg transition-colors capitalize ${reportSlice === 'weekly' ? 'bg-white dark:bg-slate-850 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setReportSlice('monthly')}
            className={`flex-1 py-1 px-4 text-xs font-bold rounded-lg transition-colors capitalize ${reportSlice === 'monthly' ? 'bg-white dark:bg-slate-850 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setReportSlice('yearly')}
            className={`flex-1 py-1 px-4 text-xs font-bold rounded-lg transition-colors capitalize ${reportSlice === 'yearly' ? 'bg-white dark:bg-slate-850 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Slices metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900/60 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Income ({reportSlice})</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">${totalIncomeSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900/60 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Expenses ({reportSlice})</div>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">${totalExpenseSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900/60 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Highest Category</div>
            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {highestSpendingCategory ? `${highestSpendingCategory.name} ($${highestSpendingCategory.value})` : 'No data recorded'}
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spend distribution - Category Pie */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div>
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider">Category Expenses Breakdown</span>
            <span className="text-[11px] text-slate-400">Proportional outlays distribution segmented by active categories.</span>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            {categoryDistributionData.length === 0 ? (
              <p className="text-xs text-slate-400">No category expenditures tracked in this time range.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Digital vs Cash comparison */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div>
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider">Online Digital vs Offline Cash Ratio</span>
            <span className="text-[11px] text-slate-400">Evaluation between card/UPI velocity and cash usage.</span>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            {digitalVsCashData.length === 0 ? (
              <p className="text-xs text-slate-400">No transactions recorded inside chosen timeline slice.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={digitalVsCashData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {digitalVsCashData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Income vs Spend comparative bar */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4 lg:col-span-2">
          <div>
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider">Historical Spend vs Income (April - May)</span>
            <span className="text-[11px] text-slate-400">Observe cash velocity, earnings consistency, and net savings reserves over time.</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} fontStyle="bold" />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip formatter={(value) => [`$${value}`, '']} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
