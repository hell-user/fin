import { 
  UserProfile, 
  Income, 
  OnlineTransaction, 
  OfflineCashExpense, 
  Category, 
  Budget, 
  SavingsGoal, 
  FinanceNotification 
} from '../types';

// Predefined categories
export const PREDEFINED_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Food', iconName: 'Coffee', color: 'red', isCustom: false },
  { name: 'Shopping', iconName: 'ShoppingBag', color: 'pink', isCustom: false },
  { name: 'Travel', iconName: 'Car', color: 'blue', isCustom: false },
  { name: 'Education', iconName: 'BookOpen', color: 'indigo', isCustom: false },
  { name: 'Entertainment', iconName: 'Film', color: 'purple', isCustom: false },
  { name: 'Health', iconName: 'Heart', color: 'rose', isCustom: false },
  { name: 'Bills', iconName: 'Receipt', color: 'amber', isCustom: false },
  { name: 'Subscriptions', iconName: 'PlayCircle', color: 'orange', isCustom: false },
  { name: 'Investment', iconName: 'TrendingUp', color: 'emerald', isCustom: false },
  { name: 'Others', iconName: 'HelpCircle', color: 'slate', isCustom: false }
];

// Helper to load or initialize from localStorage
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Global mockup database for complete offline-first usability
// If Supabase keys are configured, users can view instructions to connect,
// but local storage always acts as a beautifully reactive data model.
export class LocalFinanceDB {
  static getLoggedInUser(): UserProfile | null {
    return getLocalStorageItem<UserProfile | null>('fin_user', {
      id: 'demo-user-123',
      email: 'mywindows10proacc@gmail.com',
      name: 'Google User',
      createdAt: '2026-05-10T12:00:00Z'
    });
  }

  static login(email: string, name?: string): UserProfile {
    const user: UserProfile = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    setLocalStorageItem('fin_user', user);
    this.seedInitialData(user.id);
    return user;
  }

  static logout(): void {
    localStorage.removeItem('fin_user');
  }

