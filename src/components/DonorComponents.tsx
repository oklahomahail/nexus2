// src/components/DonorComponents.tsx - Specialized donor management components
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, Heart, TrendingUp, Edit, Star, Gift, Users } from 'lucide-react';
import clsx from 'clsx';

// Types
interface Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalGiven: number;
  donationCount: number;
  averageGift: number;
  firstDonation: Date;
  lastDonation: Date;
  preferredContact: 'email' | 'phone' | 'mail';
  donorType: 'individual' | 'corporation' | 'foundation';
  segment: 'major' | 'mid-level' | 'recurring' | 'first-time' | 'lapsed';
  tags: string[];
  notes?: string;
  avatar?: string;
}

interface DonorCardProps {
  donor: Donor;
  onClick?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

// Donor Profile Card Component
export const DonorProfileCard: React.FC<DonorCardProps> = ({ 
  donor, 
  onClick, 
  onEdit, 
  compact = false 
}) => {
  const getSegmentColor = (segment: string) => {
    const colors = {
      'major': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'mid-level': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'recurring': 'bg-green-500/20 text-green-300 border-green-500/30',
      'first-time': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'lapsed': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[segment as keyof typeof colors] || colors.major;
  };

  const getDonorTypeIcon = (type: string) => {
    switch (type) {
      case 'corporation': return '🏢';
      case 'foundation': return '🏛️';
      default: return '👤';
    }
  };

  return (
    <div className="card-base card-hover p-6 cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {donor.avatar ? (
              <img src={donor.avatar} alt={donor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">
                {donor.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">{donor.name}</h3>
              <span className="text-sm">{getDonorTypeIcon(donor.donorType)}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400">
              <span className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>{donor.email}</span>
              </span>
              {donor.phone && (
                <span className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{donor.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={clsx(
            'px-2.5 py-1 rounded-full text-xs font-medium border',
            getSegmentColor(donor.segment)
          )}>
            {donor.segment.charAt(0).toUpperCase() + donor.segment.slice(1)}
          </span>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              ${donor.totalGiven.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Total Given</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">
              {donor.donationCount}
            </div>
            <div className="text-xs text-slate-400">Donations</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">
              ${donor.averageGift.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Avg Gift</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">
              {Math.floor((new Date().getTime() - donor.lastDonation.getTime()) / (1000 * 60 * 60 * 24))}d
            </div>
            <div className="text-xs text-slate-400">Last Gift</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {donor.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {donor.tags.length > 3 && (
            <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
              +{donor.tags.length - 3}
            </span>
          )}
        </div>
        
        <div className="text-xs text-slate-400">
          Donor since {donor.firstDonation.getFullYear()}
        </div>
      </div>
    </div>
  );
};

// Donation History Component
interface Donation {
  id: string;
  amount: number;
  date: Date;
  campaign: string;
  method: 'credit_card' | 'bank_transfer' | 'check' | 'paypal';
  recurring: boolean;
  status: 'completed' | 'pending' | 'failed';
}

interface DonationHistoryProps {
  donations: Donation[];
  className?: string;
  showFilters?: boolean;
}

export const DonationHistory: React.FC<DonationHistoryProps> = ({ 
  donations, 
  className = '',
  showFilters = true 
}) => {
  const [filter, setFilter] = useState<'all' | 'recurring' | 'one-time'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return '💳';
      case 'bank_transfer': return '🏦';
      case 'check': return '📝';
      case 'paypal': return '💰';
      default: return '💳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'recurring' && !donation.recurring) return false;
    if (filter === 'one-time' && donation.recurring) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return b.date.getTime() - a.date.getTime();
    } else {
      return b.amount - a.amount;
    }
  });

  return (
    <div className={clsx('card-base', className)}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Donation History</h3>
            <p className="text-sm text-slate-400">{donations.length} total donations</p>
          </div>
          
          {showFilters && (
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input-base text-sm py-2 px-3"
              >
                <option value="all">All Donations</option>
                <option value="recurring">Recurring Only</option>
                <option value="one-time">One-time Only</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-base text-sm py-2 px-3"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {filteredDonations.map((donation) => (
          <div key={donation.id} className="p-4 border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{getMethodIcon(donation.method)}</span>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">
                      ${donation.amount.toLocaleString()}
                    </span>
                    {donation.recurring && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {donation.campaign} • {donation.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className={clsx('text-sm font-medium', getStatusColor(donation.status))}>
                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDonations.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No donations found</h3>
          <p className="text-slate-400">
            {filter !== 'all' 
              ? `No ${filter === 'recurring' ? 'recurring' : 'one-time'} donations to display.`
              : 'This donor hasn\'t made any donations yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

// Donor Segmentation Widget
interface DonorSegmentWidgetProps {
  segments: {
    name: string;
    count: number;
    percentage: number;
    color: string;
    icon: string;
  }[];
  totalDonors: number;
  className?: string;
}

export const DonorSegmentWidget: React.FC<DonorSegmentWidgetProps> = ({ 
  segments, 
  totalDonors, 
  className = '' 
}) => {
  return (
    <div className={clsx('card-base p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Donor Segments</h3>
          <p className="text-sm text-slate-400">{totalDonors.toLocaleString()} total donors</p>
        </div>
        <div className="p-2 bg-purple-500/20 rounded-xl">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{segment.icon}</span>
                <div>
                  <span className="text-white font-medium">{segment.name}</span>
                  <div className="text-sm text-slate-400">
                    {segment.count.toLocaleString()} donors
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{segment.percentage.toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 group-hover:opacity-80 ${segment.color}`}
                style={{ width: `${segment.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View detailed segmentation →
        </button>
      </div>
    </div>
  );
};

// Donor Search and Filter Bar
interface DonorSearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  totalResults: number;
  className?: string;
}

export const DonorSearchBar: React.FC<DonorSearchBarProps> = ({
  onSearch,
  onFilterChange,
  totalResults,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    segment: 'all',
    donorType: 'all',
    lastGift: 'all',
    giftRange: 'all'
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={clsx('card-base p-4', className)}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search donors by name, email, or phone..."
            className="w-full pl-10 pr-4 py-3 input-base"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2',
            showFilters 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50'
          )}
        >
          <span>Filters</span>
          <div className={clsx(
            'w-4 h-4 transition-transform',
            showFilters && 'rotate-180'
          )}>
            ⌄
          </div>
        </button>
        
        <div className="text-sm text-slate-400">
          {totalResults.toLocaleString()} donors
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Segment</label>
            <select
              value={filters.segment}
              onChange={(e) => handleFilterChange('segment', e.target.value)}
              className="input-base text-sm"
            >
              <option value="all">All Segments</option>
              <option value="major">Major Donors</option>
              <option value="mid-level">Mid-level</option>
              <option value="recurring">Recurring</option>
              <option value="first-time">First-time</option>
              <option value="lapsed">Lapsed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Donor Type</label>
            <select
              value={filters.donorType}
              onChange={(e) => handleFilterChange('donorType', e.target.value)}
              className="input-base text-sm"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="corporation">Corporation</option>
              <option value="foundation">Foundation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Last Gift</label>
            <select
              value={filters.lastGift}
              onChange={(e) => handleFilterChange('lastGift', e.target.value)}
              className="input-base text-sm"
            >
              <option value="all">Any Time</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
              <option value="old">Over 1 year ago</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Gift Range</label>
            <select
              value={filters.giftRange}
              onChange={(e) => handleFilterChange('giftRange', e.target.value)}
              className="input-base text-sm"
            >
              <option value="all">Any Amount</option>
              <option value="under-100">Under $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="over-5000">Over $5,000</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
