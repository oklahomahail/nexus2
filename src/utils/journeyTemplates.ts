/**
 * Journey Templates for Data Lab-powered campaigns
 *
 * Pre-configured multi-touch journey structures for common fundraising goals:
 * - Upgrade series for donors ready to increase their giving
 * - Monthly conversion for multi-gift donors
 * - Reactivation for lapsed high-value supporters
 */

export type JourneyType = "upgrade" | "monthly" | "reactivation";

export interface JourneyTouchTemplate {
  id: string;
  label: string;
  channel: "email" | "direct_mail" | "sms" | "social" | "phone";
  offsetDays: number; // relative to campaign start
  description: string;
}

export interface JourneyTemplate {
  journeyType: JourneyType;
  name: string;
  summary: string;
  touches: JourneyTouchTemplate[];
}

export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    journeyType: "upgrade",
    name: "Upgrade-ready 3-touch series",
    summary:
      "A 3-email series inviting recent donors to increase their giving using 125% and 150% ask ladders.",
    touches: [
      {
        id: "upgrade_touch_1",
        label: "Touch #1 – Gratitude + bigger impact",
        channel: "email",
        offsetDays: 0,
        description:
          "Thank donor for past gifts, introduce the bigger opportunity, and gently introduce an increased gift.",
      },
      {
        id: "upgrade_touch_2",
        label: "Touch #2 – Specific project + ask ladder",
        channel: "email",
        offsetDays: 10,
        description:
          "Show a concrete need, present 100%/125%/150% options, and emphasize how their increased support changes the scale.",
      },
      {
        id: "upgrade_touch_3",
        label: "Touch #3 – Deadline + urgency",
        channel: "email",
        offsetDays: 25,
        description:
          "Reinforce urgency and impact, reference progress-to-date, and offer a final clear upgrade ask.",
      },
    ],
  },
  {
    journeyType: "monthly",
    name: "Monthly giving 3-touch series",
    summary:
      "A 3-touch series focused on converting multi-gift donors to recurring monthly givers.",
    touches: [
      {
        id: "monthly_touch_1",
        label: "Touch #1 – Invite to join the monthly community",
        channel: "email",
        offsetDays: 0,
        description:
          "Tell a story and invite them to become part of a core group of sustaining supporters.",
      },
      {
        id: "monthly_touch_2",
        label: "Touch #2 – Social proof + impact",
        channel: "email",
        offsetDays: 14,
        description:
          'Highlight other monthly donors, show monthly-level impact (e.g., "$25/month funds…").',
      },
      {
        id: "monthly_touch_3",
        label: "Touch #3 – Time-bound reminder",
        channel: "email",
        offsetDays: 30,
        description:
          "Friendly reminder that this is the last chance to be part of this year's monthly circle.",
      },
    ],
  },
  {
    journeyType: "reactivation",
    name: "Reactivation 2–3 touch series",
    summary:
      "A gentle sequence to re-engage lapsed high-value donors with gratitude and updated needs.",
    touches: [
      {
        id: "reactivation_touch_1",
        label: "Touch #1 – Gratitude + update",
        channel: "email",
        offsetDays: 0,
        description:
          "Acknowledge time since last gift, thank them for past impact, and share what has happened since.",
      },
      {
        id: "reactivation_touch_2",
        label: "Touch #2 – Specific opportunity + soft ask",
        channel: "email",
        offsetDays: 14,
        description:
          "Introduce one specific opportunity and a soft reactivation ask, with a modest ladder.",
      },
      {
        id: "reactivation_touch_3",
        label: "Touch #3 – Optional reminder",
        channel: "email",
        offsetDays: 35,
        description:
          "Optional final reminder for lapsed donors who engaged but didn't give in the first two touches.",
      },
    ],
  },
];

export function getJourneyTemplate(
  type: JourneyType,
): JourneyTemplate | undefined {
  return JOURNEY_TEMPLATES.find((t) => t.journeyType === type);
}
