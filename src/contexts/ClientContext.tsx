import React, { createContext, useContext, useMemo, useState } from "react";

export type Client = { id: string; name: string; slug?: string };
export type Campaign = {
  id: string;
  name: string;
  clientId: string;
  status?: string;
};

type Ctx = {
  currentClient: Client | null;
  setCurrentClient: (c: Client) => void;
  campaigns: Campaign[];
  setCampaigns: (c: Campaign[]) => void;
};

const ClientCtx = createContext<Ctx | null>(null);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const value = useMemo(
    () => ({ currentClient, setCurrentClient, campaigns, setCampaigns }),
    [currentClient, campaigns],
  );
  return <ClientCtx.Provider value={value}>{children}</ClientCtx.Provider>;
};

export function useClientCtx() {
  const ctx = useContext(ClientCtx);
  if (!ctx) throw new Error("useClientCtx must be used within ClientProvider");
  return ctx;
}
