// src/components/CampaignModal.tsx - Modernized with unified dark theme
import React, { useState, useEffect } from 'react';
import { Campaign, CampaignCreateRequest, CampaignUpdateRequest } from '../models/campaign';
import { X, Plus, AlertCircle, Calendar, DollarSign, Target, Users } from 'lucide-react';
import clsx from 'clsx';

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
  const [currentStep, setCurrentStep] = useState(1);

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
      setCurrentStep(1);
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
          endDate: form.endDate || "",
          status: form.status || "Planned",
          category: form.category || "General",
          targetAudience: form.targetAudience || "",
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
          endDate: form.endDate || "",
          status: form.status as 'Planned' | 'Active',
          category: form.category || "General",
          targetAudience: form.targetAudience || "",
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
    { value: 'General', label: 'General', icon: '📋', color: 'from-blue-500 to-blue-600' },
    { value: 'Emergency', label: 'Emergency', icon: '🚨', color: 'from-red-500 to-red-600' },
    { value: 'Education', label: 'Education', icon: '🎓', color: 'from-green-500 to-green-600' },
    { value: 'Healthcare', label: 'Healthcare', icon: '🏥', color: 'from-purple-500 to-purple-600' },
    { value: 'Environment', label: 'Environment', icon: '🌱', color: 'from-emerald-500 to-emerald-600' },
    { value: 'Community', label: 'Community', icon: '🏘️', color: 'from-orange-500 to-orange-600' },
    { value: 'Other', label: 'Other', icon: '📌', color: 'from-gray-500 to-gray-600' }
  ];

  const statusOptions = mode === 'edit' && initialData
    ? [
        { value: 'Planned', label: 'Planned', color: 'bg-yellow-500/20 text-yellow-400' },
        { value: 'Active', label: 'Active', color: 'bg-green-500/20 text-green-400' },
        { value: 'Completed', label: 'Completed', color: 'bg-blue-500/20 text-blue-400' },
        { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400' }
      ]
    : [
        { value: 'Planned', label: 'Planned', color: 'bg-yellow-500/20 text-yellow-400' },
        { value: 'Active', label: 'Active', color: 'bg-green-500/20 text-green-400' }
      ];

  const steps = [
    { id: 1, name: 'Basic Info', icon: Target },
    { id: 2, name: 'Details', icon: Calendar },
    { id: 3, name: 'Settings', icon: Users }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card-base w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="border-b border-surface/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'edit' ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
              <p className="text-slate-400">
                {mode === 'edit' ? 'Update your campaign details' : 'Launch your next fundraising initiative'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={clsx(
                      'flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200',
                      isActive && 'bg-blue-500/20 border border-blue-500/30',
                      isCompleted && 'bg-green-500/20 border border-green-500/30',
                      !isActive && !isCompleted && 'bg-slate-800/50 border border-slate-700/50'
                    )}
                  >
                    <Icon className={clsx(
                      'w-4 h-4',
                      isActive && 'text-blue-400',
                      isCompleted && 'text-green-400',
                      !isActive && !isCompleted && 'text-slate-400'
                    )} />
                    <span className={clsx(
                      'text-sm font-medium',
                      isActive && 'text-blue-300',
                      isCompleted && 'text-green-300',
                      !isActive && !isCompleted && 'text-slate-400'
                    )}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-slate-700/50 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Error Display */}
            {errors.submit && (
              <div className="card-base p-4 border-red-500/30 bg-red-500/5">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-medium text-sm">Failed to save campaign</p>
                    <p className="text-red-400/80 text-sm mt-1">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Campaign Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={clsx(
                        'input-base text-lg h-12',
                        errors.name && 'border-red-500/50 bg-red-500/5'
                      )}
                      placeholder="Enter an inspiring campaign name"
                      required
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      className="input-base resize-none"
                      placeholder="Describe your campaign goals, impact, and why people should contribute..."
                    />
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fundraising Goal *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="goal"
                        value={form.goal || ''}
                        onChange={handleChange}
                        className={clsx(
                          'input-base pl-12 text-lg font-semibold',
                          errors.goal && 'border-red-500/50 bg-red-500/5'
                        )}
                        placeholder="25,000"
                        min={1}
                        required
                      />
                    </div>
                    {errors.goal && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.goal}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, category: option.value as any }))}
                          className={clsx(
                            'flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border text-left',
                            form.category === option.value
                              ? 'border-blue-500/50 bg-blue-500/10 text-white'
                              : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-700/30'
                          )}
                        >
                          <span className="text-lg">{option.icon}</span>
                          <span className="font-medium text-sm">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className={clsx(
                        'input-base',
                        errors.startDate && 'border-red-500/50 bg-red-500/5'
                      )}
                      required
                    />
                    {errors.startDate && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className={clsx(
                        'input-base',
                        errors.endDate && 'border-red-500/50 bg-red-500/5'
                      )}
                      required
                    />
                    {errors.endDate && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.endDate}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, status: option.value as any }))}
                          className={clsx(
                            'px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
                            form.status === option.value
                              ? `${option.color} border-current`
                              : 'text-slate-400 border-slate-700/50 hover:text-slate-300 hover:border-slate-600/50'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={form.targetAudience}
                      onChange={handleChange}
                      className="input-base"
                      placeholder="e.g., Parents, local businesses, alumni"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-400 hover:text-blue-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 input-base"
                      placeholder="Add a tag (press Enter)"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="button-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    className="input-base resize-none"
                    placeholder="Internal notes for your team (not visible to donors)..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-surface/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="button-ghost"
                >
                  ← Previous
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="button-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="button-primary"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {loading ? 'Saving...' : (mode === 'edit' ? 'Update Campaign' : 'Create Campaign')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
