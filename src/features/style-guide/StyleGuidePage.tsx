import { useState } from "react";

import Button from "@/components/ui-kit/Button";
import Card from "@/components/ui-kit/Card";
import Input from "@/components/ui-kit/Input";
import Panel from "@/components/ui-kit/Panel";
import { SectionHeader } from "@/components/ui-kit/SectionHeader";
import { Tabs } from "@/components/ui-kit/Tabs";
import TextArea from "@/components/ui-kit/TextArea";

export default function StyleGuidePage() {
  const [activeTab, setActiveTab] = useState("Identity");

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6 space-y-16">
      {/* ------------------------------------------------------------------ */}
      {/* TYPOGRAPHY */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader title="Typography" subtitle="Headings, body, and scale" />

      <div className="space-y-6">
        <h1 className="text-h1 font-semibold text-charcoal">
          Heading 1 – 32px
        </h1>
        <h2 className="text-h2 font-semibold text-charcoal">
          Heading 2 – 24px
        </h2>
        <h3 className="text-h3 font-medium text-charcoal">Heading 3 – 18px</h3>
        <p className="text-body text-charcoal">
          Body text – 15px. Nexus uses a clean and modern editorial type scale
          built on Inter and Libre Franklin. Paragraph text keeps a restrained
          hierarchy, maximizing readability across campaign creation, analytics,
          and donor strategy views.
        </p>
        <p className="text-small text-muted">Small text – 13px muted</p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* COLOR SYSTEM */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader
        title="Color Palette"
        subtitle="Nexus editorial identity"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { name: "Charcoal", token: "var(--nx-charcoal)" },
          { name: "Rich Black", token: "var(--nx-rich-black)" },
          { name: "Off-White", token: "var(--nx-offwhite)" },
          { name: "Gold", token: "var(--nx-gold)" },
          { name: "Soft Gold", token: "var(--nx-gold-soft)" },
          { name: "Deep Blue", token: "var(--nx-blue-deep)" },
          { name: "Soft Blue", token: "var(--nx-blue-soft)" },
          { name: "Muted Gray", token: "var(--nx-text-muted)" },
        ].map((c) => (
          <div key={c.name} className="space-y-2">
            <div
              className="h-20 w-full rounded-md border border-border"
              style={{ backgroundColor: c.token }}
            />
            <p className="text-small text-charcoal font-medium">{c.name}</p>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BUTTONS */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader title="Buttons" subtitle="Primary, secondary, and ghost" />

      <div className="flex flex-wrap gap-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="md">
          Medium
        </Button>
        <Button variant="primary" size="lg">
          Large
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INPUTS */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader title="Form Inputs" subtitle="Inputs and text areas" />

      <div className="space-y-6 max-w-xl">
        <Input placeholder="Text input" label="Email Address" />
        <Input
          placeholder="With helper text"
          label="Username"
          helperText="Choose a unique username"
        />
        <Input
          placeholder="Error state"
          label="Password"
          error
          helperText="Password is required"
        />
        <TextArea placeholder="Text area input" label="Description" rows={4} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CARDS */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader title="Cards" subtitle="Surface containers for content" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-h3 font-semibold mb-2">Card Title</h3>
          <p className="text-body text-muted">
            Cards are used for analytics blocks, donor stats, segmentation
            views, and more.
          </p>
        </Card>

        <Card hover>
          <h3 className="text-h3 font-semibold mb-2">Hover Card</h3>
          <p className="text-body text-muted">
            Simple, clean, editorial containers with subtle elevation and hover
            effect.
          </p>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PANELS */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader
        title="Panels"
        subtitle="Editorial containers for feature blocks"
      />

      <Panel title="Panel Header" subtitle="With optional subtitle">
        <p className="text-body text-muted mb-4">
          Panels serve as content sections within feature pages: campaign
          editor, donor insights, or brand management.
        </p>
        <Button variant="secondary">Example Action</Button>
      </Panel>

      {/* ------------------------------------------------------------------ */}
      {/* TABS */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader title="Tabs" subtitle="Segmented navigation" />

      <Tabs
        tabs={[
          { id: "Identity", label: "Identity" },
          { id: "Visuals", label: "Visuals" },
          { id: "Tone", label: "Tone" },
          { id: "Corpus", label: "Corpus" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="border border-border rounded-md p-6 bg-white shadow-sm">
        <p className="text-body text-muted">
          Active tab:{" "}
          <span className="font-medium text-charcoal">{activeTab}</span>
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SPACING SYSTEM */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader
        title="Spacing System"
        subtitle="Editorial rhythm and vertical flow"
      />

      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 w-full rounded-sm mb-2" />
          <p className="text-xs text-muted">
            4px - Extra Small (--nx-space-xs)
          </p>
        </div>
        <div>
          <div className="h-6 bg-gray-300 w-full rounded-sm mb-2" />
          <p className="text-xs text-muted">8px - Small (--nx-space-sm)</p>
        </div>
        <div>
          <div className="h-10 bg-gray-400 w-full rounded-sm mb-2" />
          <p className="text-xs text-muted">16px - Large (--nx-space-lg)</p>
        </div>
        <div>
          <div className="h-16 bg-gray-500 w-full rounded-sm mb-2" />
          <p className="text-xs text-muted">
            24px - Extra Large (--nx-space-xl)
          </p>
        </div>
      </div>

      <p className="text-small text-muted mt-6">
        Nexus spacing tokens: 4px, 8px, 12px, 16px, 24px, 32px, 48px increments.
        Editorial rhythm uses 24px and 32px section spacing to create a high-end
        feel across the platform.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* SHADOWS & ELEVATION */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeader
        title="Shadows & Elevation"
        subtitle="Depth system for layering"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          className="p-6 bg-white rounded-md"
          style={{ boxShadow: "var(--nx-shadow-sm)" }}
        >
          <p className="text-small font-medium mb-1">Small</p>
          <p className="text-xs text-muted">Subtle depth</p>
        </div>
        <div
          className="p-6 bg-white rounded-md"
          style={{ boxShadow: "var(--nx-shadow-md)" }}
        >
          <p className="text-small font-medium mb-1">Medium</p>
          <p className="text-xs text-muted">Cards</p>
        </div>
        <div
          className="p-6 bg-white rounded-md"
          style={{ boxShadow: "var(--nx-shadow-lg)" }}
        >
          <p className="text-small font-medium mb-1">Large</p>
          <p className="text-xs text-muted">Elevated panels</p>
        </div>
        <div
          className="p-6 bg-white rounded-md"
          style={{ boxShadow: "var(--nx-shadow-xl)" }}
        >
          <p className="text-small font-medium mb-1">Extra Large</p>
          <p className="text-xs text-muted">Modals</p>
        </div>
      </div>
    </div>
  );
}
