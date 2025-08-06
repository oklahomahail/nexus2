// ✅ src/components/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;
