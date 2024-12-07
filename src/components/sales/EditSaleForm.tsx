import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { AlertCircle, Save, X } from 'lucide-react';
import { Sale } from '../../types';

interface EditSaleFormProps {
  saleId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditSaleForm({ saleId, onCancel, onSuccess }: EditSaleFormProps) {
  const { sales, customers, apps, updateSale } = useStore();
  const sale = sales.find(s => s.id === saleId);
  const [error, setError] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(sale?.customerId || '');
  const [items, setItems] = useState(sale?.items || []);

  useEffect(() => {
    if (!sale) {
      setError('Venda não encontrada');
      return;
    }
    setSelectedCustomerId(sale.customerId);
    setItems(sale.items);
  }, [sale]);

  if (!sale) {
    return (
      <Card>
        <Card.Content>
          <div className="text-center py-6 text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Venda não encontrada</p>
          </div>
        </Card.Content>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const totalPrice = items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );

      await updateSale(saleId, {
        customerId: selectedCustomerId,
        items,
        totalPrice
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating sale:', error);
      setError('Erro ao atualizar venda. Por favor, tente novamente.');
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Editar Venda</h2>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Cliente" required>
            <select
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              disabled={sale.status !== 'pending'}
            >
              <option value="">Selecione o Cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </FormField>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={sale.status !== 'pending'}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}