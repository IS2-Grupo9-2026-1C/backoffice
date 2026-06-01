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

export interface OrdersDistributionItem {
  status: string;
  count: number;
}

export interface OrdersSeriesItem {
  date: string;
  status: string;
  count: number;
}

export interface OrdersMetrics {
  total: number;
  current_distribution: OrdersDistributionItem[];
  period_days: number | null;
  series: OrdersSeriesItem[];
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

export async function getOrdersMetrics(period?: number | null): Promise<OrdersMetrics> {
  const params = new URLSearchParams();
  if (period !== undefined && period !== null) params.append('period', String(period));
  const qs = params.toString();
  const endpoint = `/metrics/orders${qs ? `?${qs}` : ''}`;
  return requestWithAuth<OrdersMetrics>(endpoint);
}
