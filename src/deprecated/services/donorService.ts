import { Donor } from '../models/donor';
import { apiGet } from './apiClient';

export async function fetchDonors(): Promise<Donor[]> {
  const response = await apiGet<Donor[]>('donors');
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}
