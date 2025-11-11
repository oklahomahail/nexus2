/**
 * Brand Showcase Component
 *
 * Demonstrates all Nexus brand elements:
 * - Logo variations
 * - Color palette
 * - Typography scale
 * - Animations
 *
 * Use for design reference and brand documentation
 */

import { NexusLogo, NexusIcon, NexusTagline } from "./index";

export function BrandShowcase() {
  const colors = [
    {
      name: "Indigo Nexus",
      var: "--accent",
      hex: "#3B36F4",
      description: "Primary brand color",
    },
    {
      name: "Electric Cyan",
      var: "--accent-2",
      hex: "#72E4FC",
      description: "Secondary accent",
    },
    {
      name: "Deep Violet",
      var: "--accent-3",
      hex: "#6B4DFF",
      description: "Shadow glow",
    },
    {
      name: "Nexus Night",
      var: "--bg",
      hex: "#0D0D12",
      description: "Background",
    },
    {
      name: "Slate Layer",
      var: "--panel",
      hex: "#1A1A22",
      description: "Surface",
    },
    {
      name: "Growth Green",
      var: "--success",
      hex: "#4ADE80",
      description: "Success",
    },
    {
      name: "Insight Amber",
      var: "--warn",
      hex: "#FACC15",
      description: "Warning",
    },
    {
      name: "Privacy Red",
      var: "--error",
      hex: "#F87171",
      description: "Error",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">Nexus Brand System</h1>
          <p className="text-xl text-muted">Where mission meets intelligence</p>
        </div>

        {/* Logo Variations */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b border-[#2D2D3A] pb-3">
            Logo System
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Primary Lockup */}
            <div className="bg-[#1A1A22] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-[#2D2D3A]">
              <NexusLogo size={64} showWordmark />
              <p className="text-sm text-muted text-center">
                Primary Lockup
                <br />
                Use for headers & splash screens
              </p>
            </div>

            {/* Symbol Only */}
            <div className="bg-[#1A1A22] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-[#2D2D3A]">
              <NexusIcon size={64} />
              <p className="text-sm text-muted text-center">
                Symbol Only
                <br />
                Use for icons & badges
              </p>
            </div>

            {/* Animated */}
            <div className="bg-[#1A1A22] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-[#2D2D3A]">
              <NexusLogo size={64} showWordmark animated />
              <p className="text-sm text-muted text-center">
                Animated
                <br />
                Use for loading states
              </p>
            </div>
          </div>

          {/* Size Scale */}
          <div className="bg-[#1A1A22] rounded-2xl p-8 border border-[#2D2D3A]">
            <h3 className="text-xl font-semibold mb-6">Size Scale</h3>
            <div className="flex items-end gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <NexusIcon size={16} />
                <span className="text-xs text-muted">16px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <NexusIcon size={24} />
                <span className="text-xs text-muted">24px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <NexusIcon size={32} />
                <span className="text-xs text-muted">32px (min)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <NexusIcon size={48} />
                <span className="text-xs text-muted">48px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <NexusIcon size={64} />
                <span className="text-xs text-muted">64px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <NexusIcon size={96} />
                <span className="text-xs text-muted">96px</span>
              </div>
            </div>
          </div>

          {/* Tagline Lockup */}
          <div className="bg-[#1A1A22] rounded-2xl p-12 flex flex-col items-center justify-center border border-[#2D2D3A]">
            <NexusTagline logoSize={80} animated />
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b border-[#2D2D3A] pb-3">
            Color System
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div
                key={color.var}
                className="rounded-xl overflow-hidden border border-[#2D2D3A]"
              >
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="bg-[#1A1A22] p-4">
                  <h3 className="font-semibold mb-1">{color.name}</h3>
                  <p className="text-xs text-muted mb-2">{color.description}</p>
                  <code className="text-xs font-mono text-[#72E4FC]">
                    {color.hex}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* Gradient */}
          <div className="rounded-xl overflow-hidden border border-[#2D2D3A]">
            <div className="h-32 nexus-glow" />
            <div className="bg-[#1A1A22] p-4">
              <h3 className="font-semibold mb-1">Nexus Glow Gradient</h3>
              <p className="text-xs text-muted mb-2">
                Use for buttons, headers, or hero backgrounds
              </p>
              <code className="text-xs font-mono text-[#72E4FC]">
                linear-gradient(135deg, #3B36F4 0%, #72E4FC 100%)
              </code>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b border-[#2D2D3A] pb-3">
            Typography
          </h2>

          <div className="bg-[#1A1A22] rounded-2xl p-8 space-y-6 border border-[#2D2D3A]">
            <div>
              <p className="text-xs text-muted mb-2">H1 - 36px</p>
              <h1 className="text-h1">The quick brown fox jumps</h1>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">H2 - 28px</p>
              <h2 className="text-h2">The quick brown fox jumps</h2>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">H3 - 22px</p>
              <h3 className="text-h3">The quick brown fox jumps</h3>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Body - 16px</p>
              <p className="text-body">
                Nexus is a privacy-first fundraising platform that combines
                donor analytics, AI-powered campaign generation, and
                multi-channel automation.
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Caption - 13px</p>
              <p className="text-body-sm text-muted">
                This metric only includes cohorts of 50+ donors to protect
                privacy.
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">
                Monospace - JetBrains Mono
              </p>
              <code className="font-mono text-[#72E4FC]">
                const nexus = "where mission meets intelligence"
              </code>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b border-[#2D2D3A] pb-3">
            Motion System
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1A1A22] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-[#2D2D3A]">
              <div className="animate-nexus-pulse">
                <NexusIcon size={48} />
              </div>
              <p className="text-sm text-muted text-center">
                Pulse
                <br />
                3s ease-in-out
              </p>
            </div>

            <div className="bg-[#1A1A22] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-[#2D2D3A]">
              <div className="animate-nexus-glow">
                <NexusIcon size={48} />
              </div>
              <p className="text-sm text-muted text-center">
                Glow
                <br />
                3s ease-in-out
              </p>
            </div>

            <div className="bg-[#1A1A22] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-[#2D2D3A]">
              <div className="animate-nexus-orbit">
                <NexusIcon size={48} />
              </div>
              <p className="text-sm text-muted text-center">
                Orbit
                <br />
                20s linear
              </p>
            </div>
          </div>
        </section>

        {/* Gradient Text */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b border-[#2D2D3A] pb-3">
            Gradient Text
          </h2>

          <div className="bg-[#1A1A22] rounded-2xl p-12 flex flex-col items-center justify-center border border-[#2D2D3A]">
            <h1 className="text-6xl font-bold nexus-glow-text mb-4">
              Nexus Intelligence
            </h1>
            <p className="text-muted">
              Use .nexus-glow-text for gradient text effects
            </p>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold border-b border-[#2D2D3A] pb-3">
            Usage Guidelines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correct */}
            <div className="bg-[#1A1A22] rounded-2xl p-6 border border-green-500/20">
              <h3 className="text-xl font-semibold mb-4 text-green-400">
                ✓ Correct Usage
              </h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Use glow logo on dark backgrounds only</li>
                <li>• Maintain gradient fidelity (indigo → cyan)</li>
                <li>• Use white or light text alongside</li>
                <li>• Minimum size: 32px height</li>
                <li>• Clear space: one node radius</li>
              </ul>
            </div>

            {/* Incorrect */}
            <div className="bg-[#1A1A22] rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-xl font-semibold mb-4 text-red-400">
                ✗ Incorrect Usage
              </h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Don't invert the glow (keep white core)</li>
                <li>• Don't use on busy backgrounds</li>
                <li>• Don't distort proportions</li>
                <li>• Don't recolor nodes individually</li>
                <li>• Don't use below minimum size</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-muted pb-12">
          <p>Nexus Brand Guide v1.0 - 2025</p>
          <p className="mt-2">
            For questions, see{" "}
            <code className="text-[#72E4FC]">BRAND_GUIDE.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
