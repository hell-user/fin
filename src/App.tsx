import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Income, 
  OnlineTransaction, 
  OfflineCashExpense, 
  Budget, 
  SavingsGoal, 
  Category, 
  FinanceNotification 
} from './types';
import { LocalFinanceDB } from './lib/db';
import { renderFinanceIcon, TAILWIND_COLORS } from './components/IconMap';

// Core component tabs
import DashboardOverview from './components/DashboardOverview';
import IncomeTab from './components/IncomeTab';
import OnlineExpensesTab from './components/OnlineExpensesTab';
import OfflineCashExpensesTab from './components/OfflineCashExpensesTab';
import BudgetsTab from './components/BudgetsTab';
import AnalyticsTab from './components/AnalyticsTab';
import AIInsightsTab from './components/AIInsightsTab';
import RemindersTab from './components/RemindersTab';
import CategoryAdmin from './components/CategoryAdmin';
import IntegrationSchema from './components/IntegrationSchema';
import SessionControl from './components/SessionControl';

// Icons
import { 
  BarChart2, 
  Briefcase, 
  CreditCard, 
  Database, 
  FolderLock, 
  Bell, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Sparkles, 
  LogOut, 
  ArrowUpRight, 
  TrendingDown, 
  Target, 
  Download, 
  User, 
  Check, 
  Sliders,
  TrendingUp,
  FolderPlus
} from 'lucide-react';

