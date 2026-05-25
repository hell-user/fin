import React from 'react';
import { 
  UserProfile, 
  Income, 
  OnlineTransaction, 
  OfflineCashExpense, 
  Budget, 
  SavingsGoal, 
  Category 
} from '../types';
import { renderFinanceIcon, TAILWIND_COLORS } from './IconMap';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Tag, 
  Smartphone, 
  CreditCard, 
  Landmark, 
  AlertCircle, 
  Eye, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardOverviewProps {
  user: UserProfile | null;
  incomes: Income[];
  onlineTxs: OnlineTransaction[];
  offlineExpenses: OfflineCashExpense[];
  budgets: Budget[];
  goals: SavingsGoal[];
  categories: Category[];
  onChangeTab: (tab: string) => void;
}

export default function DashboardOverview({
  user,
  incomes,
  onlineTxs,
  offlineExpenses,
  budgets,
  goals,
  categories,
  onChangeTab
}: DashboardOverviewProps) {
  const currentMonth = '2026-05';

  // Filters for current month
  const activeIncomes = incomes.filter(i => i.date.startsWith(currentMonth));
  const activeOnline = onlineTxs.filter(t => t.dateTime.startsWith(currentMonth));
  const activeOffline = offlineExpenses.filter(t => t.date.startsWith(currentMonth));

  // Calculations
  const totalIncomeSum = activeIncomes.reduce((su, x) => su + x.amount, 0);
  const totalOnlineSpent = activeOnline.reduce((su, x) => su + x.amount, 0);
  const totalOfflineSpent = activeOffline.reduce((su, x) => su + x.amount, 0);
  const totalExpenseSum = totalOnlineSpent + totalOfflineSpent;

  // Global historical total across all records (Balance)
  const totalAllIncomes = incomes.reduce((su, x) => su + x.amount, 0);
  const totalAllExpenses = 
    onlineTxs.reduce((su, x) => su + x.amount, 0) + 
    offlineExpenses.reduce((su, x) => su + x.amount, 0);
  const totalBalance = Math.max(0, totalAllIncomes - totalAllExpenses);

  const totalSavedSoFar = goals.reduce((su, g) => su + g.currentAmount, 0);

  // Active budget limit
  const activeBudget = budgets.find(b => b.month === currentMonth) || { limitAmount: 3000 };
  const budgetRatio = Math.min(100, (totalExpenseSum / activeBudget.limitAmount) * 100);

  // Compile unified recent transactions (combine online & offline, sort by time)
  interface UnifiedTx {
    id: string;
    type: 'online' | 'offline';
    amount: number;
    category: string;
    title: string;
    dateStr: string;
    details: string;
  }

  const listOnline: UnifiedTx[] = onlineTxs.map(t => ({
    id: t.id,
    type: 'online',
    amount: t.amount,
    category: t.category,
    title: t.merchantName,
    dateStr: t.dateTime,
    details: t.paymentMethod
  }));

  const listOffline: UnifiedTx[] = offlineExpenses.map(t => ({
    id: t.id,
    type: 'offline',
    amount: t.amount,
    category: t.category,
    title: t.placeName,
    dateStr: `${t.date}T12:00:00Z`, // Synthesize time for sort
    details: 'Cash Spending'
  }));

  const unifiedRecent: UnifiedTx[] = [...listOnline, ...listOffline]
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr))
    .slice(0, 5);

  return (
    <div id="dashboard-overview" className="space-y-6 animate-fade-in">
      
      {/* Welcome banner segment */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
        <div className="space-y-1">
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-1 uppercase">
            <ShieldCheck className="w-4 h-4" /> SECURE PHYSICAL SANDBOX ACTIVE
          </div>
          <h1 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
            Hello, {user ? user.name : 'Financial Ledger Guest'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current financial period: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentMonth}</span> • Tracking both electronic UPI/Cards and Cash.
          </p>
        </div>

        <button
          onClick={() => onChangeTab('gemini')}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Run Gemini AI Insight Audit
        </button>
      </div>

      {/* Primary Financial widgets bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Available Balance */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Net Floating Balance</span>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400">Aggregated floating assets across records</p>
          </div>
        </div>

        {/* Current period income */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Incomes this Month</span>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +${totalIncomeSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400">{activeIncomes.length} earnings entries logged</p>
          </div>
        </div>

        {/* Current period expenditures */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Spends this Month</span>
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-mono font-bold text-rose-500">
              -${totalExpenseSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400">{activeOnline.length + activeOffline.length} items logged this month</p>
          </div>
        </div>

        {/* Total Dedicated Goals reserves */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Savings Lockbox</span>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-mono font-bold text-blue-500">
              ${totalSavedSoFar.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-slate-400">Committed savings goals milestone</p>
          </div>
        </div>

      </div>

      {/* Secondary layouts - budgets progress and Online vs Offline splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core summary progress meters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-widest">Active Budget Status</span>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Month Aggregate ({budgetRatio.toFixed(0)}%)</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    ${totalExpenseSum.toFixed(0)} / ${activeBudget.limitAmount}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${budgetRatio > 100 ? 'bg-red-500' : budgetRatio > 85 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min(100, budgetRatio)}%` }}
                  ></div>
                </div>
              </div>

              {/* Warnings panels */}
              {budgetRatio >= 100 ? (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900 flex gap-2 items-start text-xs text-rose-700 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Your cumulative spending of ${totalExpenseSum.toFixed(2)} has violated your overall Monthly target cap! Run Gemini AI to audit leaks.</span>
                </div>
              ) : budgetRatio >= 85 ? (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/25 rounded-xl border border-amber-100 dark:border-amber-900 flex gap-2 items-start text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Careful! You have consumed over 85% of your total budget envelope for {currentMonth}.</span>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/15 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex gap-2 items-start text-xs text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Excellent! You are within your specified monthly spending limits. Outstanding consistency.</span>
                </div>
              )}
            </div>
          </div>

          {/* Online vs Offline Splitting card */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-widest">Digital vs Cash split</span>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => onChangeTab('online')}
                className="p-3 bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/30 text-center cursor-pointer transition-colors"
              >
                <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Online transactions</div>
                <div className="text-md font-mono font-bold text-slate-800 dark:text-slate-100">${totalOnlineSpent.toLocaleString()}</div>
                <div className="text-[9px] text-slate-450 mt-1">{totalExpenseSum > 0 ? ((totalOnlineSpent/totalExpenseSum)*100).toFixed(0) : 0}% ratio</div>
              </div>

              <div 
                onClick={() => onChangeTab('offline')}
                className="p-3 bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-950/10 rounded-xl border border-amber-100/30 text-center cursor-pointer transition-colors"
              >
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-1">Offline Cash</div>
                <div className="text-md font-mono font-bold text-slate-800 dark:text-slate-100">${totalOfflineSpent.toLocaleString()}</div>
                <div className="text-[9px] text-slate-450 mt-1">{totalExpenseSum > 0 ? ((totalOfflineSpent/totalExpenseSum)*100).toFixed(0) : 0}% ratio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-widest">Recent Transactions Log</span>
            <button 
              onClick={() => onChangeTab('online')} 
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Analyze All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-900">
            {unifiedRecent.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent entries reported.</p>
            ) : (
              unifiedRecent.map((tx) => {
                const catInfo = categories.find(c => c.name === tx.category);
                const props = catInfo ? (TAILWIND_COLORS[catInfo.color] || TAILWIND_COLORS.slate) : TAILWIND_COLORS.slate;
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-2.5 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 rounded-lg px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center text-white shrink-0 ${props.bg}`}>
                        {renderFinanceIcon(catInfo?.iconName || 'HelpCircle', 'w-4 h-4')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.title}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{new Date(tx.dateStr).toLocaleDateString()}</span>
                          <span className="text-slate-300 dark:text-slate-705">•</span>
                          <span className="uppercase">{tx.details}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`py-0.5 px-1.5 rounded text-[9px] font-sans font-medium uppercase ${props.bgSoft} ${props.text}`}>
                        {tx.category}
                      </span>
                      <span className="font-mono text-xs font-bold pr-1 text-rose-500 shrink-0">
                        -${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
