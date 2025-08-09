// src/features/claude/getClaudePrompt.ts - Fixed to work with your Campaign interface

export {};

// Helper function to calculate days left
function _calculateDaysLeft(_endDate: string): number {
  if (!endDate) return 0;

  try {
    const deadline = new Date(endDate);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}
