// src/App.tsx
import AppRoutes from "@/app/AppRoutes";
import { ClientProvider } from "@/context/ClientContext";
import { NotificationsProvider } from "@/context/notifications/NotificationsContext";

const App: React.FC = () => {
  return (
    <NotificationsProvider>
      <ClientProvider>
        <AppRoutes />
      </ClientProvider>
    </NotificationsProvider>
  );
};

export default App;
