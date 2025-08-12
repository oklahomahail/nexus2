// src/services/clientService.ts
export interface Client {
  id: string;
  name: string;
  brand?: { primary?: string; secondary?: string; logoUrl?: string };
  contacts?: Array<{ id: string; name: string; email?: string; role?: string }>;
  settings?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  // Legacy fields for compatibility
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  industry?: string;
  status?: "active" | "inactive" | "pending";
  description?: string;
  logo?: string;
  contactPerson?: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  industry?: string;
  description?: string;
  contactPerson?: string;
  brand?: { primary?: string; secondary?: string; logoUrl?: string };
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: "active" | "inactive" | "pending";
}

// Simple in-memory store for now. Replace with IndexedDB adapter.
const store = new Map<string, Client>();

function now() {
  return Date.now();
}

export const clientService = {
  async list(): Promise<Client[]> {
    return Array.from(store.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  },

  async get(id: string): Promise<Client | null> {
    return store.get(id) ?? null;
  },

  async upsert(
    input: Omit<Client, "createdAt" | "updatedAt"> &
      Partial<Pick<Client, "createdAt">>,
  ): Promise<Client> {
    const existing = input.id ? store.get(input.id) : undefined;
    const createdAt = existing?.createdAt ?? input.createdAt ?? now();
    const client: Client = {
      ...existing,
      ...input,
      createdAt,
      updatedAt: now(),
    } as Client;
    store.set(client.id, client);
    return client;
  },

  async remove(id: string): Promise<void> {
    store.delete(id);
  },

  async seed(samples: Array<Omit<Client, "createdAt" | "updatedAt">>) {
    for (const s of samples) {
      await this.upsert({ ...s, createdAt: now() });
    }
  },

  // Legacy methods for backward compatibility
  async getAllClients(): Promise<Client[]> {
    return this.list();
  },

  async getClientById(id: string): Promise<Client | null> {
    return this.get(id);
  },

  async createClient(data: CreateClientData): Promise<Client> {
    const newClient = {
      id: Date.now().toString(),
      ...data,
      status: "pending" as const,
    };
    return this.upsert(newClient);
  },

  async updateClient(
    id: string,
    data: UpdateClientData,
  ): Promise<Client | null> {
    const existing = await this.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...data };
    return this.upsert(updated);
  },

  async deleteClient(id: string): Promise<boolean> {
    const exists = store.has(id);
    if (exists) {
      await this.remove(id);
    }
    return exists;
  },

  async searchClients(query: string): Promise<Client[]> {
    const clients = await this.list();
    const lowercaseQuery = query.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercaseQuery) ||
        client.email?.toLowerCase().includes(lowercaseQuery) ||
        client.contactPerson?.toLowerCase().includes(lowercaseQuery),
    );
  },

  async getClientsByStatus(status: Client["status"]): Promise<Client[]> {
    const clients = await this.list();
    return clients.filter((client) => client.status === status);
  },
};

// Development seed data
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Convert your existing mock data to the new format
  const legacyClients = [
    {
      id: "acme",
      name: "Acme Nonprofit",
      email: "contact@acmenonprofit.org",
      phone: "(555) 123-4567",
      website: "https://acmenonprofit.org",
      industry: "Education",
      status: "active" as const,
      contactPerson: "Jane Smith",
      description:
        "Supporting education initiatives in underserved communities.",
      brand: { primary: "#2563eb", secondary: "#1e40af" },
    },
    {
      id: "green-future",
      name: "Green Future Foundation",
      email: "info@greenfuture.org",
      phone: "(555) 987-6543",
      website: "https://greenfuture.org",
      industry: "Environment",
      status: "active" as const,
      contactPerson: "Mike Johnson",
      description: "Environmental conservation and sustainability programs.",
      brand: { primary: "#059669", secondary: "#047857" },
    },
    {
      id: "health-first",
      name: "Health First Initiative",
      email: "contact@healthfirst.org",
      phone: "(555) 456-7890",
      industry: "Healthcare",
      status: "pending" as const,
      contactPerson: "Sarah Davis",
      description: "Providing healthcare access to underserved populations.",
      brand: { primary: "#dc2626", secondary: "#b91c1c" },
    },
  ];

  // Auto-seed with a small delay to ensure it works
  setTimeout(() => {
    void clientService.seed(legacyClients).catch(console.error);
  }, 100);
}

export default clientService;
