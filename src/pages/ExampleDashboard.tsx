/**
 * Example Dashboard Page
 * Demonstrates the unified Nexus editorial design system
 *
 * This page shows how to use:
 * - PageHeading for consistent titles
 * - SectionBlock for content panels
 * - Editorial spacing rhythm (automatic via .editorial-flow in AppPageLayout)
 * - Design system tokens and components
 */

import Button from "@/components/ui-kit/Button";
import { PageHeading } from "@/components/ui-kit/PageHeading";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";

export default function ExampleDashboard() {
  return (
    <div className="px-8 py-10 editorial-flow">
      {/* Page Header */}
      <PageHeading
        title="Client Dashboard"
        subtitle="Track15-powered campaign and donor management"
        actions={
          <>
            <Button variant="secondary" size="sm">
              Export
            </Button>
            <Button variant="primary" size="sm">
              New Campaign
            </Button>
          </>
        }
      />

      {/* Key Metrics Section */}
      <SectionBlock
        title="Key Metrics"
        description="Overview of campaign performance"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            label="Total Donors"
            value="12,456"
            change="+12%"
            trend="up"
          />
          <MetricCard
            label="Total Raised"
            value="$1.2M"
            change="+8%"
            trend="up"
          />
          <MetricCard
            label="Avg. Gift Size"
            value="$96"
            change="-3%"
            trend="down"
          />
        </div>
      </SectionBlock>

      {/* Recent Activity Section */}
      <SectionBlock
        title="Recent Activity"
        actions={
          <Button variant="ghost" size="sm">
            View All
          </Button>
        }
      >
        <div className="space-y-4">
          <ActivityItem
            title="Campaign Launch: Spring Drive 2025"
            description="Launched to 5,234 donors"
            time="2 hours ago"
            status="success"
          />
          <ActivityItem
            title="Donor Segment Created"
            description="High-Value Donors (250+ donors)"
            time="4 hours ago"
            status="info"
          />
          <ActivityItem
            title="Report Generated"
            description="Q1 2025 Performance Report"
            time="Yesterday"
            status="info"
          />
        </div>
      </SectionBlock>

      {/* Active Campaigns Section */}
      <SectionBlock title="Active Campaigns">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CampaignCard
            name="Spring Drive 2025"
            raised="$45,230"
            goal="$100,000"
            progress={45}
            daysRemaining={12}
          />
          <CampaignCard
            name="Monthly Giving Program"
            raised="$23,100"
            goal="$30,000"
            progress={77}
            daysRemaining={5}
          />
        </div>
      </SectionBlock>
    </div>
  );
}

// Supporting Components

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

function MetricCard({ label, value, change, trend }: MetricCardProps) {
  return (
    <div className="p-4 bg-[var(--nx-bg-secondary)] border border-[var(--nx-border)] rounded-[var(--nx-radius-md)]">
      <div className="text-[13px] text-[var(--nx-text-muted)] mb-1">
        {label}
      </div>
      <div className="text-[32px] font-semibold text-[var(--nx-charcoal)] mb-2">
        {value}
      </div>
      <div
        className={`text-[13px] font-medium ${trend === "up" ? "text-[var(--nx-success)]" : "text-[var(--nx-error)]"}`}
      >
        {change} vs last period
      </div>
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  status: "success" | "info" | "warning" | "error";
}

function ActivityItem({ title, description, time, status }: ActivityItemProps) {
  const statusColors = {
    success: "bg-[var(--nx-success)]",
    info: "bg-[var(--nx-blue-deep)]",
    warning: "bg-[var(--nx-gold)]",
    error: "bg-[var(--nx-error)]",
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-[var(--nx-bg-secondary)] rounded-[var(--nx-radius-sm)] transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${statusColors[status]}`} />
      <div className="flex-1">
        <div className="text-[15px] font-medium text-[var(--nx-charcoal)]">
          {title}
        </div>
        <div className="text-[13px] text-[var(--nx-text-muted)]">
          {description}
        </div>
      </div>
      <div className="text-[13px] text-[var(--nx-text-muted)]">{time}</div>
    </div>
  );
}

interface CampaignCardProps {
  name: string;
  raised: string;
  goal: string;
  progress: number;
  daysRemaining: number;
}

function CampaignCard({
  name,
  raised,
  goal,
  progress,
  daysRemaining,
}: CampaignCardProps) {
  return (
    <div className="p-5 border border-[var(--nx-border)] rounded-[var(--nx-radius-md)] hover:shadow-[var(--nx-shadow-md)] transition-shadow">
      <h3 className="text-[18px] font-semibold text-[var(--nx-charcoal)] mb-2">
        {name}
      </h3>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-[24px] font-semibold text-[var(--nx-charcoal)]">
          {raised}
        </span>
        <span className="text-[13px] text-[var(--nx-text-muted)]">
          of {goal}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-[var(--nx-bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--nx-blue-deep)] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[var(--nx-text-muted)]">
          {progress}% complete
        </span>
        <span className="text-[var(--nx-text-muted)]">
          {daysRemaining} days remaining
        </span>
      </div>
    </div>
  );
}
