import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import Header from '../components/header';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'audiobook',
    category: '',
    price: '',
    imageUrl: '',
    downloadUrl: '',
    duration: '',
    badge: '',
    isActive: true
  });

  const { data: products = [], isLoading, refetch, error } = useQuery({
    queryKey: ['/api/admin/products'],
    staleTime: 0,
    retry: 1
  });

  // Debug logging
  console.log('Admin Query State:', { products, isLoading, error, productsLength: products?.length });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const productData = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100)
      };
      if (editingId) {
        return apiRequest('PUT', `/api/admin/products?id=${editingId}`, productData);
      } else {
        return apiRequest('POST', '/api/admin/products', productData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      refetch();
      setForm({
        title: '',
        description: '',
        type: 'audiobook',
        category: '',
        price: '',
        imageUrl: '',
        downloadUrl: '',
        duration: '',
        badge: '',
        isActive: true
      });
      setEditingId(null);
      alert(editingId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
    },
    onError: (error) => {
      console.error('Error saving product:', error);
      alert('Error al guardar producto');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/products?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      refetch();
      alert('Producto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      alert('Error al eliminar producto');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    console.log('Submitting form:', form);
    createMutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-[67px] pb-[67px]">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
        
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Productos ({products?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Dashboard
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Producto' : 'Agregar Producto'}</h2>
              {editingId && (
                <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
                  Editando producto ID: {editingId}
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        title: '',
                        description: '',
                        type: 'audiobook',
                        category: '',
                        price: '',
                        imageUrl: '',
                        downloadUrl: '',
                        duration: '',
                        badge: '',
                        isActive: true
                      });
                    }}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full p-2 border rounded h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="audiobook">Audiolibro</option>
                    <option value="video">Audio</option>
                    <option value="guide">Guía</option>
                    <option value="pdf">Script</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Precio (MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL de Descarga</label>
                  <input
                    type="url"
                    value={form.downloadUrl}
                    onChange={(e) => setForm({...form, downloadUrl: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duración</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="ej: 45:30"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Guardando...' : (editingId ? 'Actualizar Producto' : 'Guardar Producto')}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Productos Existentes</h2>
              {isLoading ? (
                <div className="text-center py-8">Cargando...</div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Error: {error.message}</p>
                  <button
                    onClick={() => refetch()}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Reintentar
                  </button>
                </div>
              ) : !products || products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay productos</p>
                  <button
                    onClick={() => refetch()}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Recargar
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {products.map((product: any) => (
                    <div key={product.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-gray-600">{product.type} • {product.category}</p>
                          <p className="text-sm font-medium">${(product.price / 100).toFixed(2)} MXN</p>
                          {product.duration && <p className="text-xs text-gray-500">{product.duration}</p>}
                          {product.badge && <span className="inline-block bg-yellow-500 text-black text-xs px-2 py-1 rounded mt-1">{product.badge}</span>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setForm({
                                title: product.title,
                                description: product.description,
                                type: product.type,
                                category: product.category,
                                price: (product.price / 100).toString(),
                                imageUrl: product.imageUrl,
                                downloadUrl: product.downloadUrl,
                                duration: product.duration || '',
                                badge: product.badge || '',
                                isActive: product.isActive
                              });
                              setEditingId(product.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Seguro que quieres eliminar este producto?')) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Productos</h3>
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <p className="text-gray-600 text-sm">Total</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Visitantes</h3>
              <div className="text-2xl font-bold text-green-600">24</div>
              <p className="text-gray-600 text-sm">Únicos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Páginas Vistas</h3>
              <div className="text-2xl font-bold text-purple-600">156</div>
              <p className="text-gray-600 text-sm">Total</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Ventas</h3>
              <div className="text-2xl font-bold text-orange-600">$0</div>
              <p className="text-gray-600 text-sm">0 transacciones</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
