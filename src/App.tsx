import { Suspense } from "react";

import AppContent from "./components/AppContent";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
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
