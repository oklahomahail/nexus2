// src/pages/ClientList.tsx
import {
  Building,
  ArrowRight,
  Plus,
  Users,
  Target,
  Calendar,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useClient } from "@/context/ClientContext";
import { clientService, type Client } from "@/services/clientService";

export default function ClientList() {
  const { clients, setCurrentClient, reload } = useClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (clients.length === 0) {
      // Seed with examples for first run only
      clientService
        .seed([
          {
            id: "bbhh",
            name: "Brother Bill's Helping Hand",
            brand: { primary: "#2563eb", secondary: "#1e40af" },
          },
          {
            id: "darcc",
            name: "Dallas Area Rape Crisis Center",
            brand: { primary: "#dc2626", secondary: "#b91c1c" },
          },
          {
            id: "nexus",
            name: "Nexus Consulting",
            brand: { primary: "#7c3aed", secondary: "#6d28d9" },
          },
        ])
        .then(() => reload())
        .catch(console.error);
    }
  }, [clients.length, reload]);

  const handleClientSelect = (client: Client) => {
    setCurrentClient(client.id);
    void navigate(`/client/${client.id}`);
  };

  const handleNewClient = () => {
    // TODO: Open new client modal
    console.log("New client modal");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Clients</h2>
          <p className="text-slate-400 mt-1">
            Manage your nonprofit organizations and their campaigns
          </p>
        </div>
        <button
          onClick={handleNewClient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-slate-400 text-sm">Total Clients</p>
              <p className="text-3xl font-bold text-white">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-400" />
            <div className="ml-4">
              <p className="text-slate-400 text-sm">Active Campaigns</p>
              <p className="text-3xl font-bold text-white">—</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-slate-400 text-sm">Total Donors</p>
              <p className="text-3xl font-bold text-white">—</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client grid */}
      {clients.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No clients yet
          </h3>
          <p className="text-slate-400 mb-6">
            Add your first nonprofit client to get started
          </p>
          <button
            onClick={handleNewClient}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Your First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client: Client) => (
            <div
              key={client.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-200 group cursor-pointer"
              onClick={() => handleClientSelect(client)}
            >
              {/* Client header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {client.brand?.logoUrl ? (
                    <img
                      src={client.brand.logoUrl}
                      alt={client.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        background: client.brand?.primary
                          ? `linear-gradient(135deg, ${client.brand.primary}, ${client.brand.secondary || client.brand.primary})`
                          : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      }}
                    >
                      {client.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {client.name}
                    </h3>
                    <p className="text-slate-400 text-sm">ID: {client.id}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </div>

              {/* Client stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-slate-400 text-xs">Campaigns</div>
                  <div className="text-lg font-semibold text-white">—</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">Donors</div>
                  <div className="text-lg font-semibold text-white">—</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">Revenue</div>
                  <div className="text-lg font-semibold text-white">—</div>
                </div>
              </div>

              {/* Last activity */}
              <div className="flex items-center text-slate-400 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Updated {new Date(client.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
