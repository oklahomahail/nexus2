// src/context/utils.ts
// Utility functions for context operations

import { AppAction, InternalCampaignFilters } from './types';
import { CampaignFilters } from '../models/campaign';
import { Dispatch } from 'react';

// Helper functions for type conversion between internal and external filter formats
export const convertToCampaignFilters = (internal: InternalCampaignFilters): CampaignFilters => {
  const external: CampaignFilters = {};
  
  if (internal.status?.length) {
    external.status = internal.status as any[];
  }
  
  if (internal.category?.length) {
    external.category = internal.category as any[];
  }
  
  if (internal.dateRange) {
    external.dateRange = internal.dateRange;
  }
  
  if (internal.search) {
    external.search = internal.search;
  }
  
  if (internal.tags?.length) {
    external.tags = internal.tags;
  }
  
  return external;
};

export const convertFromCampaignFilters = (external: CampaignFilters): InternalCampaignFilters => {
  const internal: InternalCampaignFilters = {};
  
  if (external.status?.length) {
    internal.status = external.status.map(s => String(s));
  }
  
  if (external.category?.length) {
    internal.category = external.category.map(c => String(c));
  }
  
  if (external.dateRange) {
    internal.dateRange = external.dateRange;
  }
  
  if (external.search) {
    internal.search = external.search;
  }
  
  if (external.tags?.length) {
    internal.tags = external.tags;
  }
  
  return internal;
};

// Helper to check if filters are empty
export const hasActiveFilters = (filters: InternalCampaignFilters): boolean => {
  return !!(
    filters.search ||
    (filters.status && filters.status.length > 0) ||
    (filters.category && filters.category.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.dateRange && (filters.dateRange.start || filters.dateRange.end))
  );
};


// Helper to generate unique IDs
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const getInitialData = (dispatch: Dispatch<AppAction>) => {
  };