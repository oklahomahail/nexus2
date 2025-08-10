// hooks/useCampaigns.ts
import { useState, useEffect } from "react";

import { Campaign } from "../models/campaign";
import * as campaignService from "../services/campaignService";

export interface UseCampaignsResult {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCampaigns(): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch campaigns",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
  };
}
