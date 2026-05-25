import React, { useState } from 'react';
import { LocalFinanceDB } from '../lib/db';
import { Database, Check, Copy, Flame, Shield, HelpCircle } from 'lucide-react';

export default function IntegrationSchema() {
  const [copied, setCopied] = useState(false);
  const schemaCode = LocalFinanceDB.getSupabasePostgresSchemaCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm animate-fade-in space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          Supabase PostgreSQL Core Integration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
          Deploy your database schemas, enable Row-Level Security (RLS), and synchronize user tables into your cloud Supabase account easily.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-950 rounded-xl space-y-2">
          <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 items-center flex gap-1.5 uppercase font-mono">
            <Shield className="w-4 h-4" /> Row-Level Security
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All user transactions require matching active JWT credentials. The system guarantees cryptographic tenant separation on cloud databases using:
            <code className="block mt-1 p-1 bg-white dark:bg-slate-900 rounded font-mono text-[10px] text-indigo-700 dark:text-indigo-300">
              CREATE POLICY USING (user_id = auth.uid())
            </code>
          </p>
        </div>

        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-950 rounded-xl space-y-2">
          <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 items-center flex gap-1.5 uppercase font-mono">
            <Flame className="w-4 h-4" /> High-Utility Indexes
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Pre-configured compound indexes on date ranges and category filters guarantee high-performance, millisecond-level analytics when the charts query thousands of rows.
          </p>
        </div>
      </div>

      {/* SQL Schema Code Viewer */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Postgres SQL DDL Script</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold py-1 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all border border-slate-200/40 dark:border-slate-850 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">SQL Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Query</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-slate-900 text-slate-100 dark:bg-black dark:text-slate-300 text-[11px] rounded-xl overflow-x-auto max-h-[380px] font-mono leading-relaxed border border-slate-950 shadow-inner select-all">
            <code>{schemaCode}</code>
          </pre>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-150/40 dark:border-slate-850">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          How do I deploy this schema?
        </h4>
        <ol className="text-xs text-slate-500 dark:text-slate-400 list-decimal pl-4.5 space-y-1">
          <li>Create a free backend project on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">Supabase.com</a>.</li>
          <li>Navigate to the **SQL Editor** in the left sidebar drawer.</li>
          <li>Click **New Query**, paste this SQL text, and select **Run**.</li>
          <li>Configure your credentials <code className="bg-slate-250 dark:bg-slate-800 py-0.5 px-1 rounded text-[10px] font-mono text-indigo-500">VITE_SUPABASE_URL</code> in Settings!</li>
        </ol>
      </div>
    </div>
  );
}
