// src/App.tsx
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

import AppContent from "./components/AppContent";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./context/AuthContext";
import { ClientProvider } from "./context/ClientContext";
import ThemeProbe from "./dev/ThemeProbe";

function App() {
  const { user } = useAuth();

  // Only enable ThemeProbe in dev mode or if explicitly requested with ?dev=1
  const isDevEnv = import.meta.env.MODE === "development";
  let showDevProbe = false;

  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("dev");
    if (raw) {
      showDevProbe = !["0", "false", "off", "no"].includes(raw.toLowerCase());
    }
  } catch {
    showDevProbe = false;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <BrowserRouter>
      <ClientProvider>
        {isDevEnv && showDevProbe && <ThemeProbe />}
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <AppContent />
        </Suspense>
      </ClientProvider>
    </BrowserRouter>
  );
}

export default App;
