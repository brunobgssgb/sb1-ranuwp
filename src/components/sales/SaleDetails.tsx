import React from 'react';
import { Sale, App } from '../../types';
import { formatCurrency } from '../../lib/format';

interface SaleDetailsProps {
  sale: Sale;
  apps: App[];
}

export function SaleDetails({ sale, apps }: SaleDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Itens do Pedido</h4>
        {sale.items?.map((item, index) => {
          const app = apps.find(a => a.id === item.appId);
          const itemTotal = (item.price || 0) * (item.quantity || 0);
          return (
            <div key={index} className="flex justify-between text-sm">
              <span>{app?.name || 'Aplicativo não encontrado'} x{item.quantity || 0}</span>
              <span>{formatCurrency(itemTotal)}</span>
            </div>
          );
        })}
      </div>
      
      {sale.status === 'confirmed' && sale.items?.some(item => item.codes?.length > 0) && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Códigos</h4>
          {sale.items.map((item, index) => {
            const app = apps.find(a => a.id === item.appId);
            if (!item.codes?.length) return null;
            return (
              <div key={index} className="text-sm">
                <p className="font-medium text-gray-700">{app?.name}:</p>
                <div className="mt-1 space-y-1">
                  {item.codes.map((code, codeIndex) => (
                    <p key={codeIndex} className="font-mono text-gray-600">{code}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}