  static seedInitialData(userId: string): void {
    // Check if seeded
    if (localStorage.getItem(`fin_seeded_${userId}`)) return;

    // Categories
    const categories: Category[] = PREDEFINED_CATEGORIES.map((c, idx) => ({
      id: `cat_${idx}`,
      userId,
      ...c
    }));
    setLocalStorageItem(`fin_categories_${userId}`, categories);

    // Current and past month dates
    const now = new Date('2026-05-25T02:23:20Z');
    
    const formatYMD = (date: Date) => date.toISOString().split('T')[0];
    const formatYMDTime = (date: Date, hrsStr: string) => {
      return `${date.toISOString().split('T')[0]}T${hrsStr}`;
    };

    const curYearMonth = '2026-05';
    const prevYearMonth = '2026-04';

    // Seed Income
    const incomes: Income[] = [
      {
        id: 'inc_1',
        userId,
        amount: 4500,
        source: 'Primary Job Salary',
        date: '2026-05-01',
        notes: 'Monthly corporate salary payout',
        recurring: true
      },
      {
        id: 'inc_2',
        userId,
        amount: 850,
        source: 'Freelance Design Project',
        date: '2026-05-12',
        notes: 'Logo design delivery milestone',
        recurring: false
      },
      {
        id: 'inc_3',
        userId,
        amount: 4500,
        source: 'Primary Job Salary',
        date: '2026-04-01',
        notes: 'Monthly salary payout for April',
        recurring: true
      },
      {
        id: 'inc_4',
        userId,
        amount: 400,
        source: 'Dividends & Stock Returns',
        date: '2026-04-18',
        notes: 'Quarterly ETF earnings payout',
        recurring: true
      }
    ];
    setLocalStorageItem(`fin_incomes_${userId}`, incomes);

    // Seed Online Transactions (UPI, Credit/Debit card, netbanking)
    const onlineTransactions: OnlineTransaction[] = [
      {
        id: 'ot_1',
        userId,
        amount: 140,
        category: 'Food',
        paymentMethod: 'UPI',
        merchantName: 'Zomato Dining Delivery',
        dateTime: '2026-05-24T19:30:00Z',
        notes: 'Weekend dinner with flatmates'
      },
      {
        id: 'ot_2',
        userId,
        amount: 1200,
        category: 'Education',
        paymentMethod: 'Credit Card',
        merchantName: 'Coursera Inc.',
        dateTime: '2026-05-10T10:15:00Z',
        notes: 'AI Machine Learning specialization enrollment'
      },
      {
        id: 'ot_3',
        userId,
        amount: 85,
        category: 'Travel',
        paymentMethod: 'Wallet',
        merchantName: 'Uber Rides',
        dateTime: '2026-05-18T08:45:00Z',
        notes: 'Office commute during rainstorm'
      },
      {
        id: 'ot_4',
        userId,
        amount: 350,
        category: 'Bills',
        paymentMethod: 'Net Banking',
        merchantName: 'City Power & Grid',
        dateTime: '2026-05-05T14:00:00Z',
        notes: 'Monthly electricity bill utility'
      },
      {
        id: 'ot_5',
        userId,
        amount: 15,
        category: 'Subscriptions',
        paymentMethod: 'UPI',
        merchantName: 'Spotify Music',
        dateTime: '2026-05-02T06:00:00Z',
        notes: 'Spotify Premium subscription'
      },
      {
        id: 'ot_6',
        userId,
        amount: 150,
        category: 'Shopping',
        paymentMethod: 'Debit Card',
        merchantName: 'Nike Retail',
        dateTime: '2026-05-15T16:30:00Z',
        notes: 'New training sneakers'
      },
      // Last month records for comparative graphs
      {
        id: 'ot_px1',
        userId,
        amount: 110,
        category: 'Food',
        paymentMethod: 'UPI',
        merchantName: 'Swiggy Food',
        dateTime: '2026-04-22T20:10:00Z',
        notes: 'April gourmet burger order'
      },
      {
        id: 'ot_px2',
        userId,
        amount: 450,
        category: 'Bills',
        paymentMethod: 'Net Banking',
        merchantName: 'Home Broadband WiFi',
        dateTime: '2026-04-05T09:00:00Z',
        notes: 'Monthly internet bill'
      },
      {
        id: 'ot_px3',
        userId,
        amount: 320,
        category: 'Shopping',
        paymentMethod: 'Credit Card',
        merchantName: 'Amazon Retail',
        dateTime: '2026-04-12T13:45:00Z',
        notes: 'Ergonomic keyboard buy'
      }
    ];
    setLocalStorageItem(`fin_online_${userId}`, onlineTransactions);

    // Seed Offline Expenses
    const offlineExpenses: OfflineCashExpense[] = [
      {
        id: 'cl_1',
        userId,
        amount: 35,
        category: 'Food',
        placeName: 'Central Fruit & Farmers Market',
        date: '2026-05-24',
        notes: 'Fresh apples, bananas, organic berries'
      },
      {
        id: 'cl_2',
        userId,
        amount: 18,
        category: 'Travel',
        placeName: 'Metro Transit Ticket Counter',
        date: '2026-05-20',
        notes: 'Weekly local train commuter tokens'
      },
      {
        id: 'cl_3',
        userId,
        amount: 120,
        category: 'Entertainment',
        placeName: 'Lakeside Cinema Lounge',
        date: '2026-05-16',
        notes: 'IMAX film tickets and concessions with friends'
      },
      {
        id: 'cl_4',
        userId,
        amount: 45,
        category: 'Health',
        placeName: 'Corner Drugs Pharmacy',
        date: '2026-05-08',
        notes: 'Multivitamins and cold medicine'
      },
      // Previous month offline cash expenses
      {
        id: 'cl_px1',
        userId,
        amount: 60,
        category: 'Food',
        placeName: 'Traditional Bakeries',
        date: '2026-04-20',
        notes: 'Artisan sourdough pastries'
      },
      {
        id: 'cl_px2',
        userId,
        amount: 55,
        category: 'Others',
        placeName: 'Neighborhood Laundry Service',
        date: '2026-04-15',
        notes: 'Dry cleaning business jackets'
      }
    ];
    setLocalStorageItem(`fin_offline_${userId}`, offlineExpenses);

    // Seed Budgets
    const budget: Budget = {
      id: 'bd_1',
      userId,
      month: curYearMonth,
      limitAmount: 3000,
      categoryLimits: {
        'Food': 400,
        'Shopping': 500,
        'Travel': 200,
        'Entertainment': 300,
        'Bills': 600,
        'Health': 150
      }
    };
    setLocalStorageItem(`fin_budgets_${userId}`, [budget]);

    // Seed Savings Goals
    const savingsGoals: SavingsGoal[] = [
      {
        id: 'sg_1',
        userId,
        name: 'Emergency Nest-Egg Shield',
        targetAmount: 10000,
        currentAmount: 4200,
        deadline: '2026-12-31'
      },
      {
        id: 'sg_2',
        userId,
        name: 'Japan Autumn Exploration Cruise',
        targetAmount: 5000,
        currentAmount: 1750,
        deadline: '2026-10-15'
      }
    ];
    setLocalStorageItem(`fin_goals_${userId}`, savingsGoals);

    // Seed Notifications
    const notifications: FinanceNotification[] = [
      {
        id: 'nt_1',
        userId,
        type: 'budget_alert',
        title: 'Budget Alert: Food Threshold Reached',
        message: 'Your dining expenditures are at 93% of your designated Food monthly limit of $400.',
        dateTime: '2026-05-24T20:00:00Z',
        isRead: false
      },
      {
        id: 'nt_2',
        userId,
        type: 'bill_reminder',
        title: 'Impending Subscription Renewal Reminder',
        message: 'Your Spotify Premium billing ($15.00) is scheduled to refresh on 2026-06-02.',
        dateTime: '2026-05-23T09:00:00Z',
        isRead: true
      },
      {
        id: 'nt_3',
        userId,
        type: 'savings_reminder',
        title: 'Emergency Goal Progress Milestone',
        message: 'Excellent consistency! You hit 42% of your Emergency Fund goal milestone.',
        dateTime: '2026-05-15T18:00:00Z',
        isRead: true
      }
    ];
    setLocalStorageItem(`fin_notifications_${userId}`, notifications);

    localStorage.setItem(`fin_seeded_${userId}`, 'true');
  }

