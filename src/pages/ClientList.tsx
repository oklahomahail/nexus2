import { useEffect, useState } from "react";

import ClientModal from "@/components/ClientModal";
import ConfirmModal from "@/components/ui-kit/ConfirmModal";
import { listClients, deleteClient, Client } from "@/services/clientService";

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Client modal state
  const [showClientModal, setShowClientModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await listClients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const handleNewClient = () => {
    setModalMode("create");
    setSelectedClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setModalMode("edit");
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClientClick = (client: Client) => {
    setClientToDelete(client);
    setShowConfirmModal(true);
  };

  const confirmDeleteClient = async () => {
    if (clientToDelete) {
      const success = await deleteClient(clientToDelete.id);
      if (success) {
        await loadClients();
      } else {
        alert("Failed to delete client.");
      }
    }
    setShowConfirmModal(false);
    setClientToDelete(null);
  };

  const cancelDeleteClient = () => {
    setShowConfirmModal(false);
    setClientToDelete(null);
  };

  const handleClientSaved = async () => {
    setShowClientModal(false);
    setSelectedClient(null);
    await loadClients();
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clients</h1>
        <button
          type="button"
          onClick={handleNewClient}
          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        >
          New Client
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="text-sm text-zinc-500">No clients found.</p>
      ) : (
        <ul className="divide-y divide-zinc-200">
          {clients.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{c.name}</div>
                {c.shortName && (
                  <div className="text-sm text-zinc-500">{c.shortName}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditClient(c)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClientClick(c)}
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ClientModal
        open={showClientModal}
        mode={modalMode}
        client={selectedClient}
        onClose={() => {
          setShowClientModal(false);
          setSelectedClient(null);
        }}
        onSaved={handleClientSaved}
      />

      <ConfirmModal
        open={showConfirmModal}
        title="Delete Client"
        message={`Are you sure you want to delete "${clientToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteClient}
        onCancel={cancelDeleteClient}
      />
    </div>
  );
}
