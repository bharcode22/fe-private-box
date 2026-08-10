export const getDaysRemaining = (expiresAtStr?: string): number => {
  if (!expiresAtStr) return Number(import.meta.env.VITE_FREE_USER_ACTIVE_DAYS || 150);
  const exp = new Date(expiresAtStr).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((exp - now) / (1000 * 3600 * 24));
  return Math.max(0, diffDays);
};
