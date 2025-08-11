export interface _Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalGiven: number;
  lastGiftDate?: Date;
  notes?: string;
  givingHistory?: Donation[];
}

export interface Donation {
  date: Date;
  amount: number;
  campaignId?: string;
  note?: string;
}
