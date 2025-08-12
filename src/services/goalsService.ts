// src/services/goalsService.ts
export type GoalScope = "org" | "client" | "campaign";
export type Comparator = "gt" | "gte" | "lt" | "lte" | "eq";

export interface Goal {
  id: string;
  scope: GoalScope;
  scopeId: string | null; // null for org
  metric: string; // e.g. "totalRaised", "donorCount"
  comparator: Comparator; // e.g. "gte"
  target: number;
  active: boolean;
  createdAt: string;
  name?: string; // Optional friendly name
  description?: string; // Optional description
  category?: string; // e.g. "fundraising", "engagement", "growth"
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  metric: string;
  comparator: Comparator;
  suggestedTarget: number;
  category: string;
  scope: GoalScope[]; // Which scopes this template applies to
}

export interface Evaluation {
  goalId: string;
  met: boolean;
  actual: number;
}

// Goal templates for common fundraising metrics
const GOAL_TEMPLATES: GoalTemplate[] = [
  // Fundraising Templates
  {
    id: "annual_target",
    name: "Annual Fundraising Target",
    description: "Set a yearly revenue goal for your organization or client",
    metric: "totalRaised",
    comparator: "gte",
    suggestedTarget: 500000,
    category: "fundraising",
    scope: ["org", "client"],
  },
  {
    id: "quarterly_target",
    name: "Quarterly Revenue Goal",
    description: "Track progress toward quarterly fundraising targets",
    metric: "totalRaised",
    comparator: "gte",
    suggestedTarget: 125000,
    category: "fundraising",
    scope: ["org", "client"],
  },
  {
    id: "major_gift_threshold",
    name: "Major Gift Milestone",
    description: "Achieve a significant single donation amount",
    metric: "totalRaised",
    comparator: "gte",
    suggestedTarget: 50000,
    category: "fundraising",
    scope: ["org", "client", "campaign"],
  },

  // Donor Engagement Templates
  {
    id: "donor_growth",
    name: "Donor Base Growth",
    description: "Expand your donor community to reach new supporters",
    metric: "donorCount",
    comparator: "gte",
    suggestedTarget: 2000,
    category: "engagement",
    scope: ["org", "client"],
  },
  {
    id: "donor_retention",
    name: "Donor Retention Target",
    description: "Maintain high donor retention rates",
    metric: "donorRetention",
    comparator: "gte",
    suggestedTarget: 75,
    category: "engagement",
    scope: ["org", "client"],
  },
  {
    id: "new_donor_acquisition",
    name: "New Donor Acquisition",
    description: "Attract first-time donors to your cause",
    metric: "newDonors",
    comparator: "gte",
    suggestedTarget: 500,
    category: "engagement",
    scope: ["org", "client"],
  },

  // Growth & Performance Templates
  {
    id: "growth_rate",
    name: "Year-over-Year Growth",
    description: "Achieve sustainable growth compared to previous period",
    metric: "growthRate",
    comparator: "gte",
    suggestedTarget: 15,
    category: "growth",
    scope: ["org"],
  },
  {
    id: "campaign_success",
    name: "Campaign Portfolio Success",
    description: "Maintain active campaigns to diversify fundraising",
    metric: "campaignCount",
    comparator: "gte",
    suggestedTarget: 8,
    category: "growth",
    scope: ["org", "client"],
  },

  // Efficiency Templates
  {
    id: "avg_gift_size",
    name: "Average Gift Size Target",
    description: "Increase the average donation amount per donor",
    metric: "averageGiftSize",
    comparator: "gte",
    suggestedTarget: 250,
    category: "efficiency",
    scope: ["org", "client", "campaign"],
  },
  {
    id: "conversion_rate",
    name: "Conversion Rate Optimization",
    description: "Improve donation page conversion rates",
    metric: "conversionRate",
    comparator: "gte",
    suggestedTarget: 25,
    category: "efficiency",
    scope: ["org", "client", "campaign"],
  },
];

const STORAGE_KEY = "nexus_goals_v1";

function read(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Goal[]) : [];
  } catch {
    return [];
  }
}

