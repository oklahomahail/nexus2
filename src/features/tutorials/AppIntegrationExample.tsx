/**
 * Example integration of the Tutorial system into the main App component
 * 
 * This file shows how to integrate the TutorialManager into your existing App.tsx
 * Copy the relevant parts into your actual App.tsx file.
 */

import React, { useEffect, useState } from "react";
import { TutorialManager, loadTutorialConfig, addGlobalTutorialControls } from "@/features/tutorials";
import type { TutorialConfig } from "@/features/tutorials";
import { seedDemoData } from "@/data/demo";

// Your existing App component with tutorial integration
export default function App() {
  const [tutorialConfig, setTutorialConfig] = useState<TutorialConfig | null>(null);

  // Load tutorial configuration on app startup
  useEffect(() => {
    const initTutorial = async () => {
      try {
        const config = await loadTutorialConfig();
        setTutorialConfig(config);
        
        // Add global tutorial controls for development
        if (process.env.NODE_ENV === 'development') {
          addGlobalTutorialControls();
        }
      } catch (error) {
        console.warn("Failed to initialize tutorial system:", error);
      }
    };

    initTutorial();
  }, []);

  // Handle tutorial events
  const handleTutorialStart = () => {
    console.log("Tutorial started - seeding demo data");
    seedDemoData(); // Load demo data for realistic tutorial experience
  };

  const handleTutorialComplete = () => {
    console.log("Tutorial completed! User is now onboarded.");
    // Optionally trigger analytics, show completion celebration, etc.
  };

  const handleTutorialDismiss = () => {
    console.log("Tutorial dismissed by user");
    // Optionally ask for feedback or offer alternative onboarding paths
  };

  return (
    <>
      {/* Your existing app structure */}
      <div id="app">
        {/* Header, Navigation, Main Content, etc. */}
      </div>

      {/* Tutorial system overlay - renders on top of everything */}
      <TutorialManager
        config={tutorialConfig}
        onStart={handleTutorialStart}
        onComplete={handleTutorialComplete}
        onDismiss={handleTutorialDismiss}
        autoStart={true} // Auto-start for first-time users
      />
    </>
  );
}

/**
 * Alternative: If you prefer to conditionally render the tutorial
 * This approach gives you more control over when the tutorial appears
 */
export function AppWithConditionalTutorial() {
  const [tutorialConfig, setTutorialConfig] = useState<TutorialConfig | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadTutorialConfig().then((config) => {
      setTutorialConfig(config);
      
      // Custom logic to determine when to show tutorial
      const shouldShow = !localStorage.getItem("nexus.tutorial.onboarding.completed");
      setShowTutorial(shouldShow);
    });
  }, []);

  return (
    <>
      <div id="app">
        {/* Your app content */}
      </div>

      {/* Conditionally render tutorial */}
      {showTutorial && tutorialConfig && (
        <TutorialManager
          config={tutorialConfig}
          onComplete={() => setShowTutorial(false)}
          onDismiss={() => setShowTutorial(false)}
          autoStart={false} // Manual control since we're conditionally rendering
        />
      )}
    </>
  );
}

/**
 * Help Menu Integration Example
 * Add this to your help menu, settings page, or navigation bar
 */
export function HelpMenuWithTutorial() {
  const handleRestartTutorial = () => {
    // Reset tutorial completion state
    localStorage.removeItem("nexus.tutorial.onboarding.completed");
    localStorage.removeItem("nexus.tutorial.onboarding.completed.timestamp");
    
    // Reload page to restart tutorial
    window.location.reload();
  };

  return (
    <div className="help-menu">
      <h3>Help & Support</h3>
      <ul>
        <li>
          <button 
            onClick={handleRestartTutorial}
            className="text-blue-600 hover:text-blue-800"
          >
            Take Walkthrough
          </button>
        </li>
        <li>Knowledge Base</li>
        <li>Contact Support</li>
      </ul>
    </div>
  );
}