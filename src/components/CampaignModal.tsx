import React, { useState, useEffect } from 'react';
import { Campaign, CampaignCreateRequest, CampaignUpdateRequest } from '../models/campaign';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: CampaignCreateRequest | CampaignUpdateRequest) => Promise<void>;
  initialData?: Campaign | null;
  mode: 'create' | 'edit';
}

type CampaignFormData = {
  id?: string;
  name: string;
  description?: string;
  goal: number;
  startDate: string;
  endDate: string;
  status: Campaign['status'];
  category: Campaign['category'];
  targetAudience?: string;
  tags?: string[];
  notes?: string;
};

export const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode
}) => {
  const [form, setForm] = useState<CampaignFormData>({
    name: '',
    description: '',
    goal: 0,
    startDate: '',
    endDate: '',
    status: 'Planned',
    category: 'General',
    targetAudience: '',
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setForm({
          id: initialData.id,
          name: initialData.name,
          description: initialData.description || '',
          goal: initialData.goal,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          status: initialData.status,
          category: initialData.category,
          targetAudience: initialData.targetAudience || '',
          tags: initialData.tags || [],
          notes: initialData.notes || ''
        });
      } else {
        // Reset form for create mode
        setForm({
          name: '',
          description: '',
          goal: 0,
          startDate: '',
          endDate: '',
          status: 'Planned',
          category: 'General',
          targetAudience: '',
          tags: [],
          notes: ''
        });
      }
      setErrors({});
      setNewTag('');
    }
  }, [isOpen, initialData, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (form.goal <= 0) {
      newErrors.goal = 'Goal must be greater than 0';
    }

    if (!form.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!form.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'goal' ? Number(value) : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !form.tags?.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement) {
      e.preventDefault();
      if (newTag.trim()) {
        handleAddTag();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'edit' && form.id) {
        const submitData: CampaignUpdateRequest = {
          id: form.id,
          name: form.name,
          description: form.description,
          goal: form.goal,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
          category: form.category,
          targetAudience: form.targetAudience,
          tags: form.tags,
          notes: form.notes
        };
        await onSave(submitData);
      } else {
        const submitData: CampaignCreateRequest = {
          name: form.name,
          description: form.description,
          goal: form.goal,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status as 'Planned' | 'Active',
          category: form.category,
          targetAudience: form.targetAudience,
          tags: form.tags,
          notes: form.notes
        };
        await onSave(submitData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save campaign:', error);
      setErrors({ submit: 'Failed to save campaign. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoryOptions = [
    { value: 'General', label: 'General', icon: '📋' },
    { value: 'Emergency', label: 'Emergency', icon: '🚨' },
    { value: 'Education', label: 'Education', icon: '🎓' },
    { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'Environment', label: 'Environment', icon: '🌱' },
    { value: 'Community', label: 'Community', icon: '🏘️' },
    { value: 'Other', label: 'Other', icon: '📌' }
  ];

  const statusOptions = mode === 'edit' && initialData
    ? [
        { value: 'Planned', label: 'Planned' },
        { value: 'Active', label: 'Active' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' }
      ]
    : [
        { value: 'Planned', label: 'Planned' },
        { value: 'Active', label: 'Active' }
      ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter campaign name"
              required
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the campaign goals and purpose"
            />
          </div>

          {/* Goal and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fundraising Goal ($) *
              </label>
              <input
                type="number"
                name="goal"
                value={form.goal || ''}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.goal ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min={1}
                required
              />
              {errors.goal && <p className="mt-1 text-xs text-red-600">{errors.goal}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          {/* Status and Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                name="targetAudience"
                value={form.targetAudience}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Parents, local businesses, alumni"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Internal notes for your team (not visible to donors)"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Saving...' : (mode === 'edit' ? 'Update Campaign' : 'Create Campaign')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};