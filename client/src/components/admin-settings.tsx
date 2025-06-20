import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { 
  Settings, 
  Store, 
  Mail, 
  Globe, 
  Shield, 
  Database, 
  Bell,
  Palette,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  domainUrl: string;
  enableAnalytics: boolean;
  enableEmailNotifications: boolean;
  maintenanceMode: boolean;
  maxUploadSize: number;
  allowGuestCheckout: boolean;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Audio Motívate',
    siteDescription: 'Tu plataforma de contenido motivacional premium sin anuncios',
    contactEmail: 'info.audiomotivate@gmail.com',
    domainUrl: 'www.audiomotivate.com',
    enableAnalytics: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
    maxUploadSize: 100,
    allowGuestCheckout: true
  });

  // Load current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    retry: false,
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      return apiRequest('PUT', '/api/admin/settings', newSettings);
    },
    onSuccess: (response) => {
      // Update local state with saved settings
      if (response.settings) {
        setSettings(response.settings);
      }
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      setExportStatus('exporting');
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error en la exportación');
      }
      
      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `audiomotivate-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Get the data and create download
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return data;
    },
    onSuccess: (data) => {
      setExportStatus('success');
      toast({
        title: "Exportación completada",
        description: `${data.products.total} productos exportados exitosamente`,
      });
    },
    onError: () => {
      setExportStatus('error');
      toast({
        title: "Error en exportación",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      });
    },
  });

  const clearAnalyticsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/admin/analytics/clear');
    },
    onSuccess: () => {
      toast({
        title: "Datos de análisis eliminados",
        description: "Se han borrado todos los datos de análisis",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleExportData = () => {
    exportDataMutation.mutate();
  };

  const handleClearAnalytics = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos de análisis? Esta acción no se puede deshacer.')) {
      clearAnalyticsMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-3">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
        <p className="text-muted-foreground">Administra los ajustes generales de Audio Motívate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información del Sitio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Sitio</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                placeholder="Audio Motívate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                placeholder="Descripción de tu plataforma"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email de Contacto</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  placeholder="contacto@audiomotivate.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dominio Principal</label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <Input
                  value={settings.domainUrl}
                  onChange={(e) => setSettings({...settings, domainUrl: e.target.value})}
                  placeholder="www.audiomotivate.com"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dominio donde se alojará la versión final de la plataforma
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Funcionalidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Análisis de Tráfico</label>
                <p className="text-sm text-muted-foreground">
                  Activar seguimiento de visitantes y métricas
                </p>
              </div>
              <Switch
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) => setSettings({...settings, enableAnalytics: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Notificaciones por Email</label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones de nuevas ventas
                </p>
              </div>
              <Switch
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, enableEmailNotifications: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Compra como Invitado</label>
                <p className="text-sm text-muted-foreground">
                  Permitir compras sin registro previo
                </p>
              </div>
              <Switch
                checked={settings.allowGuestCheckout}
                onCheckedChange={(checked) => setSettings({...settings, allowGuestCheckout: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Modo Mantenimiento</label>
                <p className="text-sm text-muted-foreground">
                  Mostrar página de mantenimiento a visitantes
                </p>
              </div>
              <div className="flex items-center gap-2">
                {settings.maintenanceMode && (
                  <Badge variant="destructive">Activo</Badge>
                )}
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tamaño Máximo de Archivo (MB)</label>
              <Input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => setSettings({...settings, maxUploadSize: parseInt(e.target.value)})}
                min="1"
                max="500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Límite para subir archivos al servidor
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón Guardar Configuración */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Guardar Configuración</h3>
              <p className="text-sm text-muted-foreground">
                Aplicar todos los cambios realizados en la configuración
              </p>
            </div>
            <Button 
              onClick={handleSaveSettings} 
              disabled={saveSettingsMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saveSettingsMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Herramientas de Administración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Herramientas de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exportar Datos */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium">Exportar Datos</h4>
                <p className="text-sm text-muted-foreground">
                  Descargar todos los productos, ventas y análisis en formato JSON
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={exportDataMutation.isPending}
              className="flex items-center gap-2"
            >
              {exportStatus === 'exporting' && <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />}
              {exportStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {exportStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
              {exportStatus === 'idle' && <Download className="h-4 w-4" />}
              {exportDataMutation.isPending ? 'Exportando...' : 'Exportar'}
            </Button>
          </div>

          {/* Limpiar Datos de Análisis */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">Limpiar Datos de Análisis</h4>
                <p className="text-sm text-red-700">
                  Eliminar todos los datos de visitantes, ventas y métricas (acción irreversible)
                </p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleClearAnalytics}
              disabled={clearAnalyticsMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {clearAnalyticsMutation.isPending ? 'Eliminando...' : 'Limpiar Datos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium text-green-900">Base de Datos</p>
              <p className="text-sm text-green-700">Conectada</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium text-green-900">API</p>
              <p className="text-sm text-green-700">Funcionando</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Bell className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium text-green-900">Notificaciones</p>
              <p className="text-sm text-green-700">Activas</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Palette className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-blue-900">Tema</p>
              <p className="text-sm text-blue-700">Audio Motívate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}