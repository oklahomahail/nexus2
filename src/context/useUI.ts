import { useState } from 'react';

export const useUI = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return {
    activeView,
    sidebarCollapsed,
    setActiveView,
    toggleSidebar,
    loading,
    error,
    setLoading,
    setError
  };
};