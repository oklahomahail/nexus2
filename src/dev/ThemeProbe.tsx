import React from "react";

/**
 * A floating panel that helps you verify Tailwind + your design tokens.
 * Shows brand colors, surface/border/text tokens, typography sizes,
 * and a dark-mode toggle.
 */
const ThemeProbe: React.FC = () => {
  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-[360px] rounded-xl border border-border bg-surface shadow-medium text-text-primary animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-muted">
        <h3 className="text-sm font-semibold">Theme Probe</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-bg-tertiary border border-border-muted hover:shadow-soft"
            title="Toggle dark mode"
          >
            Dark ↔ Light
          </button>
          <button
            onClick={() =>
              document
                .getElementById("theme-probe-body")
                ?.classList.toggle("hidden")
            }
            className="px-2.5 py-1.5 text-xs rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border border-brand-primary/30"
            title="Collapse"
          >
            Toggle
          </button>
        </div>
      </div>

      <div id="theme-probe-body" className="p-4 space-y-4">
        {/* Brand swatches */}
        <section>
          <div className="text-xs font-medium text-text-secondary mb-2">
            Brand
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Swatch name="brand.primary" className="bg-brand-primary" />
            <Swatch name="brand.secondary" className="bg-brand-secondary" />
            <Swatch name="brand.accent" className="bg-brand-accent" />
          </div>
        </section>

        {/* Surface / Border / Text */}
        <section className="grid grid-cols-3 gap-2">
          <Tile title="Surface" className="bg-surface border border-border">
            <div className="text-text-primary text-xs">Primary</div>
            <div className="text-text-secondary text-[10px]">
              Secondary text
            </div>
            <div className="text-text-muted text-[10px]">Muted</div>
          </Tile>
          <Tile
            title="Muted"
            className="bg-surface-muted border border-border-muted"
          >
            <div className="text-text-primary text-xs">Muted Surface</div>
          </Tile>
          <Tile title="BGs" className="bg-bg-primary border border-border">
            <div className="text-[10px] text-text-secondary">bg-primary</div>
            <div className="bg-bg-secondary text-[10px] mt-1 px-1 py-0.5 rounded">
              bg-secondary
            </div>
            <div className="bg-bg-tertiary text-[10px] mt-1 px-1 py-0.5 rounded">
              bg-tertiary
            </div>
          </Tile>
        </section>

        {/* Status colors */}
        <section>
          <div className="text-xs font-medium text-text-secondary mb-2">
            Status
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Badge className="bg-success/15 text-success border border-success/30">
              success
            </Badge>
            <Badge className="bg-warning/15 text-warning border border-warning/30">
              warning
            </Badge>
            <Badge className="bg-error/15 text-error border border-error/30">
              error
            </Badge>
            <Badge className="bg-info/15 text-info border border-info/30">
              info
            </Badge>
          </div>
        </section>

        {/* Typography sizes (from your config) */}
        <section className="space-y-1">
          <div className="text-xs font-medium text-text-secondary mb-1">
            Type scale
          </div>
          <div className="text-display">Display size</div>
          <div className="text-h1">Heading 1</div>
          <div className="text-h2">Heading 2</div>
          <div className="text-h3">Heading 3</div>
          <div className="text-h4">Heading 4</div>
          <div className="text-body-lg">Body Large</div>
          <div className="text-body">Body</div>
          <div className="text-body-sm">Body Small</div>
          <div className="text-caption">Caption</div>
        </section>

        {/* Quick action buttons */}
        <section className="flex items-center gap-2">
          <button
            onClick={() => window.location.assign(window.location.pathname)}
            className="px-3 py-1.5 text-xs rounded-lg bg-brand-primary text-text-inverse hover:shadow-soft"
          >
            Reload Page
          </button>
          <a
            href={window.location.pathname + "?dev=0"}
            className="px-3 py-1.5 text-xs rounded-lg bg-bg-tertiary border border-border-muted"
            title="Hide this probe by removing the flag"
          >
            Hide Probe
          </a>
        </section>
      </div>
    </div>
  );
};

const Swatch: React.FC<{ name: string; className: string }> = ({
  name,
  className,
}) => (
  <div className="space-y-1">
    <div className={`h-8 rounded ${className} border border-border`}></div>
    <div className="text-[10px] text-text-secondary">{name}</div>
  </div>
);

const Tile: React.FC<{
  title: string;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, className, children }) => (
  <div className={`rounded-lg p-3 ${className || ""}`}>
    <div className="text-[11px] font-medium text-text-secondary mb-1">
      {title}
    </div>
    {children}
  </div>
);

const Badge: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={`px-2 py-1 rounded-full text-[10px] font-medium text-center ${className || ""}`}
  >
    {children}
  </div>
);

export default ThemeProbe;