  // --- CRUD API OPERATORS ---

  // Incomes
  static getIncomes(userId: string): Income[] {
    return getLocalStorageItem<Income[]>(`fin_incomes_${userId}`, []);
  }

  static addIncome(userId: string, income: Omit<Income, 'id' | 'userId'>): Income {
    const list = this.getIncomes(userId);
    const newItem: Income = {
      id: 'inc_' + Math.random().toString(36).substr(2, 9),
      userId,
      ...income
    };
    list.push(newItem);
    setLocalStorageItem(`fin_incomes_${userId}`, list);
    return newItem;
  }

  static updateIncome(userId: string, id: string, updated: Omit<Income, 'id' | 'userId'>): Income {
    let list = this.getIncomes(userId);
    const item = list.find(x => x.id === id);
    if (!item) throw new Error('Income not found');
    const index = list.findIndex(x => x.id === id);
    list[index] = { ...item, ...updated };
    setLocalStorageItem(`fin_incomes_${userId}`, list);
    return list[index];
  }

  static deleteIncome(userId: string, id: string): void {
    let list = this.getIncomes(userId);
    list = list.filter(x => x.id !== id);
    setLocalStorageItem(`fin_incomes_${userId}`, list);
  }

  // Online Transactions
  static getOnlineTransactions(userId: string): OnlineTransaction[] {
    return getLocalStorageItem<OnlineTransaction[]>(`fin_online_${userId}`, []);
  }

