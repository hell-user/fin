import React, { useState } from 'react';
import { OnlineTransaction, Category } from '../types';
import { LocalFinanceDB } from '../lib/db';
import { renderFinanceIcon, TAILWIND_COLORS } from './IconMap';
import { Plus, Trash2, Edit, Calendar, DollarSign, Search, Filter, HelpCircle, Smartphone, CreditCard, Landmark, Eye } from 'lucide-react';

interface OnlineExpensesTabProps {
  userId: string;
  transactions: OnlineTransaction[];
  categories: Category[];
  onRefresh: () => void;
}

export default function OnlineExpensesTab({ userId, transactions, categories, onRefresh }: OnlineExpensesTabProps) {
  // Add state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Debit Card' | 'Credit Card' | 'Wallet' | 'Net Banking'>('UPI');
  const [merchantName, setMerchantName] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'UPI' | 'Debit Card' | 'Credit Card' | 'Wallet' | 'Net Banking'>('UPI');
  const [editMerchantName, setEditMerchantName] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Save add transaction
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !merchantName.trim()) return;

    LocalFinanceDB.addOnlineTransaction(userId, {
      amount: numAmount,
      category,
      paymentMethod,
      merchantName: merchantName.trim(),
      dateTime: new Date(dateTime).toISOString(),
      notes: notes.trim()
    });

    setAmount('');
    setMerchantName('');
    setNotes('');
    setDateTime(new Date().toISOString().slice(0, 16));
    onRefresh();
  };

  // Trigger edit
  const startEdit = (tx: OnlineTransaction) => {
    setEditingId(tx.id);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setEditPaymentMethod(tx.paymentMethod);
    setEditMerchantName(tx.merchantName);
    // Convert to local YYYY-MM-DDTHH:MM format
    const formattedDt = new Date(tx.dateTime).toISOString().slice(0, 16);
    setEditDateTime(formattedDt);
    setEditNotes(tx.notes);
  };

  // Save update
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0 || !editMerchantName.trim()) return;

    LocalFinanceDB.updateOnlineTransaction(userId, editingId, {
      amount: numAmount,
      category: editCategory,
      paymentMethod: editPaymentMethod,
      merchantName: editMerchantName.trim(),
      dateTime: new Date(editDateTime).toISOString(),
      notes: editNotes.trim()
    });

    setEditingId(null);
    onRefresh();
  };

  // Delete transaction
  const handleDelete = (id: string) => {
    LocalFinanceDB.deleteOnlineTransaction(userId, id);
    onRefresh();
  };

  const paymentMethods: ('UPI' | 'Debit Card' | 'Credit Card' | 'Wallet' | 'Net Banking')[] = [
    'UPI', 'Debit Card', 'Credit Card', 'Wallet', 'Net Banking'
  ];

  // Map payment system to an elegant micro-icon
  const getPaymentIconElement = (method: string) => {
    switch(method) {
      case 'UPI': return <Smartphone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      case 'Debit Card': 
      case 'Credit Card': return <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'Net Banking': return <Landmark className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      default: return <Smartphone className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
    }
  };

  // Online filtering logic
  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = tx.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' ? true : tx.category === filterCategory;
    const matchesPayment = filterPayment === 'all' ? true : tx.paymentMethod === filterPayment;

    const numMin = parseFloat(minAmount);
    const numMax = parseFloat(maxAmount);
    const matchesMin = !isNaN(numMin) ? tx.amount >= numMin : true;
    const matchesMax = !isNaN(numMax) ? tx.amount <= numMax : true;

    return matchesSearch && matchesCategory && matchesPayment && matchesMin && matchesMax;
  });

  const aggregateSpent = filteredTxs.reduce((sum, current) => sum + current.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Addition & Editing side panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          {editingId ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Edit className="w-4 h-4" /> Edit Online Payment
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
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Merchant / Payee Name</label>
                <input
                  type="text"
                  required
                  value={editMerchantName}
                  onChange={e => setEditMerchantName(e.target.value)}
                  placeholder="e.g. Swiggy Food, Uber, Amazon"
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
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Method</label>
                  <select
                    value={editPaymentMethod}
                    onChange={e => setEditPaymentMethod(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-900 dark:text-white text-ellipsis overflow-hidden"
                  >
                    {paymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={editDateTime}
                  onChange={e => setEditDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
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
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Plus className="w-4.5 h-4.5" /> Log Online Transaction
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
                    placeholder="25.00"
                    className="w-full pl-7 pr-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Merchant / Service Payee</label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  placeholder="e.g. Starbucks, Amazon, Apple Store"
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
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-900 dark:text-white text-ellipsis overflow-hidden"
                  >
                    {paymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Subscription, business checkout, dinner tag..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <button
                id="btn-add-online"
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Log Online Transaction
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main ledger list & filters */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Filtered Online Spending</div>
              <div className="text-2xl font-mono font-bold text-indigo-500">${aggregateSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Payment Filter Selection */}
              <select
                value={filterPayment}
                onChange={e => setFilterPayment(e.target.value)}
                className="py-1 px-2.5 text-[10px] font-bold tracking-wider rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase focus:outline-none"
              >
                <option value="all">💳 All Methods</option>
                {paymentMethods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="py-1 px-2.5 text-[10px] font-bold tracking-wider rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase focus:outline-none"
              >
                <option value="all">📂 All Categories</option>
                {Array.from(new Set(transactions.map(t => t.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
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
                placeholder="Search merchant/notes..."
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
                placeholder="999"
                className="w-full pl-12 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Ledger List */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] uppercase font-mono text-slate-400">
                  <th className="py-3 px-4 text-left font-medium">Merchant/Order</th>
                  <th className="py-3 px-4 text-left font-medium">Category</th>
                  <th className="py-3 px-4 text-left font-medium">Payment Channel</th>
                  <th className="py-3 px-4 text-right font-medium">Amount</th>
                  <th className="py-3 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No online transactions matched your active criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => {
                    const matchedCat = categories.find(c => c.name === tx.category);
                    const shade = matchedCat ? (TAILWIND_COLORS[matchedCat.color] || TAILWIND_COLORS.slate) : TAILWIND_COLORS.slate;
                    
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/35 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${shade.bg}`}>
                              {renderFinanceIcon(matchedCat?.iconName || 'HelpCircle', 'w-4 h-4')}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{tx.merchantName}</div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <span>{new Date(tx.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                {tx.notes && <span className="text-slate-350 dark:text-slate-600">• {tx.notes}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`py-0.5 px-2 rounded-md font-sans font-medium text-[10px] uppercase ${shade.bgSoft} ${shade.text}`}>
                            {tx.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {getPaymentIconElement(tx.paymentMethod)}
                            <span className="font-sans text-[11px] font-semibold">{tx.paymentMethod}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-rose-500">
                          -${tx.amount.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEdit(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
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
