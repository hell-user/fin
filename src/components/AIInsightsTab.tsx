import React, { useState, useEffect } from 'react';
import { Income, OnlineTransaction, OfflineCashExpense, Budget, SavingsGoal } from '../types';
import { Sparkles, Brain, Compass, Activity, ShieldAlert, CheckCircle, RefreshCw, Layers } from 'lucide-react';

interface AIInsightsTabProps {
  incomes: Income[];
  onlineTxs: OnlineTransaction[];
  offlineExpenses: OfflineCashExpense[];
  budgets: Budget[];
  goals: SavingsGoal[];
}

interface AIInsightsData {
  summary: string;
  habits: string[];
  savingsSuggestions: string[];
  budgetRecommendations: string[];
  patternDetection: string[];
  isMock?: boolean;
}

export default function AIInsightsTab({ incomes, onlineTxs, offlineExpenses, budgets, goals }: AIInsightsTabProps) {
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fetch analysis recommendations upon component mount
  const runAnalysis = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomes,
          onlineTransactions: onlineTxs,
          offlineExpenses,
          budgets,
          savingsGoals: goals,
          currentMonth: '2026-05'
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis transaction failed on Express backend.');
      }

      const raw = await response.json();
      setData(raw);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Could not fetch real-time insights or connection timed out.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [incomes.length, onlineTxs.length, offlineExpenses.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Banner Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-6 rounded-3xl text-white border border-indigo-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Sparkles className="w-80 h-80 text-white" />
        </div>

        <div className="max-w-xl space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Google Gemini Advisor Active
          </span>
          <h2 className="text-2xl font-display font-semibold tracking-tight">AI-Powered Intelligent Insights</h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-sans">
            Our neural algorithms analyze your UPI, credit, and physical cash records in real-time. We optimize category budgets, discover leaks, and help secure your savings deadlines.
          </p>

          <button
            onClick={runAnalysis}
            disabled={loading}
            className="mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {loading ? 'Consulting Gemini...' : 'Recalculate AI Analysis'}
          </button>
        </div>
      </div>

      {/* API Key Notices */}
      {data?.isMock && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/25 border border-amber-200/50 dark:border-amber-900 rounded-2xl flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-400">
            <span className="font-bold block">Sandbox Demo Model Mode</span>
            Showing pre-rendered advisor insights. To generate real-time evaluations reflecting your custom ledger entries precisely, add your personal <code className="bg-amber-100 dark:bg-amber-950 py-0.5 px-1 rounded font-mono text-[10px] text-amber-900">GEMINI_API_KEY</code> into the Secrets cabinet on AI Studio.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/35 border border-rose-200 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-mono">
          🚨 {errorMsg}
        </div>
      )}

      {/* Loading Screen */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-350 bg-opacity-80 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Consulting Gemini financial intelligence model...</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Evaluating digital ledger cash ratios, budget structures, and spending velocities.</p>
          </div>
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Financial Summary Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm md:col-span-2 space-y-3 animate-fade-in">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider items-center flex gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" /> Synthesized Performance Synthesis
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {data.summary}
              </p>
            </div>

            {/* Habits Analysis */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4 animate-fade-in">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider items-center flex gap-1.5">
                <Activity className="w-4 h-4 text-pink-500" /> Habits & Behavior Observation
              </span>
              <ul className="space-y-3.5">
                {data.habits.map((h, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-950/35 text-[10px] text-pink-600 dark:text-pink-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Smart Savings Suggestions */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4 animate-fade-in">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider items-center flex gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Recommended Action Items
              </span>
              <ul className="space-y-3.5">
                {data.savingsSuggestions.map((s, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/35 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Budget recommendations */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4 animate-fade-in">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider items-center flex gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" /> Recommended Budget Reallocations
              </span>
              <ul className="space-y-3.5">
                {data.budgetRecommendations.map((b, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <div className="p-1 rounded bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shrink-0 font-mono text-[9px] font-bold uppercase mt-0.5">Limit Adjust</div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pattern Detections */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4 animate-fade-in">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase font-mono tracking-wider items-center flex gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" /> Spend Ratios & Timelines Detection
              </span>
              <ul className="space-y-3.5">
                {data.patternDetection.map((p, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shrink-0 font-mono text-[9px] font-bold uppercase mt-0.5">Detected</div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )
      )}
    </div>
  );
}
