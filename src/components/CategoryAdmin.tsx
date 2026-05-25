import React, { useState } from 'react';
import { Category } from '../types';
import { LocalFinanceDB } from '../lib/db';
import { 
  AVAILABLE_ICONS, 
  TAILWIND_COLORS, 
  renderFinanceIcon 
} from './IconMap';
import { FolderPlus, Trash2, Tag, ShieldCheck, Check } from 'lucide-react';

interface CategoryAdminProps {
  userId: string;
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoryAdmin({ userId, categories, onRefresh }: CategoryAdminProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Bookmark');
  const [selectedColor, setSelectedColor] = useState('emerald');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Reject duplicate name checks
    const lowercaseName = name.trim().toLowerCase();
    const isDuplicate = categories.some(c => c.name.toLowerCase() === lowercaseName);
    if (isDuplicate) {
      setErrorMsg('A category with this name already exists.');
      return;
    }

    LocalFinanceDB.addCategory(userId, name.trim(), selectedIcon, selectedColor);
    setName('');
    setErrorMsg('');
    onRefresh();
  };

  const handleDelete = (id: string) => {
    LocalFinanceDB.deleteCategory(userId, id);
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Creation Form */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-indigo-500" />
          Create Custom Category
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Tailor-make custom categories to match your precise online or physical cash shopping behaviors.
        </p>

        {errorMsg && (
          <div className="mb-4 p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Garden & Plants, Car Wash"
              maxLength={22}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Select Vector Icon</label>
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 max-h-36 overflow-y-auto">
              {AVAILABLE_ICONS.map((ico) => (
                <button
                  key={ico}
                  type="button"
                  onClick={() => setSelectedIcon(ico)}
                  className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${selectedIcon === ico ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                >
                  {renderFinanceIcon(ico, 'w-4 h-4')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Pick Shade Accent</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(TAILWIND_COLORS).map((col) => {
                const props = TAILWIND_COLORS[col];
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${props.bg} ${selectedColor === col ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 bg-opacity-100' : 'border-transparent bg-opacity-80 hover:scale-105'}`}
                  >
                    {selectedColor === col && <Check className="w-4 h-4 text-white font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            id="btn-add-category"
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Create Category Definition
          </button>
        </form>
      </div>

      {/* Categories Grid List */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider font-mono">Dynamic Ledger Categories ({categories.length})</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const schema = TAILWIND_COLORS[cat.color] || TAILWIND_COLORS.slate;
            return (
              <div 
                key={cat.id} 
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${schema.bgSoft} border-slate-150/50 dark:border-slate-900`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-white ${schema.bg}`}>
                    {renderFinanceIcon(cat.iconName, 'w-4 h-4')}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono capitalize">Shade: {cat.color}</div>
                  </div>
                </div>

                {!cat.isCustom ? (
                  <span className="text-[10px] font-mono py-1 px-2 rounded-md bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Core
                  </span>
                ) : (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