  static addOnlineTransaction(userId: string, tx: Omit<OnlineTransaction, 'id' | 'userId'>): OnlineTransaction {
    const list = this.getOnlineTransactions(userId);
    const newItem: OnlineTransaction = {
      id: 'ot_' + Math.random().toString(36).substr(2, 9),
      userId,
      ...tx
    };
    list.push(newItem);
    setLocalStorageItem(`fin_online_${userId}`, list);
    this.checkBudgetsOverspending(userId, tx.category, tx.amount);
    return newItem;
  }

  static updateOnlineTransaction(userId: string, id: string, updated: Omit<OnlineTransaction, 'id' | 'userId'>): OnlineTransaction {
    let list = this.getOnlineTransactions(userId);
    const item = list.find(x => x.id === id);
    if (!item) throw new Error('Transaction not found');
    const index = list.findIndex(x => x.id === id);
    list[index] = { ...item, ...updated };
    setLocalStorageItem(`fin_online_${userId}`, list);
    return list[index];
  }

  static deleteOnlineTransaction(userId: string, id: string): void {
    let list = this.getOnlineTransactions(userId);
    list = list.filter(x => x.id !== id);
    setLocalStorageItem(`fin_online_${userId}`, list);
  }

  // Offline Cash Expenses
  static getOfflineExpenses(userId: string): OfflineCashExpense[] {
    return getLocalStorageItem<OfflineCashExpense[]>(`fin_offline_${userId}`, []);
  }

  static addOfflineExpense(userId: string, tx: Omit<OfflineCashExpense, 'id' | 'userId'>): OfflineCashExpense {
    const list = this.getOfflineExpenses(userId);
    const newItem: OfflineCashExpense = {
      id: 'cl_' + Math.random().toString(36).substr(2, 9),
      userId,
      ...tx
    };
    list.push(newItem);
    setLocalStorageItem(`fin_offline_${userId}`, list);
    this.checkBudgetsOverspending(userId, tx.category, tx.amount);
    return newItem;
  }

  static updateOfflineExpense(userId: string, id: string, updated: Omit<OfflineCashExpense, 'id' | 'userId'>): OfflineCashExpense {
    let list = this.getOfflineExpenses(userId);
    const item = list.find(x => x.id === id);
    if (!item) throw new Error('Expense not found');
    const index = list.findIndex(x => x.id === id);
    list[index] = { ...item, ...updated };
    setLocalStorageItem(`fin_offline_${userId}`, list);
    return list[index];
  }

  static deleteOfflineExpense(userId: string, id: string): void {
    let list = this.getOfflineExpenses(userId);
    list = list.filter(x => x.id !== id);
    setLocalStorageItem(`fin_offline_${userId}`, list);
  }

  // Budgets
  static getBudgets(userId: string): Budget[] {
    return getLocalStorageItem<Budget[]>(`fin_budgets_${userId}`, []);
  }

  static saveBudget(userId: string, budget: Omit<Budget, 'id' | 'userId'>): Budget {
    const list = this.getBudgets(userId);
    const index = list.findIndex(b => b.month === budget.month);
    
    if (index >= 0) {
      list[index] = { ...list[index], ...budget };
      setLocalStorageItem(`fin_budgets_${userId}`, list);
      return list[index];
    } else {
      const newItem: Budget = {
        id: 'bd_' + Math.random().toString(36).substr(2, 9),
        userId,
        ...budget
      };
      list.push(newItem);
      setLocalStorageItem(`fin_budgets_${userId}`, list);
      return newItem;
    }
  }

  // Savings Goals
  static getSavingsGoals(userId: string): SavingsGoal[] {
    return getLocalStorageItem<SavingsGoal[]>(`fin_goals_${userId}`, []);
  }

  static addSavingsGoal(userId: string, goal: Omit<SavingsGoal, 'id' | 'userId'>): SavingsGoal {
    const list = this.getSavingsGoals(userId);
    const newItem: SavingsGoal = {
      id: 'sg_' + Math.random().toString(36).substr(2, 9),
      userId,
      ...goal
    };
    list.push(newItem);
    setLocalStorageItem(`fin_goals_${userId}`, list);
    return newItem;
  }

