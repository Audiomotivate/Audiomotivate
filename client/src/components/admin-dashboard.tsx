import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  ShoppingCart, 
  DollarSign,
  Clock,
  Globe,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { queryClient } from '../lib/queryClient';

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  totalSales: number;
  salesCount: number;
  avgSessionDuration: number;
  bounceRate: number;
  todayVisitors: number;
  todayPageViews: number;
  todaySales: number;
  todaySalesCount: number;
  topProducts: Array<{
    id: number;
    title: string;
    salesCount: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    visitors: number;
    sales: number;
    revenue: number;
  }>;
  recentSales: Array<{
    id: number;
    productTitle: string;
    amount: number;
    customerEmail: string;
    createdAt: string;
  }>;
  topLocations: Array<{
    country: string;
    city: string;
    visitors: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  subtitle?: string;
}

function MetricCard({ title, value, change, icon, subtitle }: MetricCardProps) {
  const getChangeIcon = () => {
    if (!change) return null;
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className={`flex items-center mt-1 text-xs ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="ml-1">
                  {Math.abs(change)}% vs ayer
                </span>
              </div>
            )}
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics', timeRange],
  });

  // Function to generate mock data for development
  const generateMockData = async () => {
    try {
      await fetch('/api/admin/generate-mock-data', { method: 'POST' });
      // Refresh analytics data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
    } catch (error) {
      console.error('Error generating mock data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard General</h2>
          <p className="text-muted-foreground">Resumen ejecutivo de tu negocio</p>
          {analytics && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {analytics.totalVisitors.toLocaleString()} visitantes totales
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  {analytics.totalPageViews.toLocaleString()} vistas de página
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateMockData}
            className="mr-4"
          >
            Generar Datos Demo
          </Button>
          {[
            { value: '24h', label: '24h' },
            { value: '7d', label: '7 días' },
            { value: '30d', label: '30 días' },
            { value: '90d', label: '90 días' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Visitantes Hoy"
          value={analytics?.todayVisitors?.toLocaleString() || '0'}
          change={5.2}
          icon={<Users className="h-6 w-6" />}
          subtitle="Nuevos visitantes hoy"
        />
        <MetricCard
          title="Vistas de Página"
          value={analytics?.totalPageViews?.toLocaleString() || '0'}
          change={8.1}
          icon={<Eye className="h-6 w-6" />}
          subtitle="Total de páginas vistas"
        />
        <MetricCard
          title="Ventas Totales"
          value={formatCurrency(analytics?.totalSales || 0)}
          change={12.3}
          icon={<DollarSign className="h-6 w-6" />}
          subtitle={`${analytics?.salesCount || 0} órdenes`}
        />
        <MetricCard
          title="Duración Promedio"
          value={formatDuration(analytics?.avgSessionDuration || 0)}
          change={-2.1}
          icon={<Clock className="h-6 w-6" />}
          subtitle="Tiempo en el sitio"
        />
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Visitantes Hoy"
          value={analytics?.todayVisitors?.toLocaleString() || '0'}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Vistas Hoy"
          value={analytics?.todayPageViews?.toLocaleString() || '0'}
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          title="Ventas Hoy"
          value={formatCurrency(analytics?.todaySales || 0)}
          icon={<ShoppingCart className="h-5 w-5" />}
          subtitle={`${analytics?.todaySalesCount || 0} órdenes`}
        />
        <MetricCard
          title="Tasa de Rebote"
          value={`${analytics?.bounceRate || 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Resumen de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Productos Más Vendidos</span>
            </div>
            {analytics?.topProducts?.slice(0, 3).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.salesCount} ventas</p>
                  </div>
                </div>
                <span className="font-medium text-sm">{formatCurrency(product.revenue)}</span>
              </div>
            )) || (
              <div className="text-center py-4 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No hay datos de ventas aún</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentSales?.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{sale.productTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.customerEmail} • {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-medium text-sm text-green-600">
                    {formatCurrency(sale.amount)}
                  </span>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Distribución de Ingresos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(Math.round((analytics?.totalSales || 0) * 0.4))}</p>
              <p className="text-sm text-muted-foreground">Audiolibros</p>
              <p className="text-xs text-muted-foreground">40% del total</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(Math.round((analytics?.totalSales || 0) * 0.3))}</p>
              <p className="text-sm text-muted-foreground">Audios</p>
              <p className="text-xs text-muted-foreground">30% del total</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(Math.round((analytics?.totalSales || 0) * 0.2))}</p>
              <p className="text-sm text-muted-foreground">PDFs/Scripts</p>
              <p className="text-xs text-muted-foreground">20% del total</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(Math.round((analytics?.totalSales || 0) * 0.1))}</p>
              <p className="text-sm text-muted-foreground">Guías</p>
              <p className="text-xs text-muted-foreground">10% del total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Rápida de Ubicaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Visitantes por Ubicación (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analytics?.topLocations?.slice(0, 5).map((location, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold">{location.visitors}</span>
                </div>
                <p className="text-sm font-medium">{location.city}</p>
                <p className="text-xs text-muted-foreground">{location.country}</p>
              </div>
            )) || (
              <div className="col-span-5 text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-2" />
                <p>No hay datos de ubicación aún</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}