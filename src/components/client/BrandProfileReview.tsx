// Brand Profile Review Component
// Editable review UI for extracted brand data

import React, { useState } from "react";

import { Input } from "@/components/ui-kit";
import type { ExtractedBrandData } from "@/types/clientIntake";

interface BrandProfileReviewProps {
  extractedData: ExtractedBrandData;
  onEdit: (data: ExtractedBrandData) => void;
}

export function BrandProfileReview({
  extractedData,
  onEdit,
}: BrandProfileReviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["organization", "voice_tone"]),
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = (path: string[], value: any) => {
    const newData = { ...extractedData };
    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    onEdit(newData);
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {/* Header with confidence score */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">
            Review & Edit Brand Profile
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Review the extracted information and make any necessary edits
          </p>
        </div>
        <div className="text-right">
          <div
            className={`
              text-2xl font-bold
              ${
                extractedData.confidence_score >= 80
                  ? "text-green-400"
                  : extractedData.confidence_score >= 60
                    ? "text-yellow-400"
                    : "text-orange-400"
              }
            `}
          >
            {extractedData.confidence_score}%
          </div>
          <p className="text-xs text-slate-500">confidence</p>
        </div>
      </div>

      {/* Organization Identity */}
      <CollapsibleSection
        title="Organization Identity"
        subtitle="Basic information about the organization"
        isExpanded={expandedSections.has("organization")}
        onToggle={() => toggleSection("organization")}
        hasData={!!extractedData.organization.name}
      >
        <div className="space-y-3">
          <Input
            label="Organization Name"
            value={extractedData.organization.name || ""}
            onChange={(e) =>
              updateField(["organization", "name"], e.target.value)
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Mission Statement
            </label>
            <textarea
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={extractedData.organization.mission || ""}
              onChange={(e) =>
                updateField(["organization", "mission"], e.target.value)
              }
            />
          </div>
          <Input
            label="Website"
            value={extractedData.organization.website || ""}
            onChange={(e) =>
              updateField(["organization", "website"], e.target.value)
            }
            placeholder="https://example.org"
          />
        </div>
      </CollapsibleSection>

      {/* Voice & Tone */}
      <CollapsibleSection
        title="Voice & Tone"
        subtitle="Brand voice and personality"
        isExpanded={expandedSections.has("voice_tone")}
        onToggle={() => toggleSection("voice_tone")}
        hasData={!!extractedData.voice_tone.tone_of_voice}
      >
        <div className="space-y-3">
          <div>
            <Input
              label="Tone of Voice"
              value={extractedData.voice_tone.tone_of_voice || ""}
              onChange={(e) =>
                updateField(["voice_tone", "tone_of_voice"], e.target.value)
              }
              placeholder="warm, urgent, plain-language"
            />
            <p className="text-xs text-slate-500 mt-1">
              3-5 descriptive keywords, comma-separated
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Brand Personality
            </label>
            <textarea
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={extractedData.voice_tone.brand_personality || ""}
              onChange={(e) =>
                updateField(["voice_tone", "brand_personality"], e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Style Keywords
            </label>
            <input
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={(extractedData.voice_tone.style_keywords || []).join(", ")}
              onChange={(e) =>
                updateField(
                  ["voice_tone", "style_keywords"],
                  e.target.value.split(",").map((k) => k.trim()),
                )
              }
              placeholder="impact, community, hope"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated keywords
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Messaging Pillars */}
      <CollapsibleSection
        title="Messaging Pillars"
        subtitle={`${extractedData.messaging_pillars?.length || 0} pillars extracted`}
        isExpanded={expandedSections.has("messaging_pillars")}
        onToggle={() => toggleSection("messaging_pillars")}
        hasData={
          extractedData.messaging_pillars &&
          extractedData.messaging_pillars.length > 0
        }
      >
        {extractedData.messaging_pillars &&
        extractedData.messaging_pillars.length > 0 ? (
          <div className="space-y-4">
            {extractedData.messaging_pillars.map((pillar, index) => (
              <div
                key={index}
                className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2"
              >
                <Input
                  label={`Pillar ${index + 1} Name`}
                  value={pillar.pillar_name}
                  onChange={(e) => {
                    const newPillars = [...extractedData.messaging_pillars];
                    newPillars[index].pillar_name = e.target.value;
                    updateField(["messaging_pillars"], newPillars);
                  }}
                  placeholder="Pillar name"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={pillar.description}
                    onChange={(e) => {
                      const newPillars = [...extractedData.messaging_pillars];
                      newPillars[index].description = e.target.value;
                      updateField(["messaging_pillars"], newPillars);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No messaging pillars extracted
          </p>
        )}
      </CollapsibleSection>

      {/* Visual Identity */}
      <CollapsibleSection
        title="Visual Identity"
        subtitle="Colors, typography, and visual style"
        isExpanded={expandedSections.has("visual_identity")}
        onToggle={() => toggleSection("visual_identity")}
        hasData={
          extractedData.visual_identity &&
          extractedData.visual_identity.primary_colors &&
          extractedData.visual_identity.primary_colors.length > 0
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Primary Colors
            </label>
            <input
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={(extractedData.visual_identity.primary_colors || []).join(
                ", ",
              )}
              onChange={(e) =>
                updateField(
                  ["visual_identity", "primary_colors"],
                  e.target.value.split(",").map((c) => c.trim()),
                )
              }
              placeholder="#0E4B7F, #F05A28"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated hex codes or color names
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Typography
            </label>
            <textarea
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={extractedData.visual_identity.typography || ""}
              onChange={(e) =>
                updateField(["visual_identity", "typography"], e.target.value)
              }
              placeholder="Inter for headings, Source Serif for body"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Audience Segments */}
      <CollapsibleSection
        title="Audience Segments"
        subtitle={`${extractedData.audience_segments?.length || 0} segments extracted`}
        isExpanded={expandedSections.has("audience_segments")}
        onToggle={() => toggleSection("audience_segments")}
        hasData={
          extractedData.audience_segments &&
          extractedData.audience_segments.length > 0
        }
      >
        {extractedData.audience_segments &&
        extractedData.audience_segments.length > 0 ? (
          <div className="space-y-3">
            {extractedData.audience_segments.map((segment, index) => (
              <div
                key={index}
                className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
              >
                <p className="text-sm font-medium text-slate-200">
                  {segment.segment_name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {segment.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No audience segments extracted
          </p>
        )}
      </CollapsibleSection>

      {/* Contact Information */}
      <CollapsibleSection
        title="Contact Information"
        subtitle="Primary contact details"
        isExpanded={expandedSections.has("contact_information")}
        onToggle={() => toggleSection("contact_information")}
        hasData={
          !!extractedData.contact_information.primary_contact_name ||
          !!extractedData.contact_information.primary_contact_email
        }
      >
        <div className="space-y-3">
          <Input
            label="Primary Contact Name"
            value={extractedData.contact_information.primary_contact_name || ""}
            onChange={(e) =>
              updateField(
                ["contact_information", "primary_contact_name"],
                e.target.value,
              )
            }
          />
          <Input
            label="Primary Contact Email"
            type="email"
            value={
              extractedData.contact_information.primary_contact_email || ""
            }
            onChange={(e) =>
              updateField(
                ["contact_information", "primary_contact_email"],
                e.target.value,
              )
            }
          />
          <Input
            label="Phone"
            value={extractedData.contact_information.phone || ""}
            onChange={(e) =>
              updateField(["contact_information", "phone"], e.target.value)
            }
          />
        </div>
      </CollapsibleSection>

      {/* Missing Sections Warning */}
      {extractedData.missing_sections &&
        extractedData.missing_sections.length > 0 && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm font-medium text-yellow-400 mb-2">
              ⚠️ Some sections were not found in the document
            </p>
            <p className="text-xs text-yellow-400/80">
              {extractedData.missing_sections.join(", ")}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              You can add this information manually after creating the profile
            </p>
          </div>
        )}
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  subtitle,
  isExpanded,
  onToggle,
  hasData,
  children,
}: {
  title: string;
  subtitle: string;
  isExpanded: boolean;
  onToggle: () => void;
  hasData: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div
            className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${hasData ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-500"}
            `}
          >
            {hasData ? "✓" : "○"}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 py-3 border-t border-slate-700">{children}</div>
      )}
    </div>
  );
}
