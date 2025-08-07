import React from 'react';

interface TopbarProps {
  title: string;
  description?: string;
}

const Topbar: React.FC<TopbarProps> = ({ title, description }) => {
  return (
    <header className="px-6 py-4 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}
      </div>

      {/* Right-side area for future controls (e.g., profile, dark mode toggle) */}
      <div className="flex items-center space-x-4">
        {/* Placeholder for user menu or controls */}
        {/* <button className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Settings</button> */}
      </div>
    </header>
  );
};

export default Topbar;
