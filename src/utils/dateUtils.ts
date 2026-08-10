import { FREE_ACTIVE_DAYS } from '../constants/config';

export const getDaysRemaining = (expiresAtStr?: string): number => {
  if (!expiresAtStr) return FREE_ACTIVE_DAYS;
  const exp = new Date(expiresAtStr).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((exp - now) / (1000 * 3600 * 24));
  return Math.max(0, diffDays);
};
