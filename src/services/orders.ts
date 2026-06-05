import { requestWithAuth } from '@/services/auth';

export interface OrderListItem {
  id: string;
  userId: string;
  sellerId: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface OrderListMeta {
  page: number;
  size: number;
  total: number;
}

export interface OrderListResponse {
  data: OrderListItem[];
  meta: OrderListMeta;
}

export interface OrderItemDetail {
  itemId: string;
  sellerId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderHistoryEntry {
  fromStatus?: string;
  toStatus: string;
  changedBy?: string;
  changedAt: string;
}

export interface OrderShippingAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface OrderDetail {
  id: string;
  userId: string;
  sellerId: string;
  status: string;
  total: number;
  shippingAddress: OrderShippingAddress;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDetail[];
  history: OrderHistoryEntry[];
}

export async function listOrders(
  params: { page?: number; size?: number; status?: string } = {},
): Promise<OrderListResponse> {
  const queryParams = new URLSearchParams();
  if (params.status) {
    queryParams.append('status', params.status);
  }
  queryParams.append('page', String(params.page ?? 1));
  queryParams.append('size', String(params.size ?? 8));

  return requestWithAuth<OrderListResponse>(`/admin/orders?${queryParams.toString()}`);
}

export async function getOrderById(id: string): Promise<OrderDetail> {
  return requestWithAuth<OrderDetail>(`/admin/orders/${encodeURIComponent(id)}`);
}
