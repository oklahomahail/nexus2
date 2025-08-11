import { Suspense } from "react";

import AppContent from "./components/AppContent";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}

export default App;
