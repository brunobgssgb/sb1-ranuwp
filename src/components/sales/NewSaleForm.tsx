import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { AlertCircle, Plus } from 'lucide-react';
import { SaleItemForm } from './SaleItemForm';
import { SaleSummary } from './SaleSummary';
import { PaymentModal } from './PaymentModal';
import { createPixPayment } from '../../services/mercadopago.service';
import { logger } from '../../lib/logger';

interface NewSaleFormProps {
  onSuccess: () => void;
}

export function NewSaleForm({ onSuccess }: NewSaleFormProps) {
  const { currentUser } = useAuthStore();
  const { customers, apps, addSale } = useStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<Array<{ appId: string; quantity: number; price: number }>>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    pixCode: string;
    paymentId: string;
  } | null>(null);

  const addItem = () => {
    setItems([...items, { appId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'appId') {
      const app = apps.find(a => a.id === value);
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        price: app?.price || 0
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      if (!selectedCustomerId || items.length === 0) {
        throw new Error('Por favor, selecione um cliente e adicione pelo menos um item.');
      }

      const customer = customers.find(c => c.id === selectedCustomerId);
      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const description = items.map(item => {
        const app = apps.find(a => a.id === item.appId);
        return `${app?.name} x${item.quantity}`;
      }).join(', ');

      logger.info('Creating new sale', {
        userId: currentUser.id,
        customerId: selectedCustomerId,
        items: items.map(item => ({
          appId: item.appId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount
      });

      const payment = await createPixPayment(
        currentUser.id,
        totalAmount,
        description,
        {
          name: customer.name,
          email: customer.email
        }
      );

      setPaymentData(payment);

      const success = await addSale(selectedCustomerId, items, payment.paymentId);
      
      if (success) {
        logger.info('Sale created successfully', {
          userId: currentUser.id,
          customerId: selectedCustomerId,
          paymentId: payment.paymentId
        });
      } else {
        throw new Error('Não há códigos suficientes disponíveis para um ou mais aplicativos selecionados.');
      }
    } catch (error) {
      logger.error('Error creating sale', {
        userId: currentUser?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: {
          customerId: selectedCustomerId,
          items
        }
      });
      setError(error instanceof Error ? error.message : 'Erro ao criar venda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900">Nova Venda</h2>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <FormField label="Cliente" required>
              <select
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                disabled={isLoading}
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

            <div className="space-y-4">
              {items.map((item, index) => (
                <SaleItemForm
                  key={index}
                  item={item}
                  apps={apps}
                  onUpdate={(field, value) => updateItem(index, field, value)}
                  onRemove={() => removeItem(index)}
                />
              ))}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </div>

            {items.length > 0 && (
              <SaleSummary items={items} apps={apps} />
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!selectedCustomerId || items.length === 0 || isLoading}
              >
                {isLoading ? 'Processando...' : 'Gerar Pagamento PIX'}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {paymentData && (
        <PaymentModal
          pixCode={paymentData.pixCode}
          onClose={() => {
            setPaymentData(null);
            onSuccess();
          }}
        />
      )}
    </>
  );
}