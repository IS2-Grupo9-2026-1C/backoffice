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

export interface CategoryOrdersCountItem {
  category: string;
  count: number;
}

export interface OrdersMetrics {
  total: number;
  current_distribution: OrdersDistributionItem[];
  period_days: number | null;
  /** Daily order creations in the selected period (empty when no period). */
  series: MetricsSeriesItem[];
  /** Cantidad de órdenes agrupadas por categoría para el período. */
  categories: CategoryOrdersCountItem[];
}

export interface TopProductSalesItem {
  item_id: string;
  units_sold: number;
  title?: string | null;
  image_url?: string | null;
  seller_id?: string | null;
  seller_name?: string | null;
}

export interface CategorySalesAmountItem {
  category: string;
  /** Decimal serializado como string para no perder precisión en JSON. */
  amount: string;
}

export interface SalesMetrics {
  /** Decimal serializado como string para no perder precisión en JSON. */
  total_amount: string;
  period_days: number | null;
  top_products: TopProductSalesItem[];
  /** Monto transaccionado agrupado por categoría para el período. */
  categories: CategorySalesAmountItem[];
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
