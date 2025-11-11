/**
 * Nexus Tagline Lockup
 *
 * Logo + wordmark + tagline for hero sections and presentations
 */

import { NexusLogo } from "./NexusLogo";

interface NexusTaglineProps {
  /** Logo size in pixels (defaults to 64) */
  logoSize?: number;
  /** Tagline text (defaults to primary) */
  tagline?: string;
  /** Enable animated logo */
  animated?: boolean;
  /** Class name for custom styling */
  className?: string;
}

const DEFAULT_TAGLINE = "Where mission meets intelligence.";

const ALTERNATE_TAGLINES = {
  ethical: "AI-powered fundraising for the ethical era.",
  impact: "See your impact. Tell your story.",
  care: "Fundraising intelligence for people who care.",
};

export function NexusTagline({
  logoSize = 64,
  tagline = DEFAULT_TAGLINE,
  animated = false,
  className = "",
}: NexusTaglineProps) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <NexusLogo size={logoSize} showWordmark animated={animated} />
      <p
        className="text-muted text-center font-medium tracking-wide"
        style={{
          fontSize: logoSize * 0.22,
          letterSpacing: "0.015em",
          color: "rgb(160 163 177)", // --muted
        }}
      >
        {tagline}
      </p>
    </div>
  );
}

// Export alternate taglines for convenience
NexusTagline.taglines = {
  default: DEFAULT_TAGLINE,
  ...ALTERNATE_TAGLINES,
};
