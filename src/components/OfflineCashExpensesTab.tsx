import React, { useState } from 'react';
import { OfflineCashExpense, Category } from '../types';
import { LocalFinanceDB } from '../lib/db';
import { renderFinanceIcon, TAILWIND_COLORS } from './IconMap';
import { Plus, Trash2, Edit, Calendar, DollarSign, Search, Filter, HelpCircle, Eye, ShoppingCart } from 'lucide-react';

interface OfflineCashExpensesTabProps {
  userId: string;
  offlineExpenses: OfflineCashExpense[];
  categories: Category[];
  onRefresh: () => void;
}

export default function OfflineCashExpensesTab({ userId, offlineExpenses, categories, onRefresh }: OfflineCashExpensesTabProps) {
  // Add states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [placeName, setPlaceName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPlaceName, setEditPlaceName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Sorter / Slices states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Save addition
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !placeName.trim()) return;

    LocalFinanceDB.addOfflineExpense(userId, {
      amount: numAmount,
      category,
      placeName: placeName.trim(),
      date,
      notes: notes.trim()
    });

    setAmount('');
    setPlaceName('');
    setNotes('');
    onRefresh();
  };

  // Trigger edit
  const startEdit = (col: OfflineCashExpense) => {
    setEditingId(col.id);
    setEditAmount(col.amount.toString());
    setEditCategory(col.category);
    setEditPlaceName(col.placeName);
    setEditDate(col.date);
    setEditNotes(col.notes);
  };

  // Save edit
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0 || !editPlaceName.trim()) return;

    LocalFinanceDB.updateOfflineExpense(userId, editingId, {
      amount: numAmount,
      category: editCategory,
      placeName: editPlaceName.trim(),
      date: editDate,
      notes: editNotes.trim()
    });

    setEditingId(null);
    onRefresh();
  };

  // Save delete
  const handleDelete = (id: string) => {
    LocalFinanceDB.deleteOfflineExpense(userId, id);
    onRefresh();
  };

  // Sorter filtering mechanics
  const filteredTxs = offlineExpenses.filter(col => {
    const matchesSearch = col.placeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          col.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' ? true : col.category === filterCategory;

    const numMin = parseFloat(minAmount);
    const numMax = parseFloat(maxAmount);
    const matchesMin = !isNaN(numMin) ? col.amount >= numMin : true;
    const matchesMax = !isNaN(numMax) ? col.amount <= numMax : true;

    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  const aggregateSpent = filteredTxs.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Logger side panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          {editingId ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Edit className="w-4 h-4" /> Edit Offline Cash Expense
              </h3>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">$</span>
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
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Place / Shop Name</label>
                <input
                  type="text"
                  required
                  value={editPlaceName}
                  onChange={e => setEditPlaceName(e.target.value)}
                  placeholder="e.g. Traditional Bakers, Grocery Store"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
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
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Plus className="w-4.5 h-4.5" /> Log Physical Cash Bill
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
                    placeholder="15.00"
                    className="w-full pl-7 pr-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Place / Corner Shop Name</label>
                <input
                  type="text"
                  required
                  value={placeName}
                  onChange={e => setPlaceName(e.target.value)}
                  placeholder="e.g. Farmers Market, Subway Station"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Small changes, weekly groceries tips..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <button
                id="btn-add-offline"
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Log Cash Spending
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Cash Ledger Tables & Search Filters */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Sorters Block */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Aggregate Offline Cash Bills</div>
              <div className="text-2xl font-mono font-bold text-amber-500">${aggregateSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="py-1 px-2.5 text-[10px] font-bold tracking-wider rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase focus:outline-none"
            >
              <option value="all">📂 All Categories</option>
              {Array.from(new Set(offlineExpenses.map(o => o.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search shop location..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="relative md:col-span-1">
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-[10px] uppercase font-mono">Min $</span>
              <input
                type="number"
                value={minAmount}
                onChange={e => setMinAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="relative md:col-span-1">
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-[10px] uppercase font-mono">Max $</span>
              <input
                type="number"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                placeholder="250"
                className="w-full pl-12 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] uppercase font-mono text-slate-400">
                  <th className="py-3 px-4 text-left font-medium">Place / Shop Name</th>
                  <th className="py-3 px-4 text-left font-medium">Category</th>
                  <th className="py-3 px-4 text-left font-medium">Transaction Date</th>
                  <th className="py-3 px-4 text-right font-medium">Amount</th>
                  <th className="py-3 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No liquid cash expenses matched your active criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((col) => {
                    const matchedCat = categories.find(c => c.name === col.category);
                    const shade = matchedCat ? (TAILWIND_COLORS[matchedCat.color] || TAILWIND_COLORS.slate) : TAILWIND_COLORS.slate;

                    return (
                      <tr key={col.id} className="hover:bg-slate-50/35 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${shade.bg}`}>
                              {renderFinanceIcon(matchedCat?.iconName || 'HelpCircle', 'w-4 h-4')}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{col.placeName}</div>
                              {col.notes && <div className="text-[10px] text-slate-400 font-sans line-clamp-1">{col.notes}</div>}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`py-0.5 px-2 rounded-md font-sans font-medium text-[10px] uppercase ${shade.bgSoft} ${shade.text}`}>
                            {col.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {col.date}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-amber-500">
                          -${col.amount.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEdit(col)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(col.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
