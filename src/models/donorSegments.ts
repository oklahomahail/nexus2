// models/donorSegments.ts

export interface DonorSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentCriteria {
  donationAmount?: {
    min?: number;
    max?: number;
  };
  donationFrequency?: "one-time" | "monthly" | "annual" | "custom";
  lastDonationDate?: {
    after?: string;
    before?: string;
  };
  totalDonations?: {
    min?: number;
    max?: number;
  };
}

export interface DonorSegmentData {
  segmentId: string;
  donorCount: number;
  totalDonated: number;
  averageDonation: number;
  retentionRate: number;
}

// Export with both names to fix import issues
export type { DonorSegmentData as _DonorSegmentData };

export interface SegmentMetrics {
  segmentData: DonorSegmentData[]; // This should now work
}
