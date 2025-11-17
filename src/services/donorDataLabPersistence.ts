/**
 * Donor Data Lab Run Persistence
 *
 * Stores and retrieves Data Lab analysis runs per client.
 * Enables:
 * - History of past analyses
 * - AI context enrichment (using latest run's recommendations)
 * - Re-opening previous analyses
 */

import { AnalysisResult, LabRecommendations } from "./donorDataLab";

export interface LabRun {
  runId: string;
  clientId: string;
  fileName: string;
  runDate: string; // ISO date
  rowsProcessed: number;
  rowsIgnored: number;
  analysis: AnalysisResult;
  recommendations: LabRecommendations;
}

/**
 * Save a completed Lab run.
 * When backend is ready, POST to /api/clients/:clientId/data-lab-runs
 */
export function saveLabRun(params: {
  clientId: string;
  fileName: string;
  rowsProcessed: number;
  rowsIgnored: number;
  analysis: AnalysisResult;
  recommendations: LabRecommendations;
}): LabRun {
  const {
    clientId,
    fileName,
    rowsProcessed,
    rowsIgnored,
    analysis,
    recommendations,
  } = params;

  const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const labRun: LabRun = {
    runId,
    clientId,
    fileName,
    runDate: new Date().toISOString(),
    rowsProcessed,
    rowsIgnored,
    analysis,
    recommendations,
  };

  // Store in client-specific localStorage
  const storageKey = `nexus_lab_runs_${clientId}`;
  const existing = getLabRuns(clientId);

  // Keep only last 10 runs to avoid storage bloat
  const updated = [labRun, ...existing].slice(0, 10);

  localStorage.setItem(storageKey, JSON.stringify(updated));

  return labRun;
}

/**
 * Get all Lab runs for a client, sorted by date (newest first).
 * When backend is ready, GET from /api/clients/:clientId/data-lab-runs
 */
export function getLabRuns(clientId: string): LabRun[] {
  const storageKey = `nexus_lab_runs_${clientId}`;
  try {
    const runs = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return runs.sort(
      (a: LabRun, b: LabRun) =>
        new Date(b.runDate).getTime() - new Date(a.runDate).getTime(),
    );
  } catch {
    return [];
  }
}

/**
 * Get the most recent Lab run for a client.
 * This is used to enrich AI prompts with current strategy context.
 */
export function getLatestLabRun(clientId: string): LabRun | null {
  const runs = getLabRuns(clientId);
  return runs[0] || null;
}

/**
 * Get a specific Lab run by ID.
 */
export function getLabRunById(clientId: string, runId: string): LabRun | null {
  const runs = getLabRuns(clientId);
  return runs.find((r) => r.runId === runId) || null;
}

/**
 * Delete a Lab run.
 */
export function deleteLabRun(clientId: string, runId: string): void {
  const runs = getLabRuns(clientId);
  const filtered = runs.filter((r) => r.runId !== runId);

  const storageKey = `nexus_lab_runs_${clientId}`;
  localStorage.setItem(storageKey, JSON.stringify(filtered));
}

/**
 * Check if client has any Lab runs.
 */
export function hasLabRuns(clientId: string): boolean {
  return getLabRuns(clientId).length > 0;
}
