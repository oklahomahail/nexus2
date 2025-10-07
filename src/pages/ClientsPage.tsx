import React from "react";
import { useNavigate } from "react-router-dom";

export default function ClientsPage() {
  const navigate = useNavigate();
  const clients = [
    { id: "regional-food-bank", name: "Regional Food Bank", status: "Active" },
  ];

  // Show empty state when no clients (for demo purposes, you can set clients = [])
  if (clients.length === 0) {
    return (
      <div className="p-6" data-tutorial-step="clients.page">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">Clients</h1>
          <button
            className="px-3 py-1.5 border rounded-md bg-white"
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
              Create your first client to start managing campaigns and tracking
              performance.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => navigate("/clients/new")}
              data-tutorial-step="clients.add"
            >
              Create Your First Client
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-tutorial-step="clients.page">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Clients</h1>
        <button
          className="px-3 py-1.5 border rounded-md bg-white"
          data-tutorial-step="clients.add"
        >
          New Client
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b">
                <td className="p-4">{client.name}</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {client.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    className="text-blue-600 hover:text-blue-800"
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
  );
}
