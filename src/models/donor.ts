export interface _Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalGiven: number;
  lastGiftDate?: Date;
  notes?: string;
}
