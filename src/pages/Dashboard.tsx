import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Users, LogOut, Smartphone, DollarSign, TrendingUp, ShoppingCart, AlertTriangle, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { StatCard, QuickAction } from '@/components/Dashboard/DashboardStats';
import { SalesChart, TopProductsChart } from '@/components/Dashboard/AnalyticsChart';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { formatCurrency } from '@/lib/analytics';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();
  const { currentStore } = useStore();
  const { todayStats, weeklySales, topProducts, monthComparison, isLoading } = useDashboardAnalytics();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {currentStore?.name || 'Sistem Kasir'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="rounded-xl bg-muted/50 backdrop-blur-sm p-1">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Penjualan Hari Ini"
                value={todayStats.todayRevenue}
                icon={DollarSign}
                gradient="from-success/5 to-success/10"
                iconBg="bg-success"
                format="currency"
              />
              <StatCard
                title="Keuntungan Hari Ini"
                value={todayStats.todayProfit}
                icon={TrendingUp}
                gradient="from-primary/5 to-primary/10"
                iconBg="bg-primary"
                format="currency"
              />
              <StatCard
                title="Total Transaksi"
                value={todayStats.todayTransactions}
                icon={ShoppingCart}
                gradient="from-accent/5 to-accent/10"
                iconBg="bg-accent"
                format="number"
              />
              <StatCard
                title="Stok Menipis"
                value={todayStats.lowStockCount}
                icon={AlertTriangle}
                gradient="from-warning/5 to-warning/10"
                iconBg="bg-warning"
                format="number"
              />
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Akses Cepat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickAction
                  title="Kasir POS"
                  description="Akses sistem Point of Sale"
                  icon={Store}
                  onClick={() => navigate('/pos')}
                  iconColor="bg-primary"
                />
                <QuickAction
                  title="PPOB"
                  description="Layanan pembayaran online"
                  icon={Smartphone}
                  onClick={() => navigate('/ppob')}
                  iconColor="bg-accent"
                />
                {isAdmin && (
                  <QuickAction
                    title="Admin Panel"
                    description="Kelola user dan sistem"
                    icon={Users}
                    onClick={() => navigate('/admin/users')}
                    iconColor="bg-secondary"
                  />
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="rounded-2xl shadow-sm border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Aktivitas Terkini</h3>
                <div className="space-y-3">
                  {weeklySales.slice(-3).reverse().map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{day.date}</p>
                        <p className="text-sm text-muted-foreground">{day.transactions} transaksi</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(day.revenue)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Month Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl shadow-sm border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Bulan Ini</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthComparison.currentMonth)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl shadow-sm border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Bulan Lalu</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthComparison.previousMonth)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl shadow-sm border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Pertumbuhan</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${monthComparison.growthRate >= 0 ? 'text-success' : 'text-error'}`}>
                      {monthComparison.growthRate}%
                    </p>
                    {monthComparison.growthRate >= 0 ? (
                      <ArrowUp className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-error" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesChart data={weeklySales} />
              <TopProductsChart data={topProducts} />
            </div>

            {/* Export Report */}
            <Card className="rounded-2xl shadow-sm border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Laporan Lengkap</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Download laporan detail untuk analisis lebih lanjut
                    </p>
                  </div>
                  <Button className="rounded-xl" onClick={() => navigate('/reports')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Laporan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
