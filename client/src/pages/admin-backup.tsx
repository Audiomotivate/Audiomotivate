import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart3, Package, Settings, TrendingUp } from 'lucide-react';
import Header from '../components/header';
import AdminDashboard from '../components/admin-dashboard';
import AdminProductManager from '../components/admin-product-manager';



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
  badge: ''
};



// Helper function to convert Google Drive URLs to direct download links
const convertGoogleDriveUrl = (url: string): string => {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }
  
  // Extract file ID from Google Drive URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return url;
};

// Helper function specifically for images - uses Google's direct image hosting
const convertGoogleDriveImageUrl = (url: string): string => {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }
  
  // Extract file ID from Google Drive URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    // Use Google's direct image hosting for better display
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  return url;
};

export default function AdminPanel() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/admin/products'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const productData = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100), // Convert to cents with decimals
      };
      return apiRequest('POST', '/api/admin/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setForm(initialForm);
      setShowAddForm(false);
      toast({ title: 'Producto creado exitosamente' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error al crear producto', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      const productData = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100), // Convert to cents with decimals
      };
      return apiRequest('PUT', `/api/admin/products/${id}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setEditingId(null);
      setForm(initialForm);
      toast({ title: 'Producto actualizado exitosamente' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error al actualizar producto', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({ title: 'Producto eliminado exitosamente' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error al eliminar producto', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const startEdit = (product: Product) => {
    setEditingId(product.id);
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
      badge: product.badge || ''
    });
    
    // Scroll to top to show the edit form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header showMobileFixedSearch={false} />
        <div className="min-h-screen bg-gray-50 pt-24 p-8">
          <div className="container mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showMobileFixedSearch={false} />
      <div className="min-h-screen bg-gray-50 pt-24 p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingId) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">ID (opcional)</label>
                      <Input
                        type="number"
                        value={form.id}
                        onChange={(e) => setForm({ ...form, id: e.target.value })}
                        placeholder="Dejar vacío para auto-generar"
                      />
                      <p className="text-xs text-gray-500 mt-1">Si se especifica, debe ser único</p>
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
                      <label className="block text-sm font-medium mb-2">Etiqueta/Badge (opcional)</label>
                      <Input
                        value={form.badge}
                        onChange={(e) => setForm({...form, badge: e.target.value})}
                        placeholder="ej. Premium, Nuevo, Bestseller, Exclusivo"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Etiqueta que aparecerá sobre la imagen del producto
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción *</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      required
                      rows={4}
                      placeholder="Descripción detallada del producto"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">URL de Imagen *</label>
                      <Input
                        value={form.imageUrl}
                        onChange={(e) => setForm({...form, imageUrl: convertGoogleDriveImageUrl(e.target.value)})}
                        required
                        placeholder="Pega el enlace de Google Drive aquí"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tamaño recomendado: 800x800px | Máximo: 2MB | Formatos: JPG, PNG
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">URL de Preview (MP3)</label>
                      <Input
                        value={form.previewUrl}
                        onChange={(e) => setForm({...form, previewUrl: convertAudioUrl(e.target.value)})}
                        placeholder="Pega el enlace de Google Drive aquí"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-blue-600 font-medium">Instrucciones para Dropbox:</span><br/>
                        1. Sube tu archivo MP3 de preview a Dropbox<br/>
                        2. Haz clic en "Compartir" → "Crear enlace"<br/>
                        3. Copia el enlace y cambia ?dl=0 por ?dl=1 al final<br/>
                        4. Pega el enlace modificado aquí<br/>
                        <span className="text-green-600 text-xs">✓ El sistema convertirá automáticamente el enlace</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">URL de Descarga *</label>
                      <Input
                        value={form.downloadUrl}
                        onChange={(e) => setForm({...form, downloadUrl: convertGoogleDriveUrl(e.target.value)})}
                        required
                        placeholder="Pega el enlace de Google Drive aquí"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pega el enlace normal de Google Drive y se convertirá automáticamente
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {editingId ? 'Actualizar' : 'Crear'} Producto
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Products List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Productos ({products.length})</h2>
            
            {products.map((product: Product) => (
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
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este producto?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {products.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay productos
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comienza agregando tu primer producto digital
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Primer Producto
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}