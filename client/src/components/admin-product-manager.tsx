import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Product } from '../../../shared/schema';
import { Trash2, Edit, Plus, Save, X, Upload, Search, Filter } from 'lucide-react';

interface ProductForm {
  id?: string;
  title: string;
  description: string;
  type: 'audiobook' | 'video' | 'pdf' | 'guide';
  category: string;
  price: string;
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  duration: string;
  badge: string;
  isBestseller: boolean;
  isNew: boolean;
}

const initialForm: ProductForm = {
  id: '',
  title: '',
  description: '',
  type: 'audiobook',
  category: '',
  price: '',
  imageUrl: '',
  previewUrl: '',
  downloadUrl: '',
  duration: '',
  badge: '',
  isBestseller: false,
  isNew: false
};

const convertGoogleDriveImageUrl = (url: string): string => {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }
  
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  return url;
};

export default function AdminProductManager() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/admin/products'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const productData = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100),
      };
      return apiRequest('POST', '/api/admin/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setForm(initialForm);
      setShowAddForm(false);
      toast({
        title: "Producto creado",
        description: "El producto se ha creado exitosamente",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      const productData = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100),
      };
      return apiRequest('PUT', `/api/admin/products/${id}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setEditingId(null);
      setForm(initialForm);
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado exitosamente",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado exitosamente",
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

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/admin/products/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del producto se ha actualizado",
      });
    },
  });

  const startEdit = (product: Product) => {
    setForm({
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      type: product.type as any,
      category: product.category,
      price: (product.price / 100).toString(),
      imageUrl: product.imageUrl || '',
      previewUrl: product.previewUrl || '',
      downloadUrl: product.downloadUrl || '',
      duration: product.duration || '',
      badge: product.badge || '',
      isBestseller: product.isBestseller || false,
      isNew: product.isNew || false
    });
    setEditingId(product.id);
    setShowAddForm(false);
    
    setTimeout(() => {
      const element = document.getElementById('product-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowAddForm(false);
  };

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'inactive' && !product.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Productos</h2>
          <p className="text-muted-foreground">
            {products.length} productos totales • {filteredProducts.length} mostrados
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm || editingId}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="audiobook">Audiolibros</SelectItem>
                <SelectItem value="video">Audios</SelectItem>
                <SelectItem value="pdf">PDFs/Scripts</SelectItem>
                <SelectItem value="guide">Guías</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Form */}
      {(showAddForm || editingId) && (
        <Card id="product-form">
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ID (opcional)</label>
                  <Input
                    type="number"
                    value={form.id}
                    onChange={(e) => setForm({...form, id: e.target.value})}
                    placeholder="Auto-generado si se deja vacío"
                    disabled={!!editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                    placeholder="Nombre del producto"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Descripción *</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    required
                    placeholder="Descripción detallada del producto"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo *</label>
                  <Select value={form.type} onValueChange={(value: any) => setForm({...form, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audiobook">Audiolibro</SelectItem>
                      <SelectItem value="video">Audio</SelectItem>
                      <SelectItem value="pdf">PDF/Script</SelectItem>
                      <SelectItem value="guide">Guía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categoría *</label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    required
                    placeholder="Ej: Crecimiento Personal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Precio (MXN) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value})}
                      required
                      placeholder="89.00"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Precio en pesos mexicanos (ej: 89.00, 149.00, 499.00)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duración</label>
                  <Input
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: e.target.value})}
                    placeholder="Ej: 3:45 o 45 páginas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Badge</label>
                  <Input
                    value={form.badge}
                    onChange={(e) => setForm({...form, badge: e.target.value})}
                    placeholder="Ej: Nuevo, Premium, Bestseller"
                  />
                </div>

                {/* Checkboxes para carruseles */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isBestseller"
                      checked={form.isBestseller}
                      onChange={(e) => setForm({...form, isBestseller: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isBestseller" className="text-sm font-medium text-gray-700">
                      Más vendidos
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={form.isNew}
                      onChange={(e) => setForm({...form, isNew: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isNew" className="text-sm font-medium text-gray-700">
                      Nuevos lanzamientos
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">URL de Imagen *</label>
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                    required
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Soporta URLs de Google Drive y se convertirán automáticamente</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL de Preview (MP3)</label>
                  <Input
                    value={form.previewUrl}
                    onChange={(e) => setForm({...form, previewUrl: e.target.value})}
                    placeholder="URL del preview en Dropbox"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL de Descarga *</label>
                  <Input
                    value={form.downloadUrl}
                    onChange={(e) => setForm({...form, downloadUrl: e.target.value})}
                    required
                    placeholder="URL de Google Drive del archivo completo"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Actualizar' : 'Crear'} Producto
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Productos ({filteredProducts.length})
        </h3>
        
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No se encontraron productos</p>
              <p className="text-sm text-gray-400">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Agrega tu primer producto para comenzar'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product: Product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-semibold">{product.title}</h3>
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline">{product.type}</Badge>
                        {product.badge && (
                          <Badge variant="secondary">{product.badge}</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Categoría:</span> {product.category}
                        </div>
                        <div>
                          <span className="font-medium">Precio:</span> ${(product.price / 100).toFixed(2)}
                        </div>
                        {product.duration && (
                          <div>
                            <span className="font-medium">Duración:</span> {product.duration}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">ID:</span> {product.id}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={product.isActive ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleMutation.mutate(product.id)}
                      >
                        {product.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}