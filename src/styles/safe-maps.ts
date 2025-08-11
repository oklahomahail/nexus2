export type Tone = "blue" | "green" | "purple" | "indigo";
export const toneBg = {
  blue: "bg-blue-600 hover:bg-blue-700",
  green: "bg-green-600 hover:bg-green-700",
  purple: "bg-purple-600 hover:bg-purple-700",
  indigo: "bg-indigo-600 hover:bg-indigo-700",
} satisfies Record<Tone, string>;

export const toneText = {
  blue: "text-blue-100",
  green: "text-green-100",
  purple: "text-purple-100",
  indigo: "text-indigo-100",
} satisfies Record<Tone, string>;

export type Notif = "info" | "success" | "warning" | "error";
export const notifDot = {
  success: "bg-green-400",
  warning: "bg-yellow-400",
  error: "bg-red-400",
  info: "bg-blue-400",
} satisfies Record<Notif, string>;

export type Size = "sm" | "md" | "lg";
export const sizeWH = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
} satisfies Record<Size, string>;