  static updateSavingsGoal(userId: string, id: string, updated: Omit<SavingsGoal, 'id' | 'userId'>): SavingsGoal {
    let list = this.getSavingsGoals(userId);
    const index = list.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    list[index] = { ...list[index], ...updated };
    setLocalStorageItem(`fin_goals_${userId}`, list);
    return list[index];
  }

  static deleteSavingsGoal(userId: string, id: string): void {
    let list = this.getSavingsGoals(userId);
    list = list.filter(g => g.id !== id);
    setLocalStorageItem(`fin_goals_${userId}`, list);
  }

  // Categories
  static getCategories(userId: string): Category[] {
    const custom = getLocalStorageItem<Category[]>(`fin_categories_${userId}`, []);
    if (custom.length === 0) {
      // Seed predefined
      const initial: Category[] = PREDEFINED_CATEGORIES.map((c, i) => ({
        id: `cat_${i}`,
        userId,
        ...c
      }));
      setLocalStorageItem(`fin_categories_${userId}`, initial);
      return initial;
    }
    return custom;
  }

  static addCategory(userId: string, name: string, iconName: string, color: string): Category {
    const list = this.getCategories(userId);
    const newItem: Category = {
      id: 'cat_' + Math.random().toString(36).substr(2, 9),
      userId,
      name,
      iconName,
      color,
      isCustom: true
    };
    list.push(newItem);
    setLocalStorageItem(`fin_categories_${userId}`, list);
    return newItem;
  }

  static deleteCategory(userId: string, id: string): void {
    let list = this.getCategories(userId);
    // Don't delete predefined
    list = list.filter(c => c.id !== id || !c.isCustom);
    setLocalStorageItem(`fin_categories_${userId}`, list);
  }

  // Notifications
  static getNotifications(userId: string): FinanceNotification[] {
    return getLocalStorageItem<FinanceNotification[]>(`fin_notifications_${userId}`, []);
  }

  static markAllNotificationsRead(userId: string): void {
    const list = this.getNotifications(userId);
    list.forEach(n => n.isRead = true);
    setLocalStorageItem(`fin_notifications_${userId}`, list);
  }

  static addNotification(userId: string, notification: Omit<FinanceNotification, 'id' | 'userId' | 'isRead' | 'dateTime'>): FinanceNotification {
    const list = this.getNotifications(userId);
    const newItem: FinanceNotification = {
      id: 'nt_' + Math.random().toString(36).substr(2, 9),
      userId,
      ...notification,
      dateTime: new Date().toISOString(),
      isRead: false
    };
    list.push(newItem);
    setLocalStorageItem(`fin_notifications_${userId}`, list);
    return newItem;
  }

