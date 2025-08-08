export const calculateDaysLeft = (deadline: string | number | Date) => {
  if (!deadline) return 0;
  const today = new Date();
  const target = new Date(deadline);
  const diffTime = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};
