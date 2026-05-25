import React from 'react';
import { FinanceNotification } from '../types';
import { LocalFinanceDB } from '../lib/db';
import { Bell, ShieldAlert, Check, HelpCircle, AlertTriangle, Calendar, Info } from 'lucide-react';

interface RemindersTabProps {
  userId: string;
  notifications: FinanceNotification[];
  onRefresh: () => void;
}

export default function RemindersTab({ userId, notifications, onRefresh }: RemindersTabProps) {
  
  const handleMarkAllRead = () => {
    LocalFinanceDB.markAllNotificationsRead(userId);
    onRefresh();
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'budget_alert': 
        return <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />;
      case 'bill_reminder': 
        return <Calendar className="w-4.5 h-4.5 text-indigo-500" />;
      case 'savings_reminder': 
        return <Info className="w-4.5 h-4.5 text-emerald-500" />;
      default: 
        return <Bell className="w-4.5 h-4.5 text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
            <Bell className="w-5 h-5 text-indigo-500" />
            Notifications & Scheduled Reminders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time warnings, subscription renewals and savings goal highlights automatically triggered.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1 px-3 bg-indigo-50 dark:bg-indigo-950/35 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active notification alerts or scheduled budget alarms.
          </div>
        ) : (
          notifications.map(note => (
            <div 
              key={note.id} 
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${note.isRead ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-850 opacity-70' : 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100/35 dark:border-indigo-950'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${note.isRead ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-indigo-600/10 dark:bg-indigo-950/40'}`}>
                {getAlertIcon(note.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className={`text-xs font-semibold ${note.isRead ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>{note.title}</span>
                  <span className="text-[9px] font-mono text-slate-400">{new Date(note.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{note.message}</p>
              </div>

              {!note.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0 mt-2 animate-pulse"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bill Reminder Setup simulation */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150/40 dark:border-slate-850/50 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-500" /> Reminder Automations setup status
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          The budget engine continuously checks transaction increments dynamically. Limits breached above <span className="font-bold">85% WARNING</span> or <span className="font-bold">100% EXCEEDED</span> are written directly to your live panel ledger database to guarantee safe spending.
        </p>
      </div>

    </div>
  );
}