export default function App() {
  // States
  const [activeTab, setActiveTabValue] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Financial States
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [onlineTxs, setOnlineTxs] = useState<OnlineTransaction[]>([]);
  const [offlineExpenses, setOfflineExpenses] = useState<OfflineCashExpense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);

  // Initialize theme and login session
  useEffect(() => {
    // Sync dark class on document element
    const storedTheme = localStorage.getItem('fin_theme');
    const prefersDark = storedTheme ? storedTheme === 'dark' : true; // Dark by default as requested in aesthetic theme
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    const loggedIn = LocalFinanceDB.getLoggedInUser();
    if (loggedIn) {
      setUser(loggedIn);
      LocalFinanceDB.seedInitialData(loggedIn.id);
      loadAllUserData(loggedIn.id);
    }
  }, []);

  const handleSetTab = (tab: string) => {
    setActiveTabValue(tab);
    setMobileMenuOpen(false);
  };

  const loadAllUserData = (userId: string) => {
    setIncomes(LocalFinanceDB.getIncomes(userId));
    setOnlineTxs(LocalFinanceDB.getOnlineTransactions(userId));
    setOfflineExpenses(LocalFinanceDB.getOfflineExpenses(userId));
    setBudgets(LocalFinanceDB.getBudgets(userId));
    setGoals(LocalFinanceDB.getSavingsGoals(userId));
    setCategories(LocalFinanceDB.getCategories(userId));
    setNotifications(LocalFinanceDB.getNotifications(userId));
  };

  const handleThemeToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('fin_theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
  };

  const handleUserUpdate = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      LocalFinanceDB.seedInitialData(newUser.id);
      loadAllUserData(newUser.id);
    } else {
      setIncomes([]);
      setOnlineTxs([]);
      setOfflineExpenses([]);
      setBudgets([]);
      setGoals([]);
      setCategories([]);
      setNotifications([]);
    }
  };

  const refreshData = () => {
    if (user) {
      loadAllUserData(user.id);
    }
  };

  const handleExportCSV = () => {
    if (!user) return;
    
    // Create combined data CSV matching column guidelines
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Amount,Category,Source/Merchant,Date,Payload Notes\n';

    incomes.forEach(i => {
      csvContent += `Income,${i.amount},N/A,${i.source.replace(/,/g, ' ')},${i.date},${(i.notes || '').replace(/,/g, ' ')}\n`;
    });

    onlineTxs.forEach(o => {
      csvContent += `Online Expense,${o.amount},${o.category},${o.merchantName.replace(/,/g, ' ')},${o.dateTime.split('T')[0]},${(o.notes || '').replace(/,/g, ' ')}\n`;
    });

    offlineExpenses.forEach(c => {
      csvContent += `Physical Cash Expense,${c.amount},${c.category},${c.placeName.replace(/,/g, ' ')},${c.date},${(c.notes || '').replace(/,/g, ' ')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledger_sheets_${user.name.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // List of sidebar navigation items
  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Sliders className="w-4 h-4" /> },
    { id: 'income', label: 'Income ledger', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'online', label: 'Online Transactions', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'offline', label: 'Offline Cash Spends', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'budgets', label: 'Budgets & Savings', icon: <Target className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics Reports', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'gemini', label: 'Gemini AI Insights', icon: <Sparkles className="w-4 h-4" />, highlight: true },
    { id: 'categories', label: 'Ledger Categories', icon: <FolderPlus className="w-4 h-4" /> },
    { id: 'reminders', label: 'Reminders & Alerts', icon: <Bell className="w-4 h-4" />, countBadge: true },
    { id: 'schema', label: 'Supabase SQL schema', icon: <Database className="w-4 h-4" /> },
    { id: 'auth', label: 'Authentication', icon: <User className="w-4 h-4" /> }
  ];

  const currentUnreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div id="finance-app-root" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Mobile Top Header Navigation Drawer */}
      <header className="lg:hidden h-14 bg-white dark:bg-slate-950 border-b border-slate-150/40 dark:border-slate-900 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-display font-semibold">
            F
          </div>
          <span className="font-display font-bold text-xs uppercase tracking-wider">FinWise Live</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleThemeToggle} 
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 dark:text-slate-350 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main responsive layouts container */}
      <div className="flex-1 flex relative">
        
        {/* Desktops drawer navigation sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-slate-150/45 dark:border-slate-900 bg-white dark:bg-slate-950 flex-col sticky top-0 h-screen shrink-0">
          <div className="p-5.5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-display font-black text-sm">
                F
              </div>
              <div>
                <span className="block font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white">FinWise</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">Core Sandbox v1.02</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {sidebarNavItems.map(item => {
              const active = activeTab === item.id;
              const hasUnread = item.countBadge && currentUnreadCount > 0;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSetTab(item.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group cursor-pointer ${
                    active ? (item.highlight ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white') 
                    : item.highlight ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={active ? '' : item.highlight ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {hasUnread && (
                    <span className="bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {currentUnreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile details at side footer */}
          {user && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</span>
                  <span className="block text-[10px] text-slate-400 truncate font-mono">{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => handleUserUpdate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                title="Logs out of Sandbox"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>

        {/* Mobile menu navigation Overlay panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 flex justify-end">
            <div className="w-4/5 max-w-sm bg-white dark:bg-slate-950 h-full p-6 flex flex-col animate-fade-in relative">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-display font-black text-sm">
                  F
                </div>
                <div>
                  <span className="block font-display font-bold text-sm text-slate-900 dark:text-white">FinWise</span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Secure Sandbox</span>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-2">
                {sidebarNavItems.map(item => {
                  const active = activeTab === item.id;
                  const hasUnread = item.countBadge && currentUnreadCount > 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSetTab(item.id)}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                        active ? (item.highlight ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white') 
                        : item.highlight ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-500 dark:text-slate-405 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="opacity-75">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>

                      {hasUnread && (
                        <span className="bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {currentUnreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-905 flex justify-between items-center text-xs text-slate-400">
                <span>Secure local sandbox offline.</span>
                <span className="font-mono">{user?.name || 'Guest'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main interactive window viewport panel */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Header Action shelf */}
          <header className="hidden lg:flex h-16 bg-white dark:bg-slate-950 border-b border-slate-150/40 dark:border-slate-900 px-8 items-center justify-between sticky top-0 z-30">
            <div className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">
              Active Dashboard Tab: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{activeTab.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center gap-4">
              {/* CSV Export Button */}
              {user && (
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 transition-colors border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
                  title="Export spreadsheet CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Spreading CSV</span>
                </button>
              )}

              {/* Theme toggle controls */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-950 dark:text-slate-350 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 cursor-pointer"
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-indigo-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
              </button>
            </div>
          </header>

          {/* Core dynamic viewport tabs content */}
          <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto pb-16">
            {!user && activeTab !== 'auth' ? (
              <div className="p-8 text-center max-w-lg mx-auto bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 mt-12 space-y-6 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <FolderLock className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-850 dark:text-slate-150">Sandbox Data Locked</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    Please log into your Google Account, simulate secure signup, or click to proceed as Guest to authorize private database RLS policies.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTabValue('auth')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointerSB"
                >
                  Configure Security Session
                </button>
              </div>
            ) : (
              (() => {
                switch(activeTab) {
                  case 'dashboard':
                    return (
                      <DashboardOverview 
                        user={user}
                        incomes={incomes}
                        onlineTxs={onlineTxs}
                        offlineExpenses={offlineExpenses}
                        budgets={budgets}
                        goals={goals}
                        categories={categories}
                        onChangeTab={handleSetTab}
                      />
                    );
                  case 'income':
                    return (
                      <IncomeTab 
                        userId={user?.id || ''} 
                        incomes={incomes} 
                        onRefresh={refreshData} 
                      />
                    );
                  case 'online':
                    return (
                      <OnlineExpensesTab 
                        userId={user?.id || ''} 
                        transactions={onlineTxs} 
                        categories={categories} 
                        onRefresh={refreshData} 
                      />
                    );
                  case 'offline':
                    return (
                      <OfflineCashExpensesTab 
                        userId={user?.id || ''} 
                        offlineExpenses={offlineExpenses} 
                        categories={categories} 
                        onRefresh={refreshData} 
                      />
                    );
                  case 'budgets':
                    return (
                      <BudgetsTab 
                        userId={user?.id || ''} 
                        budgets={budgets} 
                        goals={goals} 
                        categories={categories} 
                        onlineTxs={onlineTxs} 
                        offlineExpenses={offlineExpenses} 
                        onRefresh={refreshData} 
                      />
                    );
                  case 'analytics':
                    return (
                      <AnalyticsTab 
                        incomes={incomes} 
                        onlineTxs={onlineTxs} 
                        offlineExpenses={offlineExpenses} 
                        categories={categories} 
                      />
                    );
                  case 'gemini':
                    return (
                      <AIInsightsTab 
                        incomes={incomes} 
                        onlineTxs={onlineTxs} 
                        offlineExpenses={offlineExpenses} 
                        budgets={budgets} 
                        goals={goals} 
                      />
                    );
                  case 'categories':
                    return (
                      <CategoryAdmin 
                        userId={user?.id || ''} 
                        categories={categories} 
                        onRefresh={refreshData} 
                      />
                    );
                  case 'reminders':
                    return (
                      <RemindersTab 
                        userId={user?.id || ''} 
                        notifications={notifications} 
                        onRefresh={refreshData} 
                      />
                    );
                  case 'schema':
                    return <IntegrationSchema />;
                  case 'auth':
                    return (
                      <SessionControl 
                        user={user} 
                        onUserUpdate={handleUserUpdate} 
                      />
                    );
                  default:
                    return <div>Tab not found</div>;
                }
              })()
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