function write(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

// Seed with some demo goals on first load
function seedDemoGoals(): Goal[] {
  const existing = read();
  if (existing.length > 0) return existing;

  const demoGoals: Goal[] = [
    {
      id: "goal_1",
      scope: "org",
      scopeId: null,
      metric: "totalRaised",
      comparator: "gte",
      target: 500000,
      active: true,
      createdAt: new Date().toISOString(),
      name: "Annual Fundraising Target",
      description: "Reach our annual revenue goal",
      category: "fundraising",
    },
    {
      id: "goal_2",
      scope: "org",
      scopeId: null,
      metric: "donorCount",
      comparator: "gte",
      target: 2000,
      active: true,
      createdAt: new Date().toISOString(),
      name: "Donor Growth Goal",
      description: "Expand our donor community",
      category: "engagement",
    },
    {
      id: "goal_3",
      scope: "org",
      scopeId: null,
      metric: "growthRate",
      comparator: "gte",
      target: 10,
      active: true,
      createdAt: new Date().toISOString(),
      name: "10% Growth Target",
      description: "Achieve year-over-year growth",
      category: "growth",
    },
  ];

  write(demoGoals);
  return demoGoals;
}

export const goalsService = {
  list(): Goal[] {
    return seedDemoGoals();
  },

  getTemplates(scope?: GoalScope): GoalTemplate[] {
    if (!scope) return GOAL_TEMPLATES;
    return GOAL_TEMPLATES.filter((template) => template.scope.includes(scope));
  },

  getTemplatesByCategory(category?: string, scope?: GoalScope): GoalTemplate[] {
    let templates = GOAL_TEMPLATES;

    if (scope) {
      templates = templates.filter((template) =>
        template.scope.includes(scope),
      );
    }

    if (category) {
      templates = templates.filter(
        (template) => template.category === category,
      );
    }

    return templates;
  },

  createFromTemplate(
    templateId: string,
    scope: GoalScope,
    scopeId: string | null,
    customTarget?: number,
  ): Goal {
    const template = GOAL_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const goal: Goal = {
      id: `goal_${Date.now()}`,
      scope,
      scopeId,
      metric: template.metric,
      comparator: template.comparator,
      target: customTarget ?? template.suggestedTarget,
      active: true,
      createdAt: new Date().toISOString(),
      name: template.name,
      description: template.description,
      category: template.category,
    };

    const all = read();
    all.push(goal);
    write(all);
    return goal;
  },

  upsert(input: Omit<Goal, "id" | "createdAt"> & { id?: string }): Goal {
    const all = read();
    const now = new Date().toISOString();
    const id = input.id ?? `goal_${Date.now()}`;

    const goal: Goal = {
      ...input,
      id,
      createdAt: input.id
        ? (all.find((g) => g.id === input.id)?.createdAt ?? now)
        : now,
    };

    const idx = all.findIndex((g) => g.id === id);
    if (idx >= 0) all[idx] = goal;
    else all.push(goal);
    write(all);
    return goal;
  },

  update(
    id: string,
    updates: Partial<Omit<Goal, "id" | "createdAt">>,
  ): Goal | null {
    const all = read();
    const idx = all.findIndex((g) => g.id === id);
    if (idx === -1) return null;

    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    write(all);
    return updated;
  },

  remove(id: string) {
    write(read().filter((g) => g.id !== id));
  },

  evaluate(
    metrics: Record<string, number>,
    filter?: { scope?: GoalScope; scopeId?: string | null },
  ): Evaluation[] {
    const all = read().filter((g) => g.active);
    const subset = all.filter(
      (g) =>
        (filter?.scope ? g.scope === filter.scope : true) &&
        (filter?.scopeId !== undefined ? g.scopeId === filter.scopeId : true),
    );

    const cmp: Record<Comparator, (a: number, b: number) => boolean> = {
      gt: (a, b) => a > b,
      gte: (a, b) => a >= b,
      lt: (a, b) => a < b,
      lte: (a, b) => a <= b,
      eq: (a, b) => a === b,
    };

    return subset.map((g) => {
      const actual = metrics[g.metric] ?? NaN;
      const met = Number.isFinite(actual)
        ? cmp[g.comparator](actual, g.target)
        : false;
      return { goalId: g.id, met, actual };
    });
  },
};

export default goalsService;
