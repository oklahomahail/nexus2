// src/components/CommunicationTools.tsx - Email templates, messaging, and outreach components
import React, { useState } from 'react';
import { Mail, Send, Users, Eye, Edit, Copy, Trash2, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// Email Template Builder
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'thank_you' | 'appeal' | 'newsletter' | 'reminder';
  lastModified: Date;
  usage: number;
  previewImageUrl?: string;
}

interface EmailTemplateBuilderProps {
  templates: EmailTemplate[];
  onCreateTemplate: () => void;
  onEditTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (template: EmailTemplate) => void;
  className?: string;
}

export const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({
  templates,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  className = ''
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryIcons = {
    welcome: '👋',
    thank_you: '🙏',
    appeal: '💝',
    newsletter: '📰',
    reminder: '⏰'
  };

  const categoryColors = {
    welcome: 'bg-blue-500/20 text-blue-300',
    thank_you: 'bg-green-500/20 text-green-300',
    appeal: 'bg-purple-500/20 text-purple-300',
    newsletter: 'bg-yellow-500/20 text-yellow-300',
    reminder: 'bg-red-500/20 text-red-300'
  };

  const filteredTemplates = templates.filter(template => {
    const matchesFilter = filter === 'all' || template.category === filter;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = Object.keys(categoryIcons) as (keyof typeof categoryIcons)[];

  return (
    <div className={clsx('card-base', className)}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Email Templates</h3>
            <p className="text-sm text-slate-400">{templates.length} templates available</p>
          </div>
          <button 
            onClick={onCreateTemplate}
            className="button-primary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 input-base"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === 'all'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              All ({templates.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1',
                  filter === category
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <span>{categoryIcons[category]}</span>
                <span className="capitalize">{category.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-colors group">
                {/* Preview */}
                <div className="h-32 bg-slate-900/50 flex items-center justify-center relative overflow-hidden">
                  {template.previewImageUrl ? (
                    <img src={template.previewImageUrl} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Mail className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No preview</p>
                    </div>
                  )}
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEditTemplate(template)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Edit template"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateTemplate(template)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Duplicate template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{template.name}</h4>
                      <p className="text-sm text-slate-400 line-clamp-1">{template.subject}</p>
                    </div>
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0',
                      categoryColors[template.category]
                    )}>
                      {categoryIcons[template.category]} {template.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Used {template.usage} times</span>
                    <span>Modified {template.lastModified.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first email template to get started with donor outreach'}
            </p>
            <button onClick={onCreateTemplate} className="button-primary">
              Create Your First Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Campaign Outreach Scheduler
interface OutreachCampaign {
  id: string;
  name: string;
  template: string;
  recipientCount: number;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
}

interface OutreachSchedulerProps {
  campaigns: OutreachCampaign[];
  onScheduleCampaign: () => void;
  onEditCampaign: (campaign: OutreachCampaign) => void;
  onCancelCampaign: (id: string) => void;
  className?: string;
}

export const OutreachScheduler: React.FC<OutreachSchedulerProps> = ({
  campaigns,
  onScheduleCampaign,
  onEditCampaign,
  onCancelCampaign,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-500/20 text-slate-300';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300';
      case 'sending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'sending':
        return <Send className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={clsx('card-base', className)}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Email Campaigns</h3>
            <p className="text-sm text-slate-400">{campaigns.length} campaigns</p>
          </div>
          <button 
            onClick={onScheduleCampaign}
            className="button-primary flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Campaign</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Campaign</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Recipients</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Scheduled</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Performance</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {campaigns.map(campaign => (
              <tr key={campaign.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">{campaign.name}</div>
                    <div className="text-sm text-slate-400">Template: {campaign.template}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {campaign.recipientCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  <div className="text-sm">
                    <div>{campaign.scheduledDate.toLocaleDateString()}</div>
                    <div className="text-slate-400">{campaign.scheduledDate.toLocaleTimeString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium',
                    getStatusColor(campaign.status)
                  )}>
                    {getStatusIcon(campaign.status)}
                    <span className="capitalize">{campaign.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  {campaign.status === 'completed' && (
                    <div className="text-sm space-y-1">
                      <div className="text-slate-300">
                        Sent: {campaign.sentCount?.toLocaleString()}
                      </div>
                      <div className="text-slate-400">
                        Opens: {campaign.openRate?.toFixed(1)}% • Clicks: {campaign.clickRate?.toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {campaign.status === 'sending' && (
                    <div className="text-sm text-yellow-400">
                      Sending in progress...
                    </div>
                  )}
                  {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                    <div className="text-sm text-slate-400">
                      Not sent yet
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditCampaign(campaign)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                      title="Edit campaign"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {campaign.status !== 'completed' && (
                      <button
                        onClick={() => onCancelCampaign(campaign.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                        title="Cancel campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {campaigns.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No campaigns scheduled</h3>
            <p className="text-slate-400 mb-6">Schedule your first email campaign to start reaching your donors</p>
            <button onClick={onScheduleCampaign} className="button-primary">
              Schedule Your First Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Donor Communication History
interface CommunicationRecord {
  id: string;
  type: 'email' | 'phone' | 'meeting' | 'letter';
  subject?: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'opened' | 'replied';
  sender: string;
}

interface DonorCommunicationHistoryProps {
  donorName: string;
  communications: CommunicationRecord[];
  onAddCommunication: () => void;
  className?: string;
}

export const DonorCommunicationHistory: React.FC<DonorCommunicationHistoryProps> = ({
  donorName,
  communications,
  onAddCommunication,
  className = ''
}) => {
  const [filter, setFilter] = useState<string>('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'phone':
        return <span className="text-green-400">📞</span>;
      case 'meeting':
        return <span className="text-purple-400">🤝</span>;
      case 'letter':
        return <span className="text-yellow-400">✉️</span>;
      default:
        return <Mail className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-slate-400';
      case 'delivered':
        return 'text-blue-400';
      case 'opened':
        return 'text-green-400';
      case 'replied':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  const filteredCommunications = communications.filter(comm => 
    filter === 'all' || comm.type === filter
  );

  const communicationTypes = [
    { value: 'all', label: 'All', count: communications.length },
    { value: 'email', label: 'Email', count: communications.filter(c => c.type === 'email').length },
    { value: 'phone', label: 'Phone', count: communications.filter(c => c.type === 'phone').length },
    { value: 'meeting', label: 'Meeting', count: communications.filter(c => c.type === 'meeting').length },
    { value: 'letter', label: 'Letter', count: communications.filter(c => c.type === 'letter').length }
  ];

  return (
    <div className={clsx('card-base', className)}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Communication History</h3>
            <p className="text-sm text-slate-400">All interactions with {donorName}</p>
          </div>
          <button 
            onClick={onAddCommunication}
            className="button-primary flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>New Communication</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1">
          {communicationTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
                filter === type.value
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <span>{type.label}</span>
              <span className="bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded-full text-xs">
                {type.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {filteredCommunications.length > 0 ? (
          <div className="p-4 space-y-4">
            {filteredCommunications.map((comm, index) => (
              <div
                key={comm.id}
                className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-slate-900/50 rounded-lg">
                    {getTypeIcon(comm.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-white">
                          {comm.subject || `${comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} communication`}
                        </h4>
                        <span className={clsx('text-sm font-medium', getStatusColor(comm.status))}>
                          {comm.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {comm.timestamp.toLocaleDateString()} • {comm.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-300 leading-relaxed mb-2 line-clamp-2">
                      {comm.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        by {comm.sender}
                      </span>
                      <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        View details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {filter === 'all' ? 'No communications yet' : `No ${filter} communications`}
            </h3>
            <p className="text-slate-400 mb-6">
              {filter === 'all' 
                ? 'Start building a relationship with this donor by reaching out'
                : `No ${filter} communications found for this donor`}
            </p>
            <button onClick={onAddCommunication} className="button-primary">
              Send First Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Message Composer
interface QuickMessageComposerProps {
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    type: 'donor' | 'volunteer' | 'staff';
  }>;
  templates: EmailTemplate[];
  onSend: (message: {
    recipients: string[];
    subject: string;
    content: string;
    template?: string;
  }) => void;
  className?: string;
}

export const QuickMessageComposer: React.FC<QuickMessageComposerProps> = ({
  recipients,
  templates,
  onSend,
  className = ''
}) => {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSubject(template.subject);
    setContent(template.content);
    setSelectedTemplate(template.id);
    setShowTemplates(false);
  };

  const handleSend = () => {
    if (selectedRecipients.length === 0 || !subject || !content) return;

    onSend({
      recipients: selectedRecipients,
      subject,
      content,
      template: selectedTemplate || undefined
    });

    // Reset form
    setSelectedRecipients([]);
    setSubject('');
    setContent('');
    setSelectedTemplate('');
  };

  const isValid = selectedRecipients.length > 0 && subject.trim() && content.trim();

  return (
    <div className={clsx('card-base p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Message</h3>
          <p className="text-sm text-slate-400">Send a message to your contacts</p>
        </div>
        
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="button-ghost flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Use Template</span>
        </button>
      </div>

      {showTemplates && (
        <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 animate-slide-up">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Select Template</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-600/30 rounded-lg transition-colors"
              >
                <div className="font-medium text-white text-sm">{template.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{template.subject}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Recipients</label>
          <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
            {recipients.map(recipient => (
              <label key={recipient.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedRecipients.includes(recipient.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRecipients(prev => [...prev, recipient.id]);
                    } else {
                      setSelectedRecipients(prev => prev.filter(id => id !== recipient.id));
                    }
                  }}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-600 rounded"
                />
                <div className="flex-1">
                  <span className="text-white text-sm">{recipient.name}</span>
                  <span className="text-slate-400 text-sm ml-2">({recipient.email})</span>
                </div>
                <span className="text-xs px-2 py-1 bg-slate-600/50 text-slate-300 rounded-full">
                  {recipient.type}
                </span>
              </label>
            ))}
          </div>
          {selectedRecipients.length > 0 && (
            <p className="text-sm text-slate-400 mt-2">
              {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="w-full input-base"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message here..."
            rows={6}
            className="w-full input-base resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="text-sm text-slate-400">
            {isValid ? 'Ready to send' : 'Please fill in all required fields'}
          </div>
          <button
            onClick={handleSend}
            disabled={!isValid}
            className="button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};
