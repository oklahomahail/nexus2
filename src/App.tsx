import React from 'react';
import { UIProvider, NotificationsProvider } from './context/AppProviders';
import AppContent from './components/AppContent';

function App() {
  return (
    <UIProvider>
      <NotificationsProvider>
        <AppContent />
      </NotificationsProvider>
    </UIProvider>
  );
}

export default App;
