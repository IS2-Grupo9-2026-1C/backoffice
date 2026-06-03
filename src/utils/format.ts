import { AdminUserLookupItem } from '@/services/users';

export function formatPrice(n: number, fractionDigits = 0): string {
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: fractionDigits,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function resolveUserDisplay(
  id: string,
  info?: AdminUserLookupItem,
): { name: string; email?: string } {
  const name = info?.name?.trim();
  const email = info?.email?.trim();
  if (name) return { name, email };
  if (email) return { name: email };
  return { name: id };
}
