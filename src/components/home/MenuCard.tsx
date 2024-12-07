import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MenuCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

export function MenuCard({ title, description, icon: Icon, path, color }: MenuCardProps) {
  return (
    <Link
      to={path}
      className="relative group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="p-6">
        <div className={`inline-flex p-3 rounded-lg ${color} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600 transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      </div>
      <div className={`absolute bottom-0 left-0 w-full h-1 ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`} />
    </Link>
  );
}