import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ClientWizard from "@/components/ClientWizard";

export default function ClientsPage() {
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const clients = [
    { id: "regional-food-bank", name: "Regional Food Bank", status: "Active" },
  ];

  const handleCreateClient = (clientData: any) => {
    console.log("Creating client:", clientData);
    // TODO: Implement actual client creation with Supabase
    setIsWizardOpen(false);
    // For now, just close the modal - in production this would save to DB
  };

  // Show empty state when no clients (for demo purposes, you can set clients = [])
  if (clients.length === 0) {
    return (
      <>
        <div className="p-6" data-tutorial-step="clients.page">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">Clients</h1>
            <button
              className="px-3 py-1.5 border rounded-md bg-white"
              onClick={() => setIsWizardOpen(true)}
              data-tutorial-step="clients.add"
            >
              New Client
            </button>
          </div>

          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No clients yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first client to start managing campaigns and
                tracking performance.
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setIsWizardOpen(true)}
                data-tutorial-step="clients.add"
              >
                Create Your First Client
              </button>
            </div>
          </div>
        </div>

        <ClientWizard
          open={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleCreateClient}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Clients
          </h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            onClick={() => setIsWizardOpen(true)}
            data-tutorial-step="clients.add"
          >
            New Client
          </button>
        </header>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="w-full text-left">
            <thead className="text-sm text-slate-600 bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clients.map((client) => (
                <tr key={client.id} className="bg-white hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {client.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => {
                        localStorage.setItem("nexus:lastClientId", client.id);
                        void navigate(`/clients/${client.id}`);
                      }}
                      data-tutorial-step={
                        client.id === "regional-food-bank"
                          ? "clients.table.row.regional-food-bank"
                          : undefined
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClientWizard
        open={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCreateClient}
      />
    </>
  );
}
