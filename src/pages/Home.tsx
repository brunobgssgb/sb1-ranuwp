import React from 'react';
import { Users, AppWindow, Code, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MenuCard } from '../components/home/MenuCard';
import { DashboardCard } from '../components/home/DashboardCard';
import { RecentSales } from '../components/home/RecentSales';

const menuItems = [
  {
    title: 'Clientes',
    description: 'Gerenciar cadastro de clientes',
    icon: Users,
    path: '/customers',
    color: 'bg-blue-500',
  },
  {
    title: 'Aplicativos',
    description: 'Gerenciar aplicativos e preços',
    icon: AppWindow,
    path: '/apps',
    color: 'bg-purple-500',
  },
  {
    title: 'Códigos',
    description: 'Gerenciar códigos de recarga',
    icon: Code,
    path: '/codes',
    color: 'bg-green-500',
  },
  {
    title: 'Vendas',
    description: 'Registrar novas vendas',
    icon: ShoppingCart,
    path: '/sales',
    color: 'bg-orange-500',
  },
];

export function Home() {
  const { sales = [], customers = [], apps = [] } = useStore();

  const currentMonthSales = sales.filter(sale => {
    if (!sale?.date) return false;
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.getMonth() === today.getMonth() &&
           saleDate.getFullYear() === today.getFullYear();
  });

  const monthlyRevenue = currentMonthSales.reduce((total, sale) => 
    total + (typeof sale?.totalPrice === 'number' ? sale.totalPrice : 0), 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Sistema de Gerenciamento
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Selecione uma opção para começar
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item) => (
          <MenuCard key={item.path} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentSales 
          sales={sales} 
          customers={customers} 
          apps={apps} 
        />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Resumo</h2>
          <div className="grid grid-cols-2 gap-4">
            <DashboardCard
              title="Total de Clientes"
              value={customers.length || 0}
              color="blue"
            />
            <DashboardCard
              title="Total de Apps"
              value={apps.length || 0}
              color="purple"
            />
            <DashboardCard
              title="Vendas do Mês"
              value={currentMonthSales.length || 0}
              color="green"
            />
            <DashboardCard
              title="Faturamento do Mês"
              value={`R$ ${monthlyRevenue.toFixed(2)}`}
              color="orange"
            />
          </div>
        </div>
      </div>
    </div>
  );
}