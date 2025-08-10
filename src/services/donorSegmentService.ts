import {
  DonorSegment,
  _DonorSegmentData as DonorSegmentData, // Use the correct export name
} from "../models/donorSegments";

// Get all donor segments
export async function getDonorSegments(): Promise<DonorSegment[]> {
  const response = await fetch("/api/donor-segments");
  return response.json();
}

// Get a specific donor segment by ID
export async function getDonorSegmentById(id: string): Promise<DonorSegment> {
  const response = await fetch(`/api/donor-segments/${id}`);
  return response.json();
}

// Create a new donor segment
export async function createDonorSegment(
  data: Partial<DonorSegment>,
): Promise<DonorSegment> {
  const response = await fetch("/api/donor-segments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Update an existing donor segment
export async function updateDonorSegment(
  id: string,
  data: Partial<DonorSegment>,
): Promise<DonorSegment> {
  const response = await fetch(`/api/donor-segments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Delete a donor segment
export async function deleteDonorSegment(id: string): Promise<void> {
  await fetch(`/api/donor-segments/${id}`, { method: "DELETE" });
}

// Get metrics for a specific donor segment
export async function getDonorSegmentMetrics(
  id: string,
): Promise<DonorSegmentData> {
  const response = await fetch(`/api/donor-segments/${id}/metrics`);
  return response.json();
}

// Get goals for a specific donor segment
export async function getDonorSegmentGoals(id: string): Promise<any> {
  const response = await fetch(`/api/donor-segments/${id}/goals`);
  return response.json();
}

// Compare two donor segments
export async function compareDonorSegments(
  id1: string,
  id2: string,
): Promise<any> {
  const response = await fetch(
    `/api/donor-segments/compare?id1=${id1}&id2=${id2}`,
  );
  return response.json();
}
