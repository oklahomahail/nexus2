// src/hooks/useCampaigns.ts

import { useAppContext } from '@/context/AppProviders';

interface CampaignStats {
  active: number;
  totalRaised: number;
}

export const useCampaigns = (): { stats: CampaignStats } => {
  const { state } = useAppContext();

  const active = state.campaigns?.filter((c) => c.status === 'Active').length || 0;
  const totalRaised = state.campaigns?.reduce((sum, c) => sum + (c.raised || 0), 0) || 0;

  return {
    stats: {
      active,
      totalRaised,
    },
  };
};
