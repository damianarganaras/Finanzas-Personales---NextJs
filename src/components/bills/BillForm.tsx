'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';
import { useBills } from '@/hooks/use-bills';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import { toast } from 'react-hot-toast';

interface BillFormProps {
  onClose: () => void;
  onSuccess: () => void;
  bill?: any;
}

export function BillForm({ onClose, onSuccess, bill }: BillFormProps) {
  const { createBill, updateBill } = useBills();
  const { categories } = useCategories();
  const createCategory = useCreateCategory();
  const [isLoading, setIsLoading] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const [formData, setFormData] = useState({
    name: bill?.name || '',
    description: bill?.description || '',
    amount: bill?.amount?.toString() || '',
    categoryId: bill?.categoryId || '',
    nextDueDate: bill?.nextDueDate ? new Date(bill.nextDueDate).toISOString().split('T')[0] : '',
    frequency: bill?.frequency || 'monthly',
    active: bill?.active ?? true,
    autoPayEnabled: bill?.autoPayEnabled ?? false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    
    if (!formData.categoryId) {
      toast.error('La categoría es requerida');
      return;
    }
    
    if (!formData.nextDueDate) {
      toast.error('La fecha de vencimiento es requerida');
      return;
    }

    try {
      setIsLoading(true);
      
      const billData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        nextDueDate: new Date(formData.nextDueDate),
        frequency: formData.frequency,
        active: formData.active,
        autoPayEnabled: formData.autoPayEnabled
      };

      if (bill) {
        await updateBill(bill.id, billData);
        toast.success('Factura actualizada correctamente');
      } else {
        await createBill(billData);
        toast.success('Factura creada correctamente');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error al guardar factura:', error);
      toast.error('Error al guardar la factura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      setIsLoading(true);
      const cat = await createCategory.mutateAsync({ name });
      setNewCategory('');
      setCreatingCategory(false);
      // Seleccionar automáticamente la nueva categoría
      setFormData((prev) => ({ ...prev, categoryId: cat.id }));
      toast.success('Categoría creada');
    } catch (e) {
      toast.error('No se pudo crear la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            {bill ? 'Editar Factura' : 'Nueva Factura'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Luz, Agua, Netflix..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detalles adicionales sobre la factura..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No hay categorías aún
                    </div>
                  )}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 pt-2">
                {!creatingCategory ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingCategory(true)}>
                    + Crear nueva categoría
                  </Button>
                ) : (
                  <div className="flex w-full gap-2">
                    <Input
                      placeholder="Nombre de la categoría"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button type="button" size="sm" onClick={handleCreateCategory} disabled={isLoading || !newCategory.trim()}>
                      Crear
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setCreatingCategory(false); setNewCategory(''); }}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Fecha del próximo vencimiento</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => handleInputChange('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annually">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="active">Activa</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoPayEnabled"
                  checked={formData.autoPayEnabled}
                  onCheckedChange={(checked) => handleInputChange('autoPayEnabled', checked)}
                />
                <Label htmlFor="autoPayEnabled">Auto-pago</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  bill ? 'Actualizar' : 'Crear'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
