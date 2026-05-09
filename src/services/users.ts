import { requestWithAuth } from '@/services/auth';

export interface UserListItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserListMeta {
  page: number;
  size: number;
  total: number;
}

export interface UserListResponse {
  data: UserListItem[];
  meta: UserListMeta;
}

export async function listUsers(
  params: {
    page?: number;
    size?: number;
    search?: string;
  } = {},
): Promise<UserListResponse> {
  const queryParams = new URLSearchParams();

  if (params.search) {
    queryParams.append('search', params.search);
  }

  queryParams.append('page', String(params.page ?? 1));
  queryParams.append('size', String(params.size ?? 8));

  return requestWithAuth<UserListResponse>(`/users?${queryParams.toString()}`);
}

export async function blockUser(userId: number): Promise<void> {
  await requestWithAuth(`/users/${userId}/block`, { method: 'POST' });
}

export async function unblockUser(userId: number): Promise<void> {
  await requestWithAuth(`/users/${userId}/unblock`, { method: 'POST' });
}
