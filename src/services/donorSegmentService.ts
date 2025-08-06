// src/services/donorSegmentService.ts
import { DonorSegmentData, SegmentMetricsTrend, SegmentGoal } from '../models/donorSegments';

async function fetchDonorSegments(): Promise<DonorSegmentData[]> {
  const response = await fetch('/api/donor-segments');
  return response.json();
}

async function fetchDonorSegmentById(id: string): Promise<DonorSegmentData> {
  const response = await fetch(`/api/donor-segments/${id}`);
  return response.json();
}

async function createDonorSegment(data: Partial<DonorSegmentData>): Promise<DonorSegmentData> {
  const response = await fetch('/api/donor-segments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function updateDonorSegment(id: string, data: Partial<DonorSegmentData>): Promise<DonorSegmentData> {
  const response = await fetch(`/api/donor-segments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function deleteDonorSegment(id: string): Promise<void> {
  await fetch(`/api/donor-segments/${id}`, { method: 'DELETE' });
}

async function fetchSegmentMetrics(id: string): Promise<SegmentMetricsTrend> {
  const response = await fetch(`/api/donor-segments/${id}/metrics`);
  return response.json();
}

async function fetchSegmentGoals(id: string): Promise<SegmentGoal[]> {
  const response = await fetch(`/api/donor-segments/${id}/goals`);
  return response.json();
}

async function compareSegments(id1: string, id2: string): Promise<any> {
  const response = await fetch(`/api/donor-segments/compare?id1=${id1}&id2=${id2}`);
  return response.json();
}

const donorSegmentService = {
  fetchDonorSegments,
  fetchDonorSegmentById,
  createDonorSegment,
  updateDonorSegment,
  deleteDonorSegment,
  fetchSegmentMetrics,
  fetchSegmentGoals,
  compareSegments, // ✅ Include the new method here
};

export default donorSegmentService;
