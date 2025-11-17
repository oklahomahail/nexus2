import {
  Home,
  Users,
  Megaphone,
  BarChart3,
  FileText,
  Database,
  FlaskConical,
  ChevronDown,
  Palette,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, useLocation } from "react-router-dom";

import { ClientSwitcherModal } from "@/components/nav/client/ClientSwitcherModal";
import { useClient } from "@/context/ClientContext";
import { analytics } from "@/utils/analytics";

export const ClientLayout: React.FC = () => {
  const { clientId } = useParams();
  const location = useLocation();
  const { currentClient, clients, setCurrentClientBySlug } = useClient();
  const [clientSwitcherOpen, setClientSwitcherOpen] = useState(false);

  // Automatically set the current client from the URL parameter
  useEffect(() => {
    if (clientId) {
      // Only attempt to set client if we have clients loaded or if it's a UUID
      // This prevents unnecessary API calls before the client list is ready
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);

      if (isUUID || clients.length > 0) {
        void setCurrentClientBySlug(clientId);
      }
    }
  }, [clientId, clients.length, setCurrentClientBySlug]);

  const link = (
    to: string,
    label: string,
    icon: React.ReactNode,
    testId?: string,
  ) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors " +
        (isActive
          ? "bg-[#0F1115] text-white border-l-2 border-[#D4AF37]"
          : "text-zinc-300 hover:bg-zinc-900 hover:text-white")
      }
      data-tutorial-step={testId}
      onClick={() => analytics.navigation(to, location.pathname)}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );

  return (
    <div className="h-screen w-screen grid grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      <aside className="row-span-2 bg-[#1C1E26] text-zinc-100 flex flex-col">
        {/* Logo Section */}
        <div className="flex justify-center px-6 pt-8 pb-6">
          <NavLink to="/" className="flex items-center">
            <img
              src="/brand/nexus_logo_transparent.svg"
              alt="Nexus"
              className="h-16 w-auto"
            />
          </NavLink>
        </div>

        {/* Client Switcher */}
        <div className="px-4 mb-4">
          <button
            onClick={() => setClientSwitcherOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2
                     bg-[#0F1115] text-zinc-200 rounded-lg
                     hover:bg-zinc-900 transition-colors
                     border border-zinc-800 hover:border-zinc-700"
          >
            <span className="text-sm truncate">
              {currentClient?.name || "Select client"}
            </span>
            <ChevronDown size={16} className="flex-shrink-0 ml-2" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {/* Global Navigation */}
          <div className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-400">
            Navigation
          </div>

          {/* Client-specific links */}
          {clientId && currentClient && (
            <>
              <div className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-400 mt-6">
                {currentClient.name}
              </div>
              {link(".", "Dashboard", <Home size={18} />, "nav.dashboard")}
              {link(
                "campaigns",
                "Campaigns",
                <Megaphone size={18} />,
                "nav.campaigns",
              )}
              {link(
                "segmentation",
                "Segmentation",
                <Users size={18} />,
                "nav.segmentation",
              )}
              {link(
                "data-lab",
                "Donor Data Lab",
                <FlaskConical size={18} />,
                "nav.data-lab",
              )}
              {link(
                "analytics",
                "Analytics",
                <BarChart3 size={18} />,
                "nav.analytics",
              )}
              {link(
                "reports",
                "Reports",
                <FileText size={18} />,
                "nav.reports",
              )}
              {link(
                "data-quality",
                "Data Quality",
                <Database size={18} />,
                "nav.data-quality",
              )}
              {link(
                "brand",
                "Brand Profile",
                <Palette size={18} />,
                "nav.brand",
              )}
            </>
          )}
        </nav>

        {/* Footer spacer for future user profile/settings */}
        <div className="p-4 border-t border-zinc-800">
          {/* User profile component can go here */}
        </div>
      </aside>

      <header className="bg-white border-b">
        {/* You can add a client-specific header here if needed */}
        <div className="h-14 flex items-center px-6">
          <h1 className="text-lg font-semibold text-slate-900">
            {currentClient?.name ? `${currentClient.name}` : "Client Dashboard"}
          </h1>
        </div>
      </header>

      <main className="overflow-auto bg-white text-slate-900">
        <Outlet />
      </main>

      {/* Client Switcher Modal */}
      <ClientSwitcherModal
        isOpen={clientSwitcherOpen}
        onClose={() => setClientSwitcherOpen(false)}
      />
    </div>
  );
};

export default ClientLayout;
