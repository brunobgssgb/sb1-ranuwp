import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, AppWindow, Code, ShoppingCart, Home as HomeIcon, User, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export function Navigation() {
  const location = useLocation();
  const { currentUser } = useAuthStore();

  const navItems = [
    { icon: HomeIcon, label: 'Início', path: '/' },
    { icon: Users, label: 'Clientes', path: '/customers' },
    { icon: AppWindow, label: 'Aplicativos', path: '/apps' },
    { icon: Code, label: 'Códigos', path: '/codes' },
    { icon: ShoppingCart, label: 'Vendas', path: '/sales' },
    { icon: User, label: 'Minha Conta', path: '/account' },
    ...(currentUser?.isAdmin ? [
      { icon: Settings, label: 'Gerenciar Usuários', path: '/admin/users' }
    ] : [])
  ];

  return (
    <nav className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'inline-flex items-center px-1 pt-1 border-b-2',
                  'text-sm font-medium transition-colors duration-200',
                  location.pathname === item.path
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                )}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}