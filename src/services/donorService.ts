// src/services/donorService.ts
import { _Donor as Donor } from "../models/donor";

// Mock donor data for development purposes
let donors: Donor[] = [
  {
    id: "1",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "555-1234",
    address: "123 Main St, Springfield",
    totalGiven: 5000,
    lastGiftDate: new Date("2024-09-15"),
    notes: "Prefers email contact",
    givingHistory: [
      { date: new Date("2024-09-15"), amount: 2500 },
      { date: new Date("2023-12-10"), amount: 2500 },
    ],
  },
  {
    id: "2",
    name: "Robert Johnson",
    email: "robert@example.com",
    address: "789 Oak Ave, Metropolis",
    totalGiven: 1200,
    lastGiftDate: new Date("2024-08-01"),
    givingHistory: [{ date: new Date("2024-08-01"), amount: 1200 }],
  },
];

export async function getDonors(): Promise<Donor[]> {
  await new Promise((r) => setTimeout(r, 300));
  return donors;
}

export async function getDonorById(id: string): Promise<Donor | null> {
  await new Promise((r) => setTimeout(r, 200));
  return donors.find((d) => d.id === id) || null;
}

export async function createDonor(data: Partial<Donor>): Promise<Donor> {
  await new Promise((r) => setTimeout(r, 300));
  const newDonor: Donor = {
    id: Date.now().toString(),
    name: data.name || "New Donor",
    email: data.email || "",
    phone: data.phone,
    address: data.address,
    totalGiven: data.totalGiven || 0,
    lastGiftDate: data.lastGiftDate,
    notes: data.notes,
    givingHistory: data.givingHistory || [],
  };
  donors.push(newDonor);
  return newDonor;
}

export async function updateDonor(
  id: string,
  updates: Partial<Donor>,
): Promise<Donor> {
  await new Promise((r) => setTimeout(r, 300));
  const index = donors.findIndex((d) => d.id === id);
  if (index === -1) throw new Error("Donor not found");
  donors[index] = { ...donors[index], ...updates };
  return donors[index];
}

export async function deleteDonor(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  donors = donors.filter((d) => d.id !== id);
}
