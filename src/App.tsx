import React from 'react';
import { AppProvider } from './context/AppContext';
import AppContent from './components/AppContent';

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
