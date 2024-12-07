import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 text-blue-800',
  purple: 'bg-purple-50 text-purple-600 text-purple-800',
  green: 'bg-green-50 text-green-600 text-green-800',
  orange: 'bg-orange-50 text-orange-600 text-orange-800',
};

export function DashboardCard({ title, value, color }: DashboardCardProps) {
  const colorClass = colorClasses[color];
  
  return (
    <div className={`${colorClass.split(' ')[0]} p-4 rounded-lg`}>
      <p className={`text-sm font-medium ${colorClass.split(' ')[1]}`}>{title}</p>
      <p className={`text-2xl font-bold ${colorClass.split(' ')[2]}`}>{value}</p>
    </div>
  );
}