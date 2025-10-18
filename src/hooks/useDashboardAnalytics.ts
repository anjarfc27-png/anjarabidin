import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import { getDateRange } from '@/lib/analytics';

export interface DashboardStats {
  todayRevenue: number;
  todayProfit: number;
  todayTransactions: number;
  lowStockCount: number;
}

export interface WeeklySalesData {
  date: string;
  revenue: number;
  transactions: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface MonthComparison {
  currentMonth: number;
  previousMonth: number;
  growthRate: number;
}

export const useDashboardAnalytics = () => {
  const { currentStore } = useStore();

  const { data: todayStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', currentStore?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!currentStore?.id) {
        return { todayRevenue: 0, todayProfit: 0, todayTransactions: 0, lowStockCount: 0 };
      }

      const today = new Date().toISOString().split('T')[0];

      // Get today's receipts
      const { data: receipts } = await supabase
        .from('receipts')
        .select('total, profit')
        .eq('user_id', currentStore.owner_id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const todayRevenue = receipts?.reduce((sum, r) => sum + (Number(r.total) || 0), 0) || 0;
      const todayProfit = receipts?.reduce((sum, r) => sum + (Number(r.profit) || 0), 0) || 0;

      // Get low stock products (stock <= 5 or less than min_stock if specified)
      const { data: products } = await supabase
        .from('products')
        .select('stock')
        .eq('store_id', currentStore.id);

      const lowStockCount = products?.filter(p => p.stock <= 5).length || 0;

      return {
        todayRevenue,
        todayProfit,
        todayTransactions: receipts?.length || 0,
        lowStockCount,
      };
    },
    enabled: !!currentStore?.id,
  });

  const { data: weeklySales, isLoading: weeklyLoading } = useQuery({
    queryKey: ['weekly-sales', currentStore?.id],
    queryFn: async (): Promise<WeeklySalesData[]> => {
      if (!currentStore?.id) return [];

      const { start } = getDateRange(7);
      const { data } = await supabase
        .from('receipts')
        .select('created_at, total')
        .eq('user_id', currentStore.owner_id)
        .gte('created_at', start.toISOString())
        .order('created_at', { ascending: true });

      const salesByDate = new Map<string, { revenue: number; count: number }>();
      
      // Initialize all 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        salesByDate.set(dateStr, { revenue: 0, count: 0 });
      }

      data?.forEach(r => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        const current = salesByDate.get(date) || { revenue: 0, count: 0 };
        salesByDate.set(date, {
          revenue: current.revenue + (Number(r.total) || 0),
          count: current.count + 1,
        });
      });

      return Array.from(salesByDate.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        revenue: data.revenue,
        transactions: data.count,
      }));
    },
    enabled: !!currentStore?.id,
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['top-products', currentStore?.id],
    queryFn: async (): Promise<TopProduct[]> => {
      if (!currentStore?.id) return [];

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      // Get receipt items for this month
      const { data: receipts } = await supabase
        .from('receipts')
        .select('id, created_at')
        .eq('user_id', currentStore.owner_id)
        .gte('created_at', firstDayOfMonth.toISOString());

      if (!receipts || receipts.length === 0) return [];

      const receiptIds = receipts.map(r => r.id);

      const { data: items } = await supabase
        .from('receipt_items')
        .select('product_name, quantity, unit_price')
        .in('receipt_id', receiptIds);

      const productSales = new Map<string, { quantity: number; revenue: number }>();

      items?.forEach(item => {
        const current = productSales.get(item.product_name) || { quantity: 0, revenue: 0 };
        productSales.set(item.product_name, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (Number(item.unit_price) * item.quantity),
        });
      });

      return Array.from(productSales.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
    enabled: !!currentStore?.id,
  });

  const { data: monthComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['month-comparison', currentStore?.id],
    queryFn: async (): Promise<MonthComparison> => {
      if (!currentStore?.id) {
        return { currentMonth: 0, previousMonth: 0, growthRate: 0 };
      }

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const [currentData, previousData] = await Promise.all([
        supabase
          .from('receipts')
          .select('total')
          .eq('user_id', currentStore.owner_id)
          .gte('created_at', currentMonthStart.toISOString()),
        supabase
          .from('receipts')
          .select('total')
          .eq('user_id', currentStore.owner_id)
          .gte('created_at', previousMonthStart.toISOString())
          .lte('created_at', previousMonthEnd.toISOString()),
      ]);

      const currentMonth = currentData.data?.reduce((sum, r) => sum + (Number(r.total) || 0), 0) || 0;
      const previousMonth = previousData.data?.reduce((sum, r) => sum + (Number(r.total) || 0), 0) || 0;

      const growthRate =
        previousMonth === 0
          ? currentMonth > 0 ? 100 : 0
          : Math.round(((currentMonth - previousMonth) / previousMonth) * 100);

      return { currentMonth, previousMonth, growthRate };
    },
    enabled: !!currentStore?.id,
  });

  return {
    todayStats: todayStats || { todayRevenue: 0, todayProfit: 0, todayTransactions: 0, lowStockCount: 0 },
    weeklySales: weeklySales || [],
    topProducts: topProducts || [],
    monthComparison: monthComparison || { currentMonth: 0, previousMonth: 0, growthRate: 0 },
    isLoading: statsLoading || weeklyLoading || productsLoading || comparisonLoading,
  };
};
