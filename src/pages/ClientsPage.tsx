import React from "react";

export default function ClientsPage() {
  const clients = [
    { id: "regional-food-bank", name: "Regional Food Bank", status: "Active" },
  ];

  return (
    <div className="p-6" data-tutorial-step="clients.page">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Clients</h1>
        <button className="px-3 py-1.5 border rounded-md bg-white" data-tutorial-step="clients.add">
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
            {clients.map(client => (
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
                    data-tutorial-step={client.id === "regional-food-bank" ? "clients.table.row.regional-food-bank" : undefined}
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