import React from 'react';

const MetricCard = ({ title, value }) => {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-neutral-800 dark:text-white">{value}</p>
    </div>
  );
};

export default React.memo(MetricCard);
