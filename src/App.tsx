// src/App.tsx
import AppRoutes from "@/app/AppRoutes";
import { ClientProvider } from "@/context/ClientContext";

const App: React.FC = () => {
  return (
    <ClientProvider>
      <AppRoutes />
    </ClientProvider>
  );
};

export default App;
