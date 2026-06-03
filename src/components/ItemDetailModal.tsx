import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { AdminItemDetail, ItemStatusEvent, getItemAdminDetail } from '@/services/items';
import { AdminUserLookupItem, lookupUsers } from '@/services/users';
import { formatDateTime, formatPrice } from '@/utils/format';

interface Props {
  itemId: string;
  onClose: () => void;
}

const thClass =
  'px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const tdClass = 'px-3 py-2 align-middle text-sm text-gray-900';
const HISTORY_PAGE_SIZE = 5;

function formatHistoryValue(event: ItemStatusEvent, value?: string | null): string {
  if (!value) return '—';
  const normalized = String(value).toUpperCase();

  if (event.eventType === 'seller_status_change') {
    if (normalized === 'ACTIVE' || normalized === 'ENABLED') return 'Habilitado';
    if (normalized === 'DISABLED') return 'Deshabilitado';
  }

  if (event.eventType === 'admin_status_change') {
    if (normalized === 'ACTIVE' || normalized === 'ENABLED' || normalized === 'FALSE') {
      return 'Habilitado';
    }
    if (normalized === 'DISABLED' || normalized === 'TRUE') return 'Deshabilitado';
  }

  if (event.eventType === 'seller_block_change') {
    if (normalized === 'BLOCKED' || normalized === 'TRUE' || normalized === 'YES') {
      return 'Bloqueado';
    }
    if (normalized === 'UNBLOCKED' || normalized === 'FALSE' || normalized === 'NO') {
      return 'Desbloqueado';
    }
  }

  return String(value);
}

function eventLabel(eventType: string): string {
  switch (eventType) {
    case 'seller_status_change':
      return 'Estado vendedor';
    case 'admin_status_change':
      return 'Estado admin';
    case 'seller_block_change':
      return 'Bloqueo vendedor';
    default:
      return eventType;
  }
}

function actorLabel(event: ItemStatusEvent): string {
  if (event.actorRole === 'system') return 'Sistema';
  const role = event.actorRole === 'seller' ? 'Vendedor' : event.actorRole;
  if (event.actorId) return `${role} #${event.actorId}`;
  return role;
}

export default function ItemDetailModal({ itemId, onClose }: Props) {
  const [item, setItem] = useState<AdminItemDetail | null>(null);
  const [seller, setSeller] = useState<AdminUserLookupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  const totalHistoryPages = item
    ? Math.max(1, Math.ceil(item.history.length / HISTORY_PAGE_SIZE))
    : 1;
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages);
  const historyStart = (currentHistoryPage - 1) * HISTORY_PAGE_SIZE;
  const historySlice = item
    ? item.history.slice(historyStart, historyStart + HISTORY_PAGE_SIZE)
    : [];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getItemAdminDetail(itemId)
      .then(async (detail) => {
        if (cancelled) return;
        setItem(detail);
        try {
          const sellers = await lookupUsers([detail.sellerId]);
          if (!cancelled) setSeller(sellers.get(detail.sellerId) ?? null);
        } catch {
          // seller info is best-effort
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar el item');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  useEffect(() => {
    setHistoryPage(1);
  }, [itemId]);

  useEffect(() => {
    if (historyPage > totalHistoryPages) {
      setHistoryPage(totalHistoryPages);
    }
  }, [historyPage, totalHistoryPages]);

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-6 p-6 pt-10">
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {item && (
          <>
            <div className="flex gap-5">
              {item.imageUrls.length > 0 ? (
                <img
                  src={item.imageUrls[0]}
                  alt={item.title}
                  className="h-32 w-32 flex-shrink-0 rounded-xl border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-3xl text-gray-300">
                  📦
                </div>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="m-0 text-xl font-bold text-gray-900">{item.title}</h2>
                <p className="m-0 text-sm text-gray-500">{item.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Precio</span>
                <span className="font-medium text-gray-900">{formatPrice(item.price)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Stock</span>
                <span className="font-medium text-gray-900">{item.stock}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Estado vendedor</span>
                <span className="font-medium text-gray-900">
                  {item.status === 'ACTIVE' ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Estado admin</span>
                <span className="font-medium text-gray-900">
                  {item.adminDisabled ? 'Deshabilitado' : 'Habilitado'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Vendedor bloqueado</span>
                <span className="font-medium text-gray-900">
                  {item.sellerBlocked ? 'Bloqueado' : 'Desbloqueado'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Creado</span>
                <span className="font-medium text-gray-900">{formatDateTime(item.createdAt)}</span>
              </div>
              <div className="col-span-2 flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Vendedor</span>
                <span className="font-medium text-gray-900 text-right">
                  {seller
                    ? `${seller.name ?? ''} ${seller.email ? `(${seller.email})` : ''}`.trim()
                    : item.sellerId}
                </span>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Historial de cambios</h3>
              {item.history.length === 0 ? (
                <p className="text-sm text-gray-400">Sin eventos registrados.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className={thClass}>Cuándo</th>
                        <th className={thClass}>Evento</th>
                        <th className={thClass}>Estado</th>
                        <th className={thClass}>Actor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historySlice.map((ev, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className={tdClass}>{formatDateTime(ev.changedAt)}</td>
                          <td className={tdClass}>{eventLabel(ev.eventType)}</td>
                          <td className={`${tdClass} text-gray-500`}>
                            {formatHistoryValue(ev, ev.toValue ?? ev.fromValue)}
                          </td>
                          <td className={`${tdClass} text-gray-500`}>{actorLabel(ev)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {item.history.length > HISTORY_PAGE_SIZE && (
                <div className="mt-3 flex items-center justify-end gap-3 text-sm text-gray-500">
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-medium"
                    disabled={currentHistoryPage === 1}
                    onClick={() => setHistoryPage((page) => page - 1)}
                  >
                    ← Anterior
                  </Button>
                  <span>
                    Página {currentHistoryPage} de {totalHistoryPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-medium"
                    disabled={currentHistoryPage === totalHistoryPages}
                    onClick={() => setHistoryPage((page) => page + 1)}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
