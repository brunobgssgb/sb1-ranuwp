import React from 'react';
import { Sale, Customer, App } from '../../types';

interface RecentSalesProps {
  sales: Sale[];
  customers: Customer[];
  apps: App[];
}

export function RecentSales({ sales, customers, apps }: RecentSalesProps) {
  if (!sales?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Últimas Vendas</h2>
        <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
      </div>
    );
  }

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Últimas Vendas</h2>
      <div className="space-y-4">
        {recentSales.map((sale) => {
          const customer = customers.find((c) => c.id === sale.customerId);
          const total = typeof sale.totalPrice === 'number' ? sale.totalPrice : 0;

          return (
            <div key={sale.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    {customer?.name || 'Cliente não encontrado'}
                  </p>
                  <div className="space-y-1">
                    {sale.items?.map((item, index) => {
                      const app = apps.find((a) => a.id === item.appId);
                      return (
                        <p key={index} className="text-sm text-gray-500">
                          {app?.name || 'Aplicativo não encontrado'} x{item.quantity || 0}
                        </p>
                      );
                    }) || (
                      <p className="text-sm text-gray-500">
                        Nenhum item encontrado
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-green-600 font-medium">
                  R$ {total.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : 'Data não disponível'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}