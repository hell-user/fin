import React from 'react';
import { 
  Coffee, 
  ShoppingBag, 
  Car, 
  BookOpen, 
  Film, 
  Heart, 
  Receipt, 
  PlayCircle, 
  TrendingUp, 
  HelpCircle,
  Briefcase,
  DollarSign,
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  TrendingDown,
  Target,
  Bell,
  Download,
  Search,
  Filter,
  Moon,
  Sun,
  LogOut,
  Database,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronRight,
  Sparkle,
  Cpu,
  Bookmark,
  Activity,
  Award
} from 'lucide-react';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  ShoppingBag,
  Car,
  BookOpen,
  Film,
  Heart,
  Receipt,
  PlayCircle,
  TrendingUp,
  HelpCircle,
  Briefcase,
  DollarSign,
  Smartphone,
  Plus,
  Trash2,
  Edit: Edit2,
  Sparkles,
  TrendingDown,
  Target,
  Bell,
  Download,
  Search,
  Filter,
  Moon,
  Sun,
  LogOut,
  Database,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronRight,
  Sparkle,
  Cpu,
  Bookmark,
  Activity,
  Award
};

export function renderFinanceIcon(iconName: string, className?: string) {
  const IconComponent = icons[iconName] || HelpCircle;
  return <IconComponent className={className} />;
}

export const TAILWIND_COLORS: Record<string, { bg: string; text: string; bgSoft: string; border: string }> = {
  red: { bg: 'bg-red-500', text: 'text-red-500', bgSoft: 'bg-red-50 dark:bg-rose-950/20', border: 'border-red-500' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-500', bgSoft: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-500' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', bgSoft: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-500' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', bgSoft: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-500' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500', bgSoft: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-500' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-500', bgSoft: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-500' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500', bgSoft: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-500' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', bgSoft: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-500' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', bgSoft: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-500' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-500', bgSoft: 'bg-slate-50 dark:bg-slate-900', border: 'border-slate-500' }
};

export const AVAILABLE_ICONS = [
  'Coffee', 'ShoppingBag', 'Car', 'BookOpen', 'Film', 'Heart', 'Receipt', 'PlayCircle',
  'TrendingUp', 'HelpCircle', 'Briefcase', 'DollarSign', 'Smartphone', 'Bookmark', 'Activity', 'Award'
];
