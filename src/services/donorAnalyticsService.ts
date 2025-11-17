/**
 * Donor Analytics Service
 *
 * Backend API integration for donor segmentation and analytics.
 * Handles CRUD operations for BehavioralSegments.
 */

import { BehavioralSegment } from './campaignComposer/defaultSegmentCatalog';

/**
 * Create a new behavioral segment for a client.
 * When backend is ready, this will POST to /api/clients/:clientId/segments
 */
export async function createSegment(
  clientId: string,
  segmentData: Omit<BehavioralSegment, 'segmentId'>
): Promise<BehavioralSegment> {
  // TODO: Replace with actual API call when backend is ready
  // const res = await fetch(`/api/clients/${clientId}/segments`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(segmentData),
  // });
  //
  // if (!res.ok) {
  //   throw new Error('Failed to create segment');
  // }
  //
  // return res.json();

  // For now, simulate API with localStorage
  const segmentId = `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fullSegment: BehavioralSegment = {
    ...segmentData,
    segmentId,
  };

  // Store in client-specific localStorage
  const storageKey = `nexus_segments_${clientId}`;
  const existing = getSegments(clientId);
  localStorage.setItem(
    storageKey,
    JSON.stringify([...existing, fullSegment])
  );

  return fullSegment;
}

/**
 * Get all segments for a client.
 * When backend is ready, this will GET from /api/clients/:clientId/segments
 */
export function getSegments(clientId: string): BehavioralSegment[] {
  // TODO: Replace with actual API call
  // const res = await fetch(`/api/clients/${clientId}/segments`);
  // if (!res.ok) throw new Error('Failed to fetch segments');
  // return res.json();

  const storageKey = `nexus_segments_${clientId}`;
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {
    return [];
  }
}

/**
 * Update an existing segment.
 * When backend is ready, this will PUT to /api/clients/:clientId/segments/:segmentId
 */
export async function updateSegment(
  clientId: string,
  segmentId: string,
  updates: Partial<BehavioralSegment>
): Promise<BehavioralSegment> {
  // TODO: Replace with actual API call
  const segments = getSegments(clientId);
  const index = segments.findIndex(s => s.segmentId === segmentId);

  if (index === -1) {
    throw new Error(`Segment ${segmentId} not found`);
  }

  const updated = { ...segments[index], ...updates };
  segments[index] = updated;

  const storageKey = `nexus_segments_${clientId}`;
  localStorage.setItem(storageKey, JSON.stringify(segments));

  return updated;
}

/**
 * Delete a segment.
 * When backend is ready, this will DELETE to /api/clients/:clientId/segments/:segmentId
 */
export async function deleteSegment(
  clientId: string,
  segmentId: string
): Promise<void> {
  // TODO: Replace with actual API call
  const segments = getSegments(clientId);
  const filtered = segments.filter(s => s.segmentId !== segmentId);

  const storageKey = `nexus_segments_${clientId}`;
  localStorage.setItem(storageKey, JSON.stringify(filtered));
}

/**
 * Get a single segment by ID.
 */
export function getSegmentById(
  clientId: string,
  segmentId: string
): BehavioralSegment | undefined {
  const segments = getSegments(clientId);
  return segments.find(s => s.segmentId === segmentId);
}
