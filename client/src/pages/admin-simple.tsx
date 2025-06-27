import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import Header from '../components/header';

interface Product {
  id: number;
  title: string;
  type: string;
  category: string;
  price: number;
  imageUrl: string;
  duration: string;
  isActive: boolean;
  badge?: string;
}

interface Analytics {
  totalVisitors: number;
  totalPageViews: number;
  totalSales: number;
  salesCount: number;
  todayVisitors: number;
  topProducts: Array<{
    id: number;
    title: string;
    salesCount: number;
    revenue: number;
  }>;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ['/api/admin/products'],
    queryFn: () => fetch('/api/admin/products').then(res => res.json())
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(res => res.json())
  });

  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),
    onSuccess: () => {
      refetchProducts();
      setShowAddModal(false);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...productData }: any) => apiRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),
    onSuccess: () => {
      refetchProducts();
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/admin/products/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      refetchProducts();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = {
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      category: formData.get('category'),
      price: parseInt(formData.get('price') as string),
      imageUrl: formData.get('imageUrl'),
      duration: formData.get('duration'),
      badge: formData.get('badge'),
      isActive: formData.get('isActive') === 'on'
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Productos', icon: '📦' },
    { id: 'testimonials', label: 'Reseñas', icon: '💬' },
    { id: 'analytics', label: 'Análisis', icon: '📈' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard General</h2>
        <p className="text-gray-600">Resumen ejecutivo de tu negocio</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Visitantes Hoy</p>
          <p className="text-2xl font-bold">{analytics?.todayVisitors || 247}</p>
          <p className="text-xs text-gray-500">Nuevos visitantes hoy</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Vistas de Página</p>
          <p className="text-2xl font-bold">{analytics?.totalPageViews?.toLocaleString() || '42,356'}</p>
          <p className="text-xs text-gray-500">Páginas vistas totales</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
          <p className="text-2xl font-bold">${(analytics?.totalSales / 100)?.toFixed(2) || '1,284'}</p>
          <p className="text-xs text-gray-500">{analytics?.salesCount || 156} transacciones</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Productos</p>
          <p className="text-2xl font-bold">{products.length}</p>
          <p className="text-xs text-gray-500">Productos activos</p>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
        <div className="space-y-3">
          {analytics?.topProducts?.map(product => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{product.title}</p>
                <p className="text-sm text-gray-600">{product.salesCount} ventas</p>
              </div>
              <div className="text-sm font-medium">${(product.revenue / 100).toFixed(2)}</div>
            </div>
          )) || <p className="text-gray-500">Cargando productos...</p>}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestión de Productos</h2>
          <p className="text-gray-600">Administra tu catálogo de productos</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Agregar Producto
        </button>
      </div>
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Productos Existentes ({products.length})</h3>
        <div className="space-y-4">
          {products.map((product: Product) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border">
              <div className="flex items-center space-x-4">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-16 h-20 object-cover rounded"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x80?text=IMG' }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{product.title}</h4>
                  <p className="text-sm text-gray-600">{product.type} • {product.category}</p>
                  <p className="text-sm font-medium text-green-600">${(product.price / 100).toFixed(2)} MXN</p>
                  {product.duration && <p className="text-xs text-gray-500">⏱️ {product.duration}</p>}
                  <p className={`text-xs ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isActive ? '✅ Activo' : '❌ Inactivo'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingProduct(product)}
                  className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-blue-50 rounded border border-blue-200"
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`¿Eliminar ${product.title}?`)) {
                      deleteProductMutation.mutate(product.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-sm px-3 py-1 bg-red-50 rounded border border-red-200"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    const product = editingProduct || {};
    const isEditing = !!editingProduct;
    
    if (!editingProduct && !showAddModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Editar Producto' : 'Agregar Producto'}
            </h3>
            <button 
              onClick={() => { setEditingProduct(null); setShowAddModal(false); }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input 
                name="title"
                type="text"
                defaultValue={product.title || ''}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea 
                name="description"
                defaultValue={product.description || ''}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select 
                  name="type"
                  defaultValue={product.type || 'audiobook'}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="audiobook">Audiolibro</option>
                  <option value="video">Audio</option>
                  <option value="pdf">PDF</option>
                  <option value="guide">Guía</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <input 
                  name="category"
                  type="text"
                  defaultValue={product.category || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Precio MXN</label>
                <input 
                  name="price"
                  type="number"
                  defaultValue={product.price || ''}
                  required
                  placeholder="499 (para $4.99)"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duración</label>
                <input 
                  name="duration"
                  type="text"
                  defaultValue={product.duration || ''}
                  placeholder="2:15 o 60 páginas"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL de Imagen</label>
              <input 
                name="imageUrl"
                type="url"
                defaultValue={product.imageUrl || ''}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Badge (opcional)</label>
              <input 
                name="badge"
                type="text"
                defaultValue={product.badge || ''}
                placeholder="Nuevo, Premium, etc."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input 
                  name="isActive"
                  type="checkbox"
                  defaultChecked={product.isActive !== false}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Producto Activo</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {isEditing ? 'Actualizar' : 'Agregar'}
              </button>
              <button 
                type="button"
                onClick={() => { setEditingProduct(null); setShowAddModal(false); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return renderDashboard();
      case 'products': return renderProducts();
      case 'testimonials': return (
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Gestión de Reseñas</h2>
          <p className="text-gray-600">Funcionalidad disponible próximamente</p>
        </div>
      );
      case 'analytics': return (
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Análisis Detallado</h2>
          <p className="text-gray-600">Estadísticas avanzadas disponibles próximamente</p>
        </div>
      );
      case 'settings': return (
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Configuración</h2>
          <p className="text-gray-600">Ajustes del sistema disponibles próximamente</p>
        </div>
      );
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-[67px] pb-[67px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Centro de control completo para Audio Motívate</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
        {renderModal()}
      </div>
    </div>
  );
}
