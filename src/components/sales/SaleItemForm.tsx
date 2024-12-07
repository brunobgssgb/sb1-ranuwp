import React from 'react';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';
import { App } from '../../types';

interface SaleItemFormProps {
  item: {
    appId: string;
    quantity: number;
    price: number;
  };
  apps: App[];
  onUpdate: (field: string, value: string | number) => void;
  onRemove: () => void;
}

export function SaleItemForm({ item, apps, onUpdate, onRemove }: SaleItemFormProps) {
  const selectedApp = apps.find(a => a.id === item.appId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border rounded-lg p-4">
      <div className="md:col-span-8">
        <FormField label="Aplicativo" required>
          <select
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            value={item.appId}
            onChange={(e) => onUpdate('appId', e.target.value)}
            required
          >
            <option value="">Selecione o Aplicativo</option>
            {apps.map((app) => (
              <option 
                key={app.id} 
                value={app.id} 
                disabled={app.codesAvailable < 1}
              >
                {app.name} (R$ {app.price.toFixed(2)}) - {app.codesAvailable} códigos disponíveis
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="md:col-span-3">
        <FormField label="Quantidade" required>
          <Input
            type="number"
            min="1"
            max={selectedApp?.codesAvailable || 1}
            value={item.quantity}
            onChange={(e) => onUpdate('quantity', parseInt(e.target.value))}
            required
          />
        </FormField>
      </div>
      <div className="md:col-span-1">
        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
          className="w-full"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}