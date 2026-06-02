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

export interface OrdersMetrics {
  total: number;
  current_distribution: OrdersDistributionItem[];
  period_days: number | null;
  /** Daily order creations in the selected period (empty when no period). */
  series: MetricsSeriesItem[];
}

export interface TopProductSalesItem {
  item_id: string;
  units_sold: number;
  title?: string | null;
  image_url?: string | null;
}

export interface SalesMetrics {
  total_amount: number;
  period_days: number | null;
  top_products: TopProductSalesItem[];
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

export async function getSalesMetrics(period?: number | null): Promise<SalesMetrics> {
  const params = new URLSearchParams();
  if (period !== undefined && period !== null) params.append('period', String(period));
  const qs = params.toString();
  const endpoint = `/metrics/sales${qs ? `?${qs}` : ''}`;
  return requestWithAuth<SalesMetrics>(endpoint);
}
