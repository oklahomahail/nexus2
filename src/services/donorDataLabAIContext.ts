/**
 * Donor Data Lab AI Context Enrichment
 *
 * Injects Data Lab strategy insights into AI prompts to make
 * generated content feel grounded in the client's actual donor data
 * rather than generic fundraising advice.
 */

import { LabRecommendations } from "./donorDataLab";
import { getLatestLabRun } from "./donorDataLabPersistence";

/**
 * Build a context block from Lab recommendations that can be injected
 * into AI prompts for email drafting, content generation, etc.
 */
export function buildLabStrategyContext(
  recommendations: LabRecommendations,
  focus?: "upgrade" | "monthly" | "reactivation" | "lookalike",
): string {
  const sections: string[] = [];

  // Always include overview
  sections.push(`## Donor File Strategy Overview\n${recommendations.overview}`);

  // Include focused section if specified
  switch (focus) {
    case "upgrade":
      sections.push(
        `## Upgrade Strategy\n${recommendations.upgradeStrategy.join("\n")}`,
      );
      break;
    case "monthly":
      sections.push(
        `## Monthly Giving Strategy\n${recommendations.monthlyStrategy.join("\n")}`,
      );
      break;
    case "reactivation":
      sections.push(
        `## Reactivation Strategy\n${recommendations.reactivationStrategy.join("\n")}`,
      );
      break;
    case "lookalike":
      sections.push(
        `## Lookalike Audience Strategy\n${recommendations.lookalikeStrategy.join("\n")}`,
      );
      break;
    default:
      // Include all strategies for general context
      sections.push(
        `## Upgrade Strategy\n${recommendations.upgradeStrategy.join("\n")}`,
        `## Monthly Giving Strategy\n${recommendations.monthlyStrategy.join("\n")}`,
        `## Channel & Cadence Notes\n${recommendations.channelAndCadenceNotes.join("\n")}`,
      );
  }

  return sections.join("\n\n");
}

/**
 * Get enriched AI context for a client based on their latest Lab run.
 * Returns null if no Lab run exists.
 *
 * Usage in AI prompting:
 * ```
 * const context = getLabContextForClient(clientId, 'upgrade');
 * const prompt = `
 * ${context || 'No specific donor data available.'}
 *
 * Based on the above strategy, write a fundraising email...
 * `;
 * ```
 */
export function getLabContextForClient(
  clientId: string,
  focus?: "upgrade" | "monthly" | "reactivation" | "lookalike",
): string | null {
  const latestRun = getLatestLabRun(clientId);

  if (!latestRun) {
    return null;
  }

  const contextHeader = `This organization recently analyzed their donor file (${latestRun.fileName}, ${latestRun.rowsProcessed.toLocaleString()} donors, analyzed on ${new Date(latestRun.runDate).toLocaleDateString()}).\n\n`;

  const strategyContext = buildLabStrategyContext(
    latestRun.recommendations,
    focus,
  );

  return contextHeader + strategyContext;
}

/**
 * Enrich a base AI prompt with Data Lab strategy context.
 * If no Lab run exists, returns the original prompt unchanged.
 *
 * Example:
 * ```
 * const basePrompt = "Write a fundraising email for upgrade prospects.";
 * const enriched = enrichPromptWithLabContext(clientId, basePrompt, 'upgrade');
 * // enriched now includes donor file strategy before the base prompt
 * ```
 */
export function enrichPromptWithLabContext(
  clientId: string,
  basePrompt: string,
  focus?: "upgrade" | "monthly" | "reactivation" | "lookalike",
): string {
  const context = getLabContextForClient(clientId, focus);

  if (!context) {
    return basePrompt;
  }

  return `${context}\n\n---\n\n${basePrompt}`;
}

/**
 * Check if a client has Lab data available for AI enrichment.
 */
export function hasLabContext(clientId: string): boolean {
  return getLatestLabRun(clientId) !== null;
}

/**
 * Get a human-readable summary of available Lab context.
 * Useful for showing "Based on your donor analysis from [date]" in UI.
 */
export function getLabContextSummary(clientId: string): string | null {
  const latestRun = getLatestLabRun(clientId);

  if (!latestRun) {
    return null;
  }

  const date = new Date(latestRun.runDate).toLocaleDateString();
  return `Based on donor analysis from ${date} (${latestRun.rowsProcessed.toLocaleString()} donors)`;
}
