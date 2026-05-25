export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: string;
  date: string;
  notes: string;
  recurring: boolean;
}

export interface OnlineTransaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  paymentMethod: 'UPI' | 'Debit Card' | 'Credit Card' | 'Wallet' | 'Net Banking';
  merchantName: string;
  dateTime: string;
  notes: string;
}

export interface OfflineCashExpense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  placeName: string;
  date: string;
  notes: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  iconName: string;
  color: string; // Tailwind color class e.g., 'bg-emerald-500'
  isCustom: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  limitAmount: number; // General threshold
  categoryLimits: Record<string, number>; // Category name -> limit amount
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface FinanceNotification {
  id: string;
  userId: string;
  type: 'budget_alert' | 'bill_reminder' | 'savings_reminder' | 'monthly_report';
  title: string;
  message: string;
  dateTime: string;
  isRead: boolean;
}
