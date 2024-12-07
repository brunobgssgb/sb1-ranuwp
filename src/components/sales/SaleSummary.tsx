import React from 'react';
import { App } from '../../types';

interface SaleSummaryProps {
  items: Array<{
    appId: string;
    quantity: number;
    price: number;
  }>;
  apps: App[];
}

export function SaleSummary({ items, apps }: SaleSummaryProps) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-medium text-gray-900 mb-2">Resumo da Venda</h3>
      {items.map((item, index) => {
        const app = apps.find(a => a.id === item.appId);
        return app ? (
          <div key={index} className="flex justify-between text-sm text-gray-600">
            <span>{app.name} x{item.quantity}</span>
            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ) : null;
      })}
      <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-medium text-gray-900">
        <span>Total</span>
        <span>R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
}