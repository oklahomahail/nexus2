// src/services/clientService.ts
// Client service - Supabase-first implementation

import { supabase } from "@/lib/supabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabaseClient";

export type { Client } from "@/types/client";
import type { Client } from "@/types/client";

// Database row type from schema
type ClientRow = Tables<"clients">;
type ClientInsert = TablesInsert<"clients">;
type ClientUpdate = TablesUpdate<"clients">;

/**
 * Map database row to Client type used in the app
 * Converts snake_case database fields to camelCase
 */
function mapRowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name ?? undefined,
    primaryContactName: row.primary_contact_name ?? undefined,
    primaryContactEmail: row.primary_contact_email ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

/**
 * Map Client type to database insert format
 */
function mapClientToInsert(
  client: Omit<Client, "id" | "createdAt" | "updatedAt">,
): ClientInsert {
  return {
    name: client.name,
    short_name: client.shortName ?? null,
    primary_contact_name: client.primaryContactName ?? null,
    primary_contact_email: client.primaryContactEmail ?? null,
    notes: client.notes ?? null,
    is_active: true,
    brand: {},
    settings: {},
  };
}

/**
 * Map Client type to database update format
 */
function mapClientToUpdate(
  client: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>,
): ClientUpdate {
  const update: ClientUpdate = {};

  if (client.name !== undefined) update.name = client.name;
  if (client.shortName !== undefined) update.short_name = client.shortName;
  if (client.primaryContactName !== undefined)
    update.primary_contact_name = client.primaryContactName;
  if (client.primaryContactEmail !== undefined)
    update.primary_contact_email = client.primaryContactEmail;
  if (client.notes !== undefined) update.notes = client.notes;

  return update;
}

/**
 * Client Service - Supabase-backed implementation
 *
 * All methods include error handling and proper type mapping
 * Uses RLS (Row Level Security) for authorization
 */
export const clientService = {
  /**
   * List all clients accessible to the current user
   * Only returns active clients (not soft-deleted)
   *
   * @throws Error if database query fails
   */
  list: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching clients:", error);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return (data || []).map(mapRowToClient);
  },

  /**
   * Get all clients (alias for list)
   * Maintained for backward compatibility
   */
  getAllClients: async (): Promise<Client[]> => {
    return clientService.list();
  },

  /**
   * Get a single client by ID
   *
   * @param id - Client UUID
   * @returns Client or null if not found
   * @throws Error if database query fails
   */
  getById: async (id: string): Promise<Client | null> => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      console.error("Error fetching client:", error);
      throw new Error(`Failed to fetch client: ${error.message}`);
    }

    return data ? mapRowToClient(data) : null;
  },

  /**
   * Create a new client
   *
   * @param clientData - Client data (without id, createdAt, updatedAt)
   * @returns Newly created client
   * @throws Error if database insert fails
   */
  createClient: async (
    clientData: Omit<Client, "id" | "createdAt" | "updatedAt">,
  ): Promise<Client> => {
    const insert = mapClientToInsert(clientData);

    const { data, error } = await supabase
      .from("clients")
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      console.error("Error creating client:", error);
      throw new Error(`Failed to create client: ${error.message}`);
    }

    if (!data) {
      throw new Error("Client created but no data returned");
    }

    return mapRowToClient(data as ClientRow);
  },

  /**
   * Update an existing client
   *
   * @param id - Client UUID
   * @param updates - Partial client data to update
   * @returns Updated client
   * @throws Error if database update fails
   */
  updateClient: async (
    id: string,
    updates: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Client> => {
    const update = mapClientToUpdate(updates);

    const { data, error } = await supabase
      .from("clients")
      .update(update as never)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      console.error("Error updating client:", error);
      throw new Error(`Failed to update client: ${error.message}`);
    }

    if (!data) {
      throw new Error("Client not found or update failed");
    }

    return mapRowToClient(data as ClientRow);
  },

  /**
   * Soft delete a client
   * Sets deleted_at timestamp instead of actually deleting the row
   *
   * @param id - Client UUID
   * @throws Error if database update fails
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("clients")
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq("id", id);

    if (error) {
      console.error("Error deleting client:", error);
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  },

  /**
   * Permanently delete a client (hard delete)
   * Use with caution - this cannot be undone
   *
   * @param id - Client UUID
   * @throws Error if database delete fails
   */
  hardDelete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error("Error permanently deleting client:", error);
      throw new Error(`Failed to permanently delete client: ${error.message}`);
    }
  },

  /**
   * Restore a soft-deleted client
   *
   * @param id - Client UUID
   * @returns Restored client
   * @throws Error if database update fails
   */
  restore: async (id: string): Promise<Client> => {
    const { data, error } = await supabase
      .from("clients")
      .update({ deleted_at: null } as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error restoring client:", error);
      throw new Error(`Failed to restore client: ${error.message}`);
    }

    if (!data) {
      throw new Error("Client not found");
    }

    return mapRowToClient(data as ClientRow);
  },
};

// Backward compatibility exports
export const listClients = () => clientService.getAllClients();
export const deleteClient = (id: string) => clientService.delete(id);
export const createClient = (
  data: Omit<Client, "id" | "createdAt" | "updatedAt">,
) => clientService.createClient(data);
export const updateClient = (
  id: string,
  data: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>,
) => clientService.updateClient(id, data);
