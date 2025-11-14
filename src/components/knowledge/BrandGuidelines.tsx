/**
 * Brand Guidelines Component
 *
 * Displays and manages brand identity within the Knowledge Base
 * Wraps the existing BrandProfilePanel functionality
 */

import { Sparkles, ExternalLink } from "lucide-react";

import { useBrandProfile } from "@/hooks/useBrandProfile";

interface BrandGuidelinesProps {
  clientId: string;
  onSaveSuccess: (message: string) => void;
}

export default function BrandGuidelines({
  clientId,
  onSaveSuccess: _onSaveSuccess,
}: BrandGuidelinesProps) {
  const { profile, isLoading } = useBrandProfile(clientId);

  if (isLoading) {
    return (
      <div className="text-gray-600 dark:text-gray-400">
        Loading brand profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Brand Profile Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create a brand profile to define your organization's identity
          </p>
          <a
            href={`/brand`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create Brand Profile
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {profile.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Brand Identity Summary
            </p>
          </div>
          <a
            href={`/brand`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Edit Full Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mission Statement */}
        {profile.mission_statement && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mission Statement
            </h4>
            <p className="text-gray-900 dark:text-white">
              {profile.mission_statement}
            </p>
          </div>
        )}

        {/* Brand Personality */}
        {profile.brand_personality && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brand Personality
            </h4>
            <p className="text-gray-900 dark:text-white">
              {profile.brand_personality}
            </p>
          </div>
        )}

        {/* Visual Identity */}
        <div className="grid grid-cols-2 gap-6">
          {/* Colors */}
          {profile.primary_colors && profile.primary_colors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Colors
              </h4>
              <div className="flex gap-2">
                {profile.primary_colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Typography */}
          {profile.typography && Object.keys(profile.typography).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typography
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {profile.typography.headings && (
                  <div>Headings: {profile.typography.headings}</div>
                )}
                {profile.typography.body && (
                  <div>Body: {profile.typography.body}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Style Keywords */}
        {profile.style_keywords && profile.style_keywords.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Style Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.style_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Logo */}
        {profile.logo_url && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo
            </h4>
            <img
              src={profile.logo_url}
              alt={`${profile.name} logo`}
              className="h-16 object-contain"
            />
          </div>
        )}
      </div>

      {/* Helpful Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Track15 Note:</strong> Your brand guidelines are automatically
          incorporated into campaign generation. For detailed brand management,
          visit the Brand Profile section.
        </p>
      </div>
    </div>
  );
}
