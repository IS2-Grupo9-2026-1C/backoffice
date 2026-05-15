import { requestWithAuth } from '@/services/auth';

export interface MetricsSeriesItem {
  date: string;
  count: number;
}

export interface RegisteredUsersMetrics {
  total: number;
  period_days: number | null;
  series: MetricsSeriesItem[];
}

export async function getRegisteredUsersMetrics(
  period?: number | null,
): Promise<RegisteredUsersMetrics> {
  const params = new URLSearchParams();
  if (period !== undefined && period !== null) params.append('period', String(period));
  const qs = params.toString();
  const endpoint = `/metrics/users/registered${qs ? `?${qs}` : ''}`;
  return requestWithAuth<RegisteredUsersMetrics>(endpoint);
}