  // Alert system for overspending
  private static checkBudgetsOverspending(userId: string, category: string, additionAmount: number): void {
    const activeMonth = '2026-05';
    const budgets = this.getBudgets(userId);
    const activeBudget = budgets.find(b => b.month === activeMonth);
    if (!activeBudget) return;

    // Calculate sum of category online + offline this month
    const online = this.getOnlineTransactions(userId).filter(x => x.category === category && x.dateTime.startsWith(activeMonth));
    const offline = this.getOfflineExpenses(userId).filter(x => x.category === category && x.date.startsWith(activeMonth));
    const totalSpent = online.reduce((s, x) => s + x.amount, 0) + offline.reduce((s, x) => s + x.amount, 0);

    const categoryLimit = activeBudget.categoryLimits[category];
    if (categoryLimit) {
      const percentageBefore = (totalSpent - additionAmount) / categoryLimit;
      const percentageAfter = totalSpent / categoryLimit;
      
      if (percentageAfter >= 1.0 && percentageBefore < 1.0) {
        this.addNotification(userId, {
          type: 'budget_alert',
          title: `Limit Breached: ${category}`,
          message: `Your total spending for ${category} this month has exceeded your set budget limit of $${categoryLimit} (Spent: $${totalSpent.toFixed(2)}).`
        });
      } else if (percentageAfter >= 0.85 && percentageBefore < 0.85) {
        this.addNotification(userId, {
          type: 'budget_alert',
          title: `Budget Limit Warning: ${category}`,
          message: `Your total spending for ${category} has reached ${(percentageAfter * 100).toFixed(0)}% of your monthly budget of $${categoryLimit}.`
        });
      }
    }

    // Check overall limit
    const totalMonthSpentSum = 
      this.getOnlineTransactions(userId)
        .filter(x => x.dateTime.startsWith(activeMonth))
        .reduce((s, x) => s + x.amount, 0) +
      this.getOfflineExpenses(userId)
        .filter(x => x.date.startsWith(activeMonth))
        .reduce((s, x) => s + x.amount, 0);

    const overallLimit = activeBudget.limitAmount;
    if (overallLimit) {
      const parentPercentBefore = (totalMonthSpentSum - additionAmount) / overallLimit;
      const parentPercentAfter = totalMonthSpentSum / overallLimit;

      if (parentPercentAfter >= 1.0 && parentPercentBefore < 1.0) {
        this.addNotification(userId, {
          type: 'budget_alert',
          title: `Critical Alerts: Overall Budget Violated`,
          message: `Warning: Your cumulative monthly expenditure is now at $${totalMonthSpentSum.toFixed(2)}, breaking your total Monthly Budget of $${overallLimit}.`
        });
      } else if (parentPercentAfter >= 0.90 && parentPercentBefore < 0.90) {
        this.addNotification(userId, {
          type: 'budget_alert',
          title: `Approaching Total Monthly Budget Cap`,
          message: `Careful: Your aggregate spending this month is at ${(parentPercentAfter * 100).toFixed(0)}% of your total budget wall ($${overallLimit}).`
        });
      }
    }
  }

  // Generate direct printable Supabase-ready PostgreSQL schema
  static getSupabasePostgresSchemaCode(): string {
    return `-- =========================================================
-- SUPABASE POSTGRESQL SCHEMA DESIGN FOR FINANCE APPLICATION
-- Enable Row Level Security (RLS) and create isolation policies.
-- =========================================================

-- 1. Create Profiles/Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to sync auth.users into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create Categories Table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'HelpCircle',
  color TEXT NOT NULL DEFAULT 'slate',
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can query categories they own or standard system ones"
  ON public.categories FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert custom categories"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can modify fields of own categories"
  ON public.categories FOR ALL
  USING (user_id = auth.uid());


-- 3. Create Incomes Table
CREATE TABLE public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  source TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their personal incomes"
  ON public.incomes FOR ALL
  USING (user_id = auth.uid());


-- 4. Create Online Transactions Table
CREATE TABLE public.online_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Debit Card', 'Credit Card', 'Wallet', 'Net Banking')),
  merchant_name TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.online_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their online transactions"
  ON public.online_transactions FOR ALL
  USING (user_id = auth.uid());


-- 5. Create Offline Expenses Table
CREATE TABLE public.offline_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  place_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.offline_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their cash expenses"
  ON public.offline_expenses FOR ALL
  USING (user_id = auth.uid());


-- 6. Create Budgets Table
CREATE TABLE public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format YYYY-MM
  limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount >= 0),
  category_limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, month)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own monthly budgets"
  ON public.budgets FOR ALL
  USING (user_id = auth.uid());


-- 7. Create Savings Goals Table
CREATE TABLE public.savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount >= 0),
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their savings targets"
  ON public.savings_goals FOR ALL
  USING (user_id = auth.uid());


-- 8. Create Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  date_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can interact with their own alerts"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());


-- Create performance tuning indexes on highly queried filters
CREATE INDEX idx_ot_user_date ON public.online_transactions(user_id, date_time DESC);
CREATE INDEX idx_col_user_date ON public.offline_expenses(user_id, date DESC);
CREATE INDEX idx_inc_user_date ON public.incomes(user_id, date DESC);
`;
  }
}
