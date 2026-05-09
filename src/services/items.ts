import { requestWithAuth } from '@/services/auth';

export type ItemRawStatus = 'ACTIVE' | 'DISABLED';

export interface ItemListItem {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  status: ItemRawStatus;
  sellerBlocked: boolean;
  adminDisabled: boolean;
  categoryId: string;
  sellerId: string;
  createdAt: string;
}

export interface ItemListMeta {
  page: number;
  size: number;
  total: number;
}

export interface ItemListResponse {
  data: ItemListItem[];
  meta: ItemListMeta;
}

export async function listItems(
  params: {
    page?: number;
    size?: number;
    search?: string;
    categoryId?: string;
  } = {},
): Promise<ItemListResponse> {
  const queryParams = new URLSearchParams();

  if (params.search) {
    queryParams.append('q', params.search);
  }

  if (params.categoryId) {
    queryParams.append('category_id', params.categoryId);
  }

  queryParams.append('page', String(params.page ?? 1));
  queryParams.append('size', String(params.size ?? 8));

  return requestWithAuth<ItemListResponse>(`/admin/items?${queryParams.toString()}`);
}
