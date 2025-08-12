/* eslint-disable react-refresh/only-export-components */
// src/context/ClientContext.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

import { clientService, type Client } from "@/services/clientService";

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  setCurrentClient: (id: string | null) => void;
  reload: () => Promise<void>;
}

const Ctx = createContext<ClientState | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("nexus_current_client");
  });

  const currentClient = useMemo(
    () => clients.find((c) => c.id === currentId) ?? null,
    [clients, currentId],
  );

  async function reload() {
    try {
      const list = await clientService.list();
      setClients(list);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
    }
  }

  function setCurrentClient(id: string | null) {
    setCurrentId(id);
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem("nexus_current_client", id);
      else window.localStorage.removeItem("nexus_current_client");
    }
  }

  useEffect(() => {
    void reload().catch(console.error);
  }, []);

  const value = useMemo(
    () => ({ clients, currentClient, setCurrentClient, reload }),
    [clients, currentClient],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClient() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
}
