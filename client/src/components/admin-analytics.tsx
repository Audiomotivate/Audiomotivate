import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
  Minus,
  MapPin,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface DetailedAnalyticsData {
  // Métricas por tiempo
  hourlyStats: Array<{
    hour: string;
    visitors: number;
    sales: number;
  }>;
  // Dispositivos
  deviceStats: Array<{
    device: string;
    percentage: number;
    visitors: number;
  }>;
  // Navegadores
  browserStats: Array<{
    browser: string;
    percentage: number;
    visitors: number;
  }>;
  // Países detallados
  countryStats: Array<{
    country: string;
    visitors: number;
    sales: number;
    revenue: number;
  }>;
  // Conversión por página
  conversionStats: Array<{
    page: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }>;
  // Métricas de retención
  retentionStats: {
    newVisitors: number;
    returningVisitors: number;
    averageSessionsPerUser: number;
  };
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');

  const { data: analytics, isLoading } = useQuery<DetailedAnalyticsData>({
    queryKey: ['/api/admin/analytics/detailed', timeRange],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Análisis Detallado</h2>
          <p className="text-muted-foreground">Métricas avanzadas y análisis profundo</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-primary">15,847</p>
                <p className="text-xs text-muted-foreground">Visitantes Totales</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-900">23</p>
                <p className="text-xs text-muted-foreground">Países Alcanzados</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold text-purple-900">4:32</p>
                <p className="text-xs text-muted-foreground">Duración Promedio</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
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

      {/* Análisis por Hora */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tráfico por Hora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Gráfico de tráfico por horas</p>
              <p className="text-sm">Picos de actividad durante el día</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispositivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Análisis por Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Escritorio</span>
              </div>
              <div className="text-right">
                <span className="font-medium">65%</span>
                <p className="text-xs text-muted-foreground">2,340 visitantes</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Móvil</span>
              </div>
              <div className="text-right">
                <span className="font-medium">28%</span>
                <p className="text-xs text-muted-foreground">1,008 visitantes</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tablet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tablet</span>
              </div>
              <div className="text-right">
                <span className="font-medium">7%</span>
                <p className="text-xs text-muted-foreground">252 visitantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navegadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Navegadores Más Usados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Chrome</span>
              <div className="text-right">
                <span className="font-medium">68%</span>
                <p className="text-xs text-muted-foreground">2,448 visitantes</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Safari</span>
              <div className="text-right">
                <span className="font-medium">18%</span>
                <p className="text-xs text-muted-foreground">648 visitantes</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Firefox</span>
              <div className="text-right">
                <span className="font-medium">9%</span>
                <p className="text-xs text-muted-foreground">324 visitantes</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Edge</span>
              <div className="text-right">
                <span className="font-medium">5%</span>
                <p className="text-xs text-muted-foreground">180 visitantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis por País */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Rendimiento por País
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">México</p>
                <p className="text-sm text-muted-foreground">2,156 visitantes</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(89400)}</p>
                <p className="text-sm text-muted-foreground">67 ventas</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">Colombia</p>
                <p className="text-sm text-muted-foreground">543 visitantes</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(23100)}</p>
                <p className="text-sm text-muted-foreground">18 ventas</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">Argentina</p>
                <p className="text-sm text-muted-foreground">398 visitantes</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(15600)}</p>
                <p className="text-sm text-muted-foreground">12 ventas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversión por Página */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tasa de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">Audiolibros</p>
                <p className="text-sm text-muted-foreground">1,234 visitantes</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">5.2%</p>
                <p className="text-sm text-muted-foreground">64 conversiones</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">Audios</p>
                <p className="text-sm text-muted-foreground">892 visitantes</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">4.1%</p>
                <p className="text-sm text-muted-foreground">37 conversiones</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">Guías</p>
                <p className="text-sm text-muted-foreground">567 visitantes</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-yellow-600">2.8%</p>
                <p className="text-sm text-muted-foreground">16 conversiones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Retención */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visitantes Nuevos</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-muted-foreground mt-1">79% del total</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visitantes Recurrentes</p>
                <p className="text-2xl font-bold">753</p>
                <p className="text-xs text-muted-foreground mt-1">21% del total</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sesiones Promedio</p>
                <p className="text-2xl font-bold">2.3</p>
                <p className="text-xs text-muted-foreground mt-1">por usuario</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}