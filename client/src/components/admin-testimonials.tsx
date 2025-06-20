import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Trash2, Edit, Plus, Save, X, Star, MessageSquare, Upload } from 'lucide-react';

interface TestimonialForm {
  id?: number;
  name: string;
  imageUrl: string;
  rating: number;
  comment: string;
}

const initialForm: TestimonialForm = {
  name: '',
  imageUrl: '',
  rating: 5,
  comment: ''
};

export default function AdminTestimonials() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TestimonialForm>(initialForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['/api/testimonials'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialForm) => {
      return apiRequest('POST', '/api/admin/testimonials', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      queryClient.refetchQueries({ queryKey: ['/api/testimonials'] });
      setForm(initialForm);
      setShowAddForm(false);
      toast({
        title: "Reseña creada",
        description: "La reseña se ha creado exitosamente",
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
    mutationFn: async ({ id, data }: { id: number; data: TestimonialForm }) => {
      return apiRequest('PUT', `/api/admin/testimonials/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      queryClient.refetchQueries({ queryKey: ['/api/testimonials'] });
      setForm(initialForm);
      setEditingId(null);
      setShowAddForm(false);
      toast({
        title: "Reseña actualizada",
        description: "La reseña se ha actualizado exitosamente",
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
      return apiRequest('DELETE', `/api/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      queryClient.refetchQueries({ queryKey: ['/api/testimonials'] });
      toast({
        title: "Reseña eliminada",
        description: "La reseña se ha eliminado exitosamente",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (testimonial: any) => {
    setForm({
      id: testimonial.id,
      name: testimonial.name,
      imageUrl: testimonial.imageUrl,
      rating: testimonial.rating,
      comment: testimonial.comment
    });
    setEditingId(testimonial.id);
    setShowAddForm(true);
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('testimonial-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const cancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowAddForm(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Reseñas</h2>
          <p className="text-gray-600">Administra las reseñas y testimonios de usuarios</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Reseña
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card id="testimonial-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {editingId ? 'Editar Reseña' : 'Agregar Nueva Reseña'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del Usuario *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                    placeholder="Ej: María González"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Calificación *</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({...form, rating: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={5}>5 estrellas</option>
                    <option value={4}>4 estrellas</option>
                    <option value={3}>3 estrellas</option>
                    <option value={2}>2 estrellas</option>
                    <option value={1}>1 estrella</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL de Imagen *</label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                  required
                  placeholder="https://ejemplo.com/foto-usuario.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">URL de la foto del usuario (recomendado 80x80px)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comentario *</label>
                <Textarea
                  value={form.comment}
                  onChange={(e) => setForm({...form, comment: e.target.value})}
                  required
                  rows={4}
                  placeholder="Escriba aquí el comentario del usuario..."
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Actualizar' : 'Crear'} Reseña
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

      {/* Testimonials List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Reseñas ({testimonials.length})
        </h3>
        
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No hay reseñas</p>
              <p className="text-sm text-gray-400">
                Agrega la primera reseña para comenzar
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((testimonial: any) => (
              <Card key={testimonial.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=e5e7eb&color=6b7280`;
                        }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <div className="flex items-center gap-1">
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed">
                          "{testimonial.comment}"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(testimonial)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
                            deleteMutation.mutate(testimonial.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
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