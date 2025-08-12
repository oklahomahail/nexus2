import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

import AppContent from "./components/AppContent";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./context/AuthContext";
import { ClientProvider } from "./context/ClientContext";

function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <BrowserRouter>
      <ClientProvider>
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
