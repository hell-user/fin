import React, { useState } from 'react';
import { Income } from '../types';
import { LocalFinanceDB } from '../lib/db';
import { Plus, Trash2, Edit, Calendar, DollarSign, Search, Filter, HelpCircle, Check, Briefcase, RefreshCw } from 'lucide-react';

interface IncomeTabProps {
  userId: string;
  incomes: Income[];
  onRefresh: () => void;
}

export default function IncomeTab({ userId, incomes, onRefresh }: IncomeTabProps) {
  // Add income states
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);

  // Edit income states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRecurring, setEditRecurring] = useState(false);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecurring, setFilterRecurring] = useState<'all' | 'recurring' | 'one-time'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Income addition submission
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !source.trim()) return;

    LocalFinanceDB.addIncome(userId, {
      amount: numAmount,
      source: source.trim(),
      date,
      notes: notes.trim(),
      recurring
    });

    setAmount('');
    setSource('');
    setNotes('');
    setRecurring(false);
    onRefresh();
  };

  // Income edit start
  const startEdit = (inc: Income) => {
    setEditingId(inc.id);
    setEditAmount(inc.amount.toString());
    setEditSource(inc.source);
    setEditDate(inc.date);
    setEditNotes(inc.notes);
    setEditRecurring(inc.recurring);
  };

  // Income edit submission
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0 || !editSource.trim()) return;

    LocalFinanceDB.updateIncome(userId, editingId, {
      amount: numAmount,
      source: editSource.trim(),
      date: editDate,
      notes: editNotes.trim(),
      recurring: editRecurring
    });

    setEditingId(null);
    onRefresh();
  };

  // Income deletion
  const handleDelete = (id: string) => {
    LocalFinanceDB.deleteIncome(userId, id);
    onRefresh();
  };

  // Filter income logic
  const filteredIncomes = incomes.filter(inc => {
    const matchesSearch = inc.source.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRecurring = filterRecurring === 'all' ? true :
                             filterRecurring === 'recurring' ? inc.recurring === true : 
                             inc.recurring === false;

    const matchesStartDate = startDate ? inc.date >= startDate : true;
    const matchesEndDate = endDate ? inc.date <= endDate : true;

    return matchesSearch && matchesRecurring && matchesStartDate && matchesEndDate;
  });

  const aggregateIncome = filteredIncomes.reduce((acc, current) => acc + current.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Addition & Editing Forms */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          {editingId ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Edit className="w-4 h-4" /> Edit Income Entry
              </h3>
              
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Income Source / Title</label>
                <input
                  type="text"
                  required
                  value={editSource}
                  onChange={e => setEditSource(e.target.value)}
                  placeholder="e.g. Consulting, Dividends"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Description / Notes</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Notes related to payload transfer"
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-recurring"
                  checked={editRecurring}
                  onChange={e => setEditRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 bg-white dark:bg-slate-900 cursor-pointer"
                />
                <label htmlFor="edit-recurring" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Recurring monthly income
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdd} className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Plus className="w-4.5 h-4.5" /> Log Income
              </h3>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="2500.00"
                    className="w-full pl-7 pr-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Source / Platform</label>
                <input
                  type="text"
                  required
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="e.g. Salary, Stock Profit, LLC Dev"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional context or transaction ID..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={recurring}
                  onChange={e => setRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 bg-white dark:bg-slate-900 cursor-pointer"
                />
                <label htmlFor="recurring" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Recurring payout monthly
                </label>
              </div>

              <button
                id="btn-add-income"
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Log Income Entry
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Income Ledger Table */}
      <div className="lg:col-span-2 space-y-4">
        {/* Statistics & Search Panel */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Filtered Yield Total</div>
              <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">${aggregateIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            {/* Filter Toggle controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRecurring('all')}
                className={`py-1 px-3 text-[10px] font-extrabold rounded-lg uppercase tracking-wider ${filterRecurring === 'all' ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRecurring('recurring')}
                className={`py-1 px-3 text-[10px] font-extrabold rounded-lg uppercase tracking-wider ${filterRecurring === 'recurring' ? 'bg-indigo-500 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
              >
                Recurring
              </button>
              <button
                onClick={() => setFilterRecurring('one-time')}
                className={`py-1 px-3 text-[10px] font-extrabold rounded-lg uppercase tracking-wider ${filterRecurring === 'one-time' ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
              >
                One-Time
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-1">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search source/notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Date Start */}
            <div className="relative md:col-span-1">
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-[10px] uppercase font-mono">From</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full pl-10 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Date End */}
            <div className="relative md:col-span-1">
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-[10px] uppercase font-mono">To</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Ledger Rows Card */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] uppercase font-mono text-slate-400">
                  <th className="py-3 px-4 text-left font-medium">Source / Platform</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Type</th>
                  <th className="py-3 px-4 text-right font-medium">Amount</th>
                  <th className="py-3 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {filteredIncomes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-sans">
                      No income ledger records matched your active query.
                    </td>
                  </tr>
                ) : (
                  filteredIncomes.map((inc) => (
                    <tr 
                      key={inc.id} 
                      className={`hover:bg-slate-50/35 dark:hover:bg-slate-900/10 transition-colors ${editingId === inc.id ? 'bg-indigo-50/10' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{inc.source}</div>
                            {inc.notes && <div className="text-[10px] text-slate-400 font-sans line-clamp-1">{inc.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {inc.date}
                      </td>
                      <td className="py-3.5 px-4">
                        {inc.recurring ? (
                          <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 py-0.5 px-2 rounded-md text-[10px] font-mono tracking-wide inline-flex items-center gap-1 uppercase">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Monthly
                          </span>
                        ) : (
                          <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 py-0.5 px-2 rounded-md text-[10px] font-mono tracking-wide inline-flex items-center gap-1 uppercase">
                            One-Time
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                        ${inc.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => startEdit(inc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inc.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
