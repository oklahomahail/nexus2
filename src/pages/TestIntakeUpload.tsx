// Test page for Client Intake Upload feature
// Accessible at /test-intake-upload

import { useState } from "react";

import { ClientIntakeWizard } from "@/components/client/ClientIntakeWizard";
import { Button } from "@/components/ui-kit";

export default function TestIntakeUpload() {
  const [showWizard, setShowWizard] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Using Hope Foundation demo client
  const demoClientId = "00000000-0000-0000-0000-000000000001";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Client Intake Upload Test
          </h1>
          <p className="text-lg text-slate-300 mb-2">
            Test the AI-powered client onboarding feature
          </p>
          <p className="text-sm text-slate-400">
            Upload a brand brief PDF and watch Claude extract structured data
          </p>
        </div>

        {/* Test Info Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">
            Test Information
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">✓</span>
              <div>
                <p className="text-slate-200 font-medium">
                  Database Migration Applied
                </p>
                <p className="text-slate-400">
                  client_intake_jobs table created
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">✓</span>
              <div>
                <p className="text-slate-200 font-medium">
                  Edge Function Deployed
                </p>
                <p className="text-slate-400">
                  process-client-intake ready to handle uploads
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">✓</span>
              <div>
                <p className="text-slate-200 font-medium">
                  Anthropic API Key Set
                </p>
                <p className="text-slate-400">
                  Claude Sonnet 4.5 ready for extraction
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-0.5">→</span>
              <div>
                <p className="text-slate-200 font-medium">
                  Demo Client: Hope Foundation
                </p>
                <p className="text-slate-400 font-mono text-xs">
                  ID: {demoClientId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Document Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            📄 Sample Document Available
          </h3>
          <p className="text-sm text-slate-300 mb-3">
            Use the{" "}
            <span className="font-mono text-blue-400">Client Template.pdf</span>{" "}
            you have attached - it contains:
          </p>
          <ul className="text-sm text-slate-300 space-y-1 ml-4">
            <li>• Complete organization overview and mission</li>
            <li>• Detailed voice & tone guidelines</li>
            <li>• 4 messaging pillars with proof points</li>
            <li>• Donor stories and impact metrics</li>
            <li>• 4 audience segments with preferences</li>
            <li>• Visual identity (colors, typography, logo)</li>
            <li>• Campaign themes for all seasons</li>
            <li>• Contact information</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setShowWizard(true)}
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg transition-all"
          >
            🚀 Test Client Intake Upload
          </Button>
        </div>

        {/* Result Display */}
        {lastResult && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-3">
              ✓ Success!
            </h3>
            <p className="text-sm text-slate-300 mb-2">
              Brand profile created successfully
            </p>
            <p className="text-xs text-slate-400 font-mono break-all">
              Brand Profile ID: {lastResult}
            </p>
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-sm text-slate-300 mb-2">Next steps:</p>
              <ul className="text-sm text-slate-400 space-y-1 ml-4">
                <li>• Check the brand_profiles table in Supabase</li>
                <li>• View the brand_corpus entry with original document</li>
                <li>• Integrate ClientIntakeWizard into your production UI</li>
              </ul>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            How to Test
          </h3>
          <ol className="text-sm text-slate-300 space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-medium mb-1">
                  Click "Test Client Intake Upload"
                </p>
                <p className="text-slate-400 text-xs">
                  This opens the 3-step wizard modal
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-medium mb-1">Upload Client Template.pdf</p>
                <p className="text-slate-400 text-xs">
                  Drag and drop or click to select the PDF file
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-medium mb-1">
                  Watch the processing (30-60s)
                </p>
                <p className="text-slate-400 text-xs">
                  Real-time status updates as Claude extracts data
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <p className="font-medium mb-1">Review extracted data</p>
                <p className="text-slate-400 text-xs">
                  Edit any fields before saving
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                5
              </span>
              <div>
                <p className="font-medium mb-1">Create brand profile</p>
                <p className="text-slate-400 text-xs">
                  Saves to database and returns profile ID
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">
            Troubleshooting
          </h3>
          <div className="text-sm text-slate-300 space-y-2">
            <p>
              <span className="font-medium">If upload fails:</span> Check Edge
              Function logs in Supabase Dashboard
            </p>
            <p>
              <span className="font-medium">If processing hangs:</span> Verify
              Anthropic API key is set correctly
            </p>
            <p>
              <span className="font-medium">If extraction looks wrong:</span>{" "}
              Check the Claude prompt in brandIntakeParser.ts
            </p>
            <p className="text-xs text-slate-400 mt-3">
              View logs: npx supabase functions logs process-client-intake
            </p>
          </div>
        </div>
      </div>

      {/* Wizard Modal */}
      <ClientIntakeWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        clientId={demoClientId}
        onSuccess={(brandProfileId) => {
          console.log("✅ Brand profile created:", brandProfileId);
          setLastResult(brandProfileId);
          setShowWizard(false);

          // Show success toast
          alert(`Success! Brand Profile created: ${brandProfileId}`);
        }}
      />
    </div>
  );
}
