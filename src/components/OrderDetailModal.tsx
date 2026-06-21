import { useEffect, useState } from 'react';
import ItemDetailModal from '@/components/ItemDetailModal';
import Modal from '@/components/Modal';
import { ORDER_STATUS_LABEL } from '@/constants/orderStatuses';
import { OrderDetail } from '@/services/orders';
import { AdminUserLookupItem, lookupUsers } from '@/services/users';
import { formatDateTime, formatPrice, resolveUserDisplay } from '@/utils/format';

interface OrderDetailModalProps {
  order: OrderDetail | null;
  onClose: () => void;
}

function statusLabel(id: string): string {
  return ORDER_STATUS_LABEL[id] ?? id;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [usersById, setUsersById] = useState<Map<string, AdminUserLookupItem>>(new Map());
  const [usersError, setUsersError] = useState(false);
  const [usersRetryTick, setUsersRetryTick] = useState(0);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    const ids = new Set<string>();
    ids.add(order.userId);
    ids.add(order.sellerId);
    for (const h of order.history) {
      if (h.changedBy) ids.add(h.changedBy);
    }
    setUsersError(false);
    lookupUsers(Array.from(ids))
      .then((resolved) => {
        if (!cancelled) setUsersById(resolved);
      })
      .catch(() => {
        if (!cancelled) {
          setUsersById(new Map());
          setUsersError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [order, usersRetryTick]);

  if (!order) return null;

  const buyer = resolveUserDisplay(order.userId, usersById.get(order.userId));
  const seller = resolveUserDisplay(order.sellerId, usersById.get(order.sellerId));

  return (
    <Modal onClose={onClose} title="Detalle de orden" subtitle={order.id} size="lg">
      <div className="flex flex-col gap-6 px-6 py-6">
        {usersError && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <span>No se pudieron cargar algunos nombres de usuario; se muestran los IDs.</span>
            <button
              type="button"
              onClick={() => setUsersRetryTick((t) => t + 1)}
              className="font-semibold underline underline-offset-2 hover:text-amber-900"
            >
              Reintentar
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="m-0 text-xs uppercase tracking-wide text-gray-500">Estado actual</p>
            <p className="m-0 mt-1 font-semibold text-gray-900">{statusLabel(order.status)}</p>
          </div>
          <div>
            <p className="m-0 text-xs uppercase tracking-wide text-gray-500">Monto total</p>
            <p className="m-0 mt-1 font-semibold text-gray-900">{formatPrice(order.total, 2)}</p>
          </div>
          <div>
            <p className="m-0 text-xs uppercase tracking-wide text-gray-500">Fecha de creación</p>
            <p className="m-0 mt-1 text-gray-900">{formatDateTime(order.createdAt)}</p>
          </div>
          <div>
            <p className="m-0 text-xs uppercase tracking-wide text-gray-500">
              Última actualización
            </p>
            <p className="m-0 mt-1 text-gray-900">{formatDateTime(order.updatedAt)}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="m-0 text-xs uppercase tracking-wide text-gray-500">Comprador</p>
            <p className="m-0 mt-1 font-semibold text-gray-900">{buyer.name}</p>
            {buyer.email && <p className="m-0 text-xs text-gray-500">{buyer.email}</p>}
          </div>
          <div>
            <p className="m-0 text-xs uppercase tracking-wide text-gray-500">Vendedor</p>
            <p className="m-0 mt-1 font-semibold text-gray-900">{seller.name}</p>
            {seller.email && <p className="m-0 text-xs text-gray-500">{seller.email}</p>}
          </div>
        </section>

        <section>
          <h3 className="m-0 mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Items
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500">
                    Título
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.4px] text-gray-500">
                    Cantidad
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.4px] text-gray-500">
                    Precio unitario
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.4px] text-gray-500">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.itemId} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-4 py-2 text-gray-900">
                      <button
                        type="button"
                        onClick={() => setDetailItemId(it.itemId)}
                        className="text-left text-gray-900 transition-colors hover:text-indigo-600"
                      >
                        {it.title}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-900">
                      {it.quantity}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-900">
                      {formatPrice(it.unitPrice, 2)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-900">
                      {formatPrice(it.subtotal, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="m-0 mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Historial
          </h3>
          {order.history.length === 0 ? (
            <p className="m-0 text-sm text-gray-500">Sin transiciones registradas.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {order.history.map((h, idx) => {
                const actor = h.changedBy
                  ? resolveUserDisplay(h.changedBy, usersById.get(h.changedBy))
                  : null;
                return (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-900">
                        {h.fromStatus ? (
                          <>
                            {statusLabel(h.fromStatus)} <span className="text-gray-400">→</span>{' '}
                            {statusLabel(h.toStatus)}
                          </>
                        ) : (
                          <>{statusLabel(h.toStatus)}</>
                        )}
                      </span>
                      {actor && <span className="text-xs text-gray-500">Por: {actor.name}</span>}
                    </div>
                    <span className="whitespace-nowrap text-xs text-gray-500">
                      {formatDateTime(h.changedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {detailItemId && (
        <ItemDetailModal itemId={detailItemId} onClose={() => setDetailItemId(null)} />
      )}
    </Modal>
  );
}
