// src/services/campaignService.ts
// Campaign service - Supabase-first implementation

import { supabase } from "@/lib/supabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabaseClient";

// Database row types
type CampaignRow = Tables<"campaigns">;
type CampaignInsert = TablesInsert<"campaigns">;
type CampaignUpdate = TablesUpdate<"campaigns">;

// Campaign types from database
export type CampaignType =
  | "email"
  | "direct_mail"
  | "social_media"
  | "multichannel"
  | "event"
  | "peer_to_peer";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "completed"
  | "paused"
  | "cancelled";

/**
 * Campaign type used in the app
 */
export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  category?: string;
  goalAmount?: number;
  raisedAmount?: number;
  marketingCost?: number;
  launchDate?: Date;
  endDate?: Date;
  tags: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campaign creation input
 */
export interface CreateCampaignInput {
  clientId: string;
  name: string;
  description?: string;
  type?: CampaignType;
  status?: CampaignStatus;
  category?: string;
  goalAmount?: number;
  launchDate?: Date;
  endDate?: Date;
  tags?: string[];
}

/**
 * Campaign update input
 */
export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  category?: string;
  goalAmount?: number;
  raisedAmount?: number;
  marketingCost?: number;
  launchDate?: Date;
  endDate?: Date;
  tags?: string[];
}

/**
 * Map database row to Campaign type
 */
function mapRowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    description: row.description ?? undefined,
    type: row.type as CampaignType,
    status: row.status as CampaignStatus,
    category: row.category ?? undefined,
    goalAmount: row.goal_amount ?? undefined,
    raisedAmount: row.raised_amount ?? undefined,
    marketingCost: row.marketing_cost ?? undefined,
    launchDate: row.launch_date ? new Date(row.launch_date) : undefined,
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    tags: row.tags || [],
    createdBy: row.created_by ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Map Campaign create input to database insert
 */
function mapCreateInputToInsert(input: CreateCampaignInput): CampaignInsert {
  return {
    client_id: input.clientId,
    name: input.name,
    description: input.description ?? null,
    type: input.type ?? "multichannel",
    status: input.status ?? "draft",
    category: input.category ?? null,
    goal_amount: input.goalAmount ?? null,
    raised_amount: 0,
    launch_date: input.launchDate?.toISOString() ?? null,
    end_date: input.endDate?.toISOString() ?? null,
    tags: input.tags ?? [],
    target_audience: {},
    goals_config: {},
    performance: {},
    metadata: {},
  };
}

/**
 * Map Campaign update input to database update
 */
function mapUpdateInputToUpdate(input: UpdateCampaignInput): CampaignUpdate {
  const update: CampaignUpdate = {};

  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.status !== undefined) update.status = input.status;
  if (input.category !== undefined) update.category = input.category;
  if (input.goalAmount !== undefined) update.goal_amount = input.goalAmount;
  if (input.raisedAmount !== undefined)
    update.raised_amount = input.raisedAmount;
  if (input.marketingCost !== undefined)
    update.marketing_cost = input.marketingCost;
  if (input.launchDate !== undefined)
    update.launch_date = input.launchDate?.toISOString();
  if (input.endDate !== undefined)
    update.end_date = input.endDate?.toISOString();
  if (input.tags !== undefined) update.tags = input.tags;

  return update;
}

/**
 * Campaign Service - Supabase-backed implementation
 */
export const campaignService = {
  /**
   * List campaigns for a specific client
   *
   * @param clientId - Client UUID
   * @param status - Optional status filter
   * @returns Array of campaigns
   */
  list: async (
    clientId: string,
    status?: CampaignStatus,
  ): Promise<Campaign[]> => {
    let query = supabase
      .from("campaigns")
      .select("*")
      .eq("client_id", clientId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching campaigns:", error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return (data || []).map(mapRowToCampaign);
  },

  /**
   * List active campaigns across all clients
   *
   * @returns Array of active campaigns
   */
  listActive: async (): Promise<Campaign[]> => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active campaigns:", error);
      throw new Error(`Failed to fetch active campaigns: ${error.message}`);
    }

    return (data || []).map(mapRowToCampaign);
  },

  /**
   * Get a single campaign by ID
   *
   * @param id - Campaign UUID
   * @returns Campaign or null if not found
   */
  getById: async (id: string): Promise<Campaign | null> => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      console.error("Error fetching campaign:", error);
      throw new Error(`Failed to fetch campaign: ${error.message}`);
    }

    return data ? mapRowToCampaign(data) : null;
  },

  /**
   * Create a new campaign
   *
   * @param input - Campaign creation data
   * @returns Newly created campaign
   */
  create: async (input: CreateCampaignInput): Promise<Campaign> => {
    const insert = mapCreateInputToInsert(input);

    const { data, error } = await supabase
      .from("campaigns")
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

    if (!data) {
      throw new Error("Campaign created but no data returned");
    }

    return mapRowToCampaign(data as CampaignRow);
  },

  /**
   * Update an existing campaign
   *
   * @param id - Campaign UUID
   * @param input - Campaign update data
   * @returns Updated campaign
   */
  update: async (
    id: string,
    input: UpdateCampaignInput,
  ): Promise<Campaign> => {
    const update = mapUpdateInputToUpdate(input);

    const { data, error } = await supabase
      .from("campaigns")
      .update(update as never)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      console.error("Error updating campaign:", error);
      throw new Error(`Failed to update campaign: ${error.message}`);
    }

    if (!data) {
      throw new Error("Campaign not found or update failed");
    }

    return mapRowToCampaign(data as CampaignRow);
  },

  /**
   * Soft delete a campaign
   *
   * @param id - Campaign UUID
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("campaigns")
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq("id", id);

    if (error) {
      console.error("Error deleting campaign:", error);
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  },

  /**
   * Hard delete a campaign (permanent)
   *
   * @param id - Campaign UUID
   */
  hardDelete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) {
      console.error("Error permanently deleting campaign:", error);
      throw new Error(
        `Failed to permanently delete campaign: ${error.message}`,
      );
    }
  },

  /**
   * Update campaign raised amount
   *
   * @param id - Campaign UUID
   * @param amount - New raised amount
   * @returns Updated campaign
   */
  updateRaisedAmount: async (
    id: string,
    amount: number,
  ): Promise<Campaign> => {
    const { data, error } = await supabase
      .from("campaigns")
      .update({ raised_amount: amount } as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating raised amount:", error);
      throw new Error(`Failed to update raised amount: ${error.message}`);
    }

    if (!data) {
      throw new Error("Campaign not found");
    }

    return mapRowToCampaign(data as CampaignRow);
  },

  /**
   * Get campaigns by status
   *
   * @param clientId - Client UUID
   * @param status - Campaign status
   * @returns Array of campaigns
   */
  getByStatus: async (
    clientId: string,
    status: CampaignStatus,
  ): Promise<Campaign[]> => {
    return campaignService.list(clientId, status);
  },

  /**
   * Search campaigns by name or description
   *
   * @param clientId - Client UUID
   * @param query - Search query
   * @returns Array of matching campaigns
   */
  search: async (clientId: string, query: string): Promise<Campaign[]> => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("client_id", clientId)
      .is("deleted_at", null)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching campaigns:", error);
      throw new Error(`Failed to search campaigns: ${error.message}`);
    }

    return (data || []).map(mapRowToCampaign);
  },
};
