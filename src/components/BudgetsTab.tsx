import React, { useState } from 'react';
import { Budget, SavingsGoal, Category, OnlineTransaction, OfflineCashExpense } from '../types';
import { LocalFinanceDB } from '../lib/db';
import { renderFinanceIcon, TAILWIND_COLORS } from './IconMap';
import { Plus, Trash2, Edit, Calendar, DollarSign, Target, Sliders, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BudgetsTabProps {
  userId: string;
  budgets: Budget[];
  goals: SavingsGoal[];
  categories: Category[];
  onlineTxs: OnlineTransaction[];
  offlineExpenses: OfflineCashExpense[];
  onRefresh: () => void;
}

export default function BudgetsTab({ 
  userId, 
  budgets, 
  goals, 
  categories, 
  onlineTxs, 
  offlineExpenses, 
  onRefresh 
}: BudgetsTabProps) {
  const currentMonth = '2026-05';
  const activeBudget = budgets.find(b => b.month === currentMonth) || {
    id: '', month: currentMonth, limitAmount: 3000, categoryLimits: {}
  };

  // Budget Edit States
  const [overallLimit, setOverallLimit] = useState(activeBudget.limitAmount.toString());
  const [editingCategoryLimits, setEditingCategoryLimits] = useState<Record<string, string>>(
    Object.fromEntries(categories.map(c => [c.name, (activeBudget.categoryLimits[c.name] || 0).toString()]))
  );
  const [budgetSuccessMsg, setBudgetSuccessMsg] = useState('');

  // Savings Goals form States
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');

  // Goals Inline progress update State
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [newCurrentAmount, setNewCurrentAmount] = useState('');

  // Save budget configuration
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(overallLimit);
    if (isNaN(limitNum) || limitNum < 0) return;

    const formattedCatLimits: Record<string, number> = {};
    Object.keys(editingCategoryLimits).forEach(cat => {
      const val = parseFloat(editingCategoryLimits[cat]);
      if (!isNaN(val) && val > 0) {
        formattedCatLimits[cat] = val;
      }
    });

    LocalFinanceDB.saveBudget(userId, {
      month: currentMonth,
      limitAmount: limitNum,
      categoryLimits: formattedCatLimits
    });

    setBudgetSuccessMsg('Budget limits locked and initialized successfully!');
    onRefresh();
    setTimeout(() => setBudgetSuccessMsg(''), 3000);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tar = parseFloat(targetAmount);
    const cur = parseFloat(currentAmount);
    if (isNaN(tar) || tar <= 0 || !goalName.trim()) return;

    LocalFinanceDB.addSavingsGoal(userId, {
      name: goalName.trim(),
      targetAmount: tar,
      currentAmount: isNaN(cur) ? 0 : cur,
      deadline
    });

    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('');
    onRefresh();
  };

  // Handle inline goal deposit update
  const handleUpdateGoalProgress = (id: string) => {
    const val = parseFloat(newCurrentAmount);
    if (isNaN(val) || val < 0) return;

    const matched = goals.find(g => g.id === id);
    if (matched) {
      LocalFinanceDB.updateSavingsGoal(userId, id, {
        name: matched.name,
        targetAmount: matched.targetAmount,
        currentAmount: val,
        deadline: matched.deadline
      });
    }

    setUpdatingGoalId(null);
    setNewCurrentAmount('');
    onRefresh();
  };

  const handleDeleteGoal = (id: string) => {
    LocalFinanceDB.deleteSavingsGoal(userId, id);
    onRefresh();
  };

  // Helper: calculate total actually spent in a category for the active month
  const getCategorySpendingTotal = (catName: string) => {
    const online = onlineTxs.filter(tx => tx.category === catName && tx.dateTime.startsWith(currentMonth));
    const offline = offlineExpenses.filter(tx => tx.category === catName && tx.date.startsWith(currentMonth));
    return online.reduce((s, x) => s + x.amount, 0) + offline.reduce((s, x) => s + x.amount, 0);
  };

  const totalSpentThisMonth = 
    onlineTxs.filter(tx => tx.dateTime.startsWith(currentMonth)).reduce((s, x) => s + x.amount, 0) +
    offlineExpenses.filter(tx => tx.date.startsWith(currentMonth)).reduce((s, x) => s + x.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      
      {/* Category Budget setup */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Monthly Budget Limits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Limit your cumulative outlays and partition limits across standard shopping types for the month of **{currentMonth}**.
            </p>
          </div>

          {budgetSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{budgetSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase font-mono tracking-wider">Overall Budget Ceiling ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">$</span>
                <input
                  type="number"
                  value={overallLimit}
                  onChange={e => setOverallLimit(e.target.value)}
                  placeholder="3000"
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* General Progress indicators */}
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">CEILING PROGRESS ({((totalSpentThisMonth / (parseFloat(overallLimit) || 1)) * 100).toFixed(0)}%)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-250">
                    ${totalSpentThisMonth.toFixed(0)} / ${overallLimit || '0'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${totalSpentThisMonth > (parseFloat(overallLimit) || 0) ? 'bg-red-500' : totalSpentThisMonth > (parseFloat(overallLimit) || 0) * 0.85 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min(100, (totalSpentThisMonth / (parseFloat(overallLimit) || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Category Split Limits */}
            <div className="space-y-3.5 pt-2">
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Category Limits Splitting</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {categories.map(c => {
                  const currentCategorySpent = getCategorySpendingTotal(c.name);
                  const activeCapString = editingCategoryLimits[c.name] || '0';
                  const activeCap = parseFloat(activeCapString) || 0;
                  const ratio = activeCap > 0 ? (currentCategorySpent / activeCap) : 0;
                  
                  return (
                    <div key={c.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg text-white ${TAILWIND_COLORS[c.color]?.bg || 'bg-slate-500'}`}>
                            {renderFinanceIcon(c.iconName, 'w-3.5 h-3.5')}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                        </div>
                        {activeCap > 0 && ratio >= 1.0 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                      </div>

                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[10px]">$ Limit</span>
                        <input
                          type="number"
                          value={editingCategoryLimits[c.name] || ''}
                          onChange={e => setEditingCategoryLimits({
                            ...editingCategoryLimits,
                            [c.name]: e.target.value
                          })}
                          placeholder="e.g. 200"
                          className="w-full pl-12 pr-2 py-1 text-xs border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg font-mono text-slate-800 dark:text-white focus:outline-none"
                        />
                      </div>

                      {activeCap > 0 && (
                        <div className="space-y-1 font-mono text-[9px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Spent: ${currentCategorySpent.toFixed(0)} ({Math.min(100, ratio * 100).toFixed(0)}%)</span>
                            <span className={ratio >= 1.0 ? 'text-red-500 font-bold' : ratio >= 0.85 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                              {ratio >= 1.0 ? 'Breached' : ratio >= 0.85 ? 'Warning' : 'Within limit'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${ratio >= 1.0 ? 'bg-red-500' : ratio >= 0.85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, ratio * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              id="btn-save-budget"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Lock and Apply Budgets
            </button>
          </form>
        </div>
      </div>

      {/* Savings Targets panel */}
      <div className="space-y-6">
        
        {/* Goals Logger Form */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Target className="w-5 h-5 text-indigo-500" />
              Savings Targets & Milestones
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set aside specific targets (e.g. Vacation, Car purchase, emergency cushion fund) and follow your milestones tracking.
            </p>
          </div>

          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Goal Title / Milestone Name</label>
              <input
                type="text"
                required
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                placeholder="e.g. Japan Autumn Cruise 2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Target Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Current Saved ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Deadline Target</label>
              <input
                type="date"
                value={deadline}
                required
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              id="btn-add-goal"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Add Savings Goal Track
            </button>
          </form>
        </div>

        {/* Goals List Panel */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm overflow-hidden p-6 space-y-4">
          <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Active Target Milestones ({goals.length})</span>
          
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center text-xs py-6 text-slate-400">
                No active savings goals defined.
              </div>
            ) : (
              goals.map(g => {
                const ratio = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
                return (
                  <div key={g.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-850 dark:text-slate-150">{g.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" /> Target date: {g.deadline}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{ratio.toFixed(0)}% Saved</span>
                        <span className="text-slate-500 dark:text-slate-300">
                          ${g.currentAmount.toLocaleString()} / ${g.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all bg-indigo-600"
                          style={{ width: `${ratio}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Inline progression modifier */}
                    {updatingGoalId === g.id ? (
                      <div className="pt-2 flex gap-2 items-center">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[10px]">$</span>
                          <input
                            type="number"
                            value={newCurrentAmount}
                            onChange={e => setNewCurrentAmount(e.target.value)}
                            placeholder="New balance"
                            className="w-full pl-6 pr-2 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg font-mono focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handleUpdateGoalProgress(g.id)}
                          className="py-1 px-3 bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setUpdatingGoalId(null)}
                          className="py-1 px-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer"
                        >
                          Back
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setUpdatingGoalId(g.id);
                          setNewCurrentAmount(g.currentAmount.toString());
                        }}
                        className="py-1 px-3 w-full bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        Adjust Saved Progress
                      </button>
                    )}
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
