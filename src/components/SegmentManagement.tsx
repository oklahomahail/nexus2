import React, { useState } from 'react';
import { DonorSegment, DEFAULT_SEGMENT_TEMPLATES } from '../models/donorSegments';

interface SegmentManagementProps {
  segments: DonorSegment[];
  onSegmentCreate: (segment: Omit<DonorSegment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSegmentUpdate: (id: string, updates: Partial<DonorSegment>) => void;
  onSegmentDelete: (id: string) => void;
}

type ModalMode = 'create' | 'edit' | 'template' | null;

export const SegmentManagement: React.FC<SegmentManagementProps> = ({
  segments,
  onSegmentCreate,
  onSegmentUpdate,
  onSegmentDelete
}) => {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingSegment, setEditingSegment] = useState<DonorSegment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '👥',
    isActive: true,
    criteria: {
      minGiftAmount: '',
      maxGiftAmount: '',
      giftFrequency: '',
      totalLifetimeGiving: '',
      monthsSinceLastGift: '',
      engagementLevel: ''
    }
  });

  const colorOptions = [
    { value: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Blue', preview: 'bg-blue-100' },
    { value: 'bg-green-100 text-green-800 border-green-200', label: 'Green', preview: 'bg-green-100' },
    { value: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Purple', preview: 'bg-purple-100' },
    { value: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Orange', preview: 'bg-orange-100' },
    { value: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Pink', preview: 'bg-pink-100' },
    { value: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Indigo', preview: 'bg-indigo-100' },
    { value: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Yellow', preview: 'bg-yellow-100' },
    { value: 'bg-red-100 text-red-800 border-red-200', label: 'Red', preview: 'bg-red-100' },
    { value: 'bg-teal-100 text-teal-800 border-teal-200', label: 'Teal', preview: 'bg-teal-100' },
    { value: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Gray', preview: 'bg-gray-100' }
  ];

  const iconOptions = ['👥', '💎', '🔄', '📅', '🤝', '🎪', '🏢', '⏰', '✨', '🎓', '🌟', '💰', '🎯', '📈', '🏆'];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '👥',
      isActive: true,
      criteria: {
        minGiftAmount: '',
        maxGiftAmount: '',
        giftFrequency: '',
        totalLifetimeGiving: '',
        monthsSinceLastGift: '',
        engagementLevel: ''
      }
    });
  };

  const handleCreateSegment = () => {
    setModalMode('create');
    resetForm();
    setEditingSegment(null);
  };

  const handleEditSegment = (segment: DonorSegment) => {
    setModalMode('edit');
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      color: segment.color,
      icon: segment.icon,
      isActive: segment.isActive,
      criteria: {
        minGiftAmount: segment.criteria?.minGiftAmount?.toString() || '',
        maxGiftAmount: segment.criteria?.maxGiftAmount?.toString() || '',
        giftFrequency: segment.criteria?.giftFrequency || '',
        totalLifetimeGiving: segment.criteria?.totalLifetimeGiving?.toString() || '',
        monthsSinceLastGift: segment.criteria?.monthsSinceLastGift?.toString() || '',
        engagementLevel: segment.criteria?.engagementLevel || ''
      }
    });
  };

  const handleUseTemplate = (template: typeof DEFAULT_SEGMENT_TEMPLATES[0]) => {
    setModalMode('create');
    setEditingSegment(null);
    setFormData({
      name: template.name,
      description: template.description || '',
      color: template.color,
      icon: template.icon,
      isActive: template.isActive,
      criteria: {
        minGiftAmount: template.criteria?.minGiftAmount?.toString() || '',
        maxGiftAmount: template.criteria?.maxGiftAmount?.toString() || '',
        giftFrequency: template.criteria?.giftFrequency || '',
        totalLifetimeGiving: template.criteria?.totalLifetimeGiving?.toString() || '',
        monthsSinceLastGift: template.criteria?.monthsSinceLastGift?.toString() || '',
        engagementLevel: template.criteria?.engagementLevel || ''
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const criteria = {
      ...(formData.criteria.minGiftAmount && { minGiftAmount: Number(formData.criteria.minGiftAmount) }),
      ...(formData.criteria.maxGiftAmount && { maxGiftAmount: Number(formData.criteria.maxGiftAmount) }),
      ...(formData.criteria.giftFrequency && { giftFrequency: formData.criteria.giftFrequency as any }),
      ...(formData.criteria.totalLifetimeGiving && { totalLifetimeGiving: Number(formData.criteria.totalLifetimeGiving) }),
      ...(formData.criteria.monthsSinceLastGift && { monthsSinceLastGift: Number(formData.criteria.monthsSinceLastGift) }),
      ...(formData.criteria.engagementLevel && { engagementLevel: formData.criteria.engagementLevel as any })
    };

    const segmentData = {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      isDefault: false,
      isActive: formData.isActive,
      ...(Object.keys(criteria).length > 0 && { criteria })
    };

    if (modalMode === 'edit' && editingSegment) {
      onSegmentUpdate(editingSegment.id, segmentData);
    } else {
      onSegmentCreate(segmentData);
    }

    setModalMode(null);
    resetForm();
  };

  const handleDelete = (segment: DonorSegment) => {
    if (segment.isDefault) {
      alert('Cannot delete default segments');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${segment.name}"?`)) {
      onSegmentDelete(segment.id);
    }
  };

  const customSegments = segments.filter(s => !s.isDefault);
  const defaultSegments = segments.filter(s => s.isDefault);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Manage Donor Segments</h3>
          <p className="text-gray-600">Create custom segments or use default templates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalMode('template')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Templates
          </button>
          <button
            onClick={handleCreateSegment}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Custom Segment
          </button>
        </div>
      </div>

      {/* Custom Segments */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Custom Segments ({customSegments.length})</h4>
        {customSegments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-600 mb-4">No custom segments created yet</p>
            <button
              onClick={handleCreateSegment}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Segment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customSegments.map(segment => (
              <div key={segment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${segment.color}`}>
                      {segment.icon}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{segment.name}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        segment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {segment.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditSegment(segment)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit segment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(segment)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete segment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {segment.description && (
                  <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                )}
                {segment.criteria && (
                  <div className="text-xs text-gray-500">
                    {segment.criteria.minGiftAmount && `Min: $${segment.criteria.minGiftAmount}`}
                    {segment.criteria.giftFrequency && ` • ${segment.criteria.giftFrequency}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Segments */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Default Segments</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {defaultSegments.map(segment => (
            <div key={segment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${segment.color} text-sm`}>
                  {segment.icon}
                </div>
                <span className="text-sm font-medium text-gray-900">{segment.name}</span>
              </div>
              <p className="text-xs text-gray-600">{segment.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Template Modal */}
      {modalMode === 'template' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Segment Templates</h3>
                <button
                  onClick={() => setModalMode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_SEGMENT_TEMPLATES.map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.color}`}>
                          {template.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full mt-3 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'edit' ? 'Edit Segment' : 'Create New Segment'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Young Professionals"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of this donor segment..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                          className={`w-8 h-8 rounded-lg ${option.preview} border-2 ${
                            formData.color === option.value ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon }))}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                            formData.icon === icon ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active segment (include in analytics and reporting)
                  </label>
                </div>
              </div>

              {/* Auto-Assignment Criteria */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Auto-Assignment Criteria (Optional)
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Set criteria to automatically categorize donors into this segment based on their giving patterns.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Gift Amount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.criteria.minGiftAmount}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, minGiftAmount: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Gift Amount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.criteria.maxGiftAmount}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, maxGiftAmount: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="No limit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gift Frequency
                    </label>
                    <select
                      value={formData.criteria.giftFrequency}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, giftFrequency: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any frequency</option>
                      <option value="one-time">One-time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Lifetime Giving ($)
                    </label>
                    <input
                      type="number"
                      value={formData.criteria.totalLifetimeGiving}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, totalLifetimeGiving: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Months Since Last Gift
                    </label>
                    <input
                      type="number"
                      value={formData.criteria.monthsSinceLastGift}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, monthsSinceLastGift: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any timeframe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engagement Level
                    </label>
                    <select
                      value={formData.criteria.engagementLevel}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, engagementLevel: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any level</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Preview</h4>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${formData.color}`}>
                  <span className="text-lg">{formData.icon}</span>
                  <span className="font-medium">{formData.name || 'Segment Name'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {modalMode === 'edit' ? 'Update Segment' : 'Create Segment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};