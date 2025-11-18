import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ClientWizard from "@/components/ClientWizard";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/supabaseClient";

type Client = Tables<"clients">;

export default function ClientsPage() {
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients from Supabase
  useEffect(() => {
    async function fetchClients() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError(err instanceof Error ? err.message : "Failed to load clients");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchClients();
  }, []);

  const handleCreateClient = async (clientData: any) => {
    try {
      console.log("Creating client:", clientData);

      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: clientData.name,
          short_name: clientData.shortName || null,
          website: clientData.website || null,
          primary_contact_name: clientData.primaryContact.name,
          primary_contact_email: clientData.primaryContact.email,
          phone: clientData.primaryContact.phone || null,
          notes: clientData.notes || null,
          description: clientData.segment || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new client to the list
      setClients((prev) => [data, ...prev]);
      setIsWizardOpen(false);

      // Navigate to the new client's page
      if (data?.id) {
        localStorage.setItem("nexus:lastClientId", data.id);
        void navigate(`/clients/${data.id}`);
      }
    } catch (err) {
      console.error("Error creating client:", err);
      setError(err instanceof Error ? err.message : "Failed to create client");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Clients
          </h1>
        </header>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Clients
          </h1>
        </header>
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state when no clients
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
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        client.is_active
                          ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
                          : "bg-slate-100 text-slate-800 ring-slate-200"
                      }`}
                    >
                      {client.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => {
                        localStorage.setItem("nexus:lastClientId", client.id);
                        void navigate(`/clients/${client.id}`);
                      }}
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
