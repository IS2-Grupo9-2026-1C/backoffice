import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import Button from '@/components/Button';
import FilterDropdown from '@/components/FilterDropdown';
import OrderDetailModal from '@/components/OrderDetailModal';
import Pagination from '@/components/Pagination';
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from '@/constants/orderStatuses';
import { OrderDetail, OrderListItem, getOrderById, listOrders } from '@/services/orders';
import { AdminUserLookupItem, lookupUsers } from '@/services/users';
import { ApiError } from '@/services/api';
import { formatDate, formatPrice, resolveUserDisplay } from '@/utils/format';

const PAGE_SIZE = 8;

const thClass =
  'px-4 py-[10px] text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const tdClass = 'p-4 align-middle text-gray-900';
const badgeClass = 'inline-block px-[10px] py-1 rounded-full text-xs font-semibold';

function shortId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export default function Orders() {
  const [list, setList] = useState<OrderListItem[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyersById, setBuyersById] = useState<Map<string, AdminUserLookupItem>>(new Map());

  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const openRequestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);

    listOrders({ page, size: PAGE_SIZE, status: status || undefined })
      .then(async (response) => {
        if (cancelled) return;
        setList(response.data);
        setTotal(response.meta.total);

        const buyerIds = response.data.map((o) => o.userId).filter(Boolean);
        if (buyerIds.length === 0) {
          setBuyersById(new Map());
          return;
        }
        try {
          const resolved = await lookupUsers(buyerIds);
          if (!cancelled) setBuyersById(resolved);
        } catch {
          if (!cancelled) setBuyersById(new Map());
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, status]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) setPage(1);
  }, [page, total]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  function handleStatusSelect(value: string) {
    setStatus(value);
    setPage(1);
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchId(e.target.value);
    if (searchError) setSearchError(null);
  }

  async function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = searchId.trim();
    if (!id) {
      setSearchError('Ingresá un ID de orden para buscar.');
      return;
    }
    setSearchError(null);
    setSearchLoading(true);
    const requestId = ++openRequestRef.current;
    try {
      const detail = await getOrderById(id);
      if (openRequestRef.current !== requestId) return;
      setSelectedOrder(detail);
    } catch (err) {
      if (openRequestRef.current !== requestId) return;
      if (err instanceof ApiError && err.status === 404) {
        setSearchError('No se encontró ninguna orden con ese ID.');
      } else {
        setSearchError(err instanceof Error ? err.message : 'No se pudo obtener la orden.');
      }
    } finally {
      if (openRequestRef.current === requestId) setSearchLoading(false);
    }
  }

  async function handleRowClick(order: OrderListItem) {
    setSearchError(null);
    setOpeningId(order.id);
    const requestId = ++openRequestRef.current;
    try {
      const detail = await getOrderById(order.id);
      if (openRequestRef.current !== requestId) return;
      setSelectedOrder(detail);
    } catch (err) {
      if (openRequestRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : 'No se pudo obtener el detalle de la orden.');
    } finally {
      if (openRequestRef.current === requestId) setOpeningId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 text-[32px] font-bold text-gray-900">Órdenes</h1>
        <p className="m-0 text-base text-gray-500">
          Consultá las órdenes de la plataforma para soporte y seguimiento.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <form className="flex items-center gap-3" onSubmit={handleSearchSubmit}>
          <input
            className="flex-1 max-w-[360px] rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none"
            placeholder="Buscar por ID..."
            value={searchId}
            onChange={handleSearchChange}
          />
          <Button type="submit" size="sm" variant="primary" disabled={searchLoading}>
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </Button>
          <span className="text-sm text-gray-500">
            {total} resultado{total === 1 ? '' : 's'}
          </span>
          {loading && <span className="text-sm text-gray-400">Cargando...</span>}
        </form>
        {searchError && <p className="m-0 text-sm text-red-600">{searchError}</p>}
      </section>

      <section className="flex items-center justify-between gap-4">
        <FilterDropdown
          options={ORDER_STATUSES}
          selectedId={status}
          onSelect={handleStatusSelect}
        />
        <p className="m-0 text-right text-xs text-gray-400">
          Hacé click en una fila para ver el detalle completo de la orden.
        </p>
      </section>

      {error && list.length > 0 && <p className="m-0 text-sm text-red-600">{error}</p>}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[180px]" />
            <col />
            <col className="w-[140px]" />
            <col className="w-[160px]" />
            <col className="w-[140px]" />
          </colgroup>
          <thead>
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Comprador</th>
              <th className={thClass}>Fecha</th>
              <th className={thClass}>Estado</th>
              <th className={`${thClass} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map((order) => {
              const buyer = buyersById.get(order.userId);
              const buyerDisplay = resolveUserDisplay(order.userId, buyer);
              const statusText = ORDER_STATUS_LABEL[order.status] ?? order.status;
              const isOpening = openingId === order.id;
              return (
                <tr
                  key={order.id}
                  onClick={() => !isOpening && handleRowClick(order)}
                  className={`border-b border-gray-200 transition-colors ${
                    isOpening ? 'bg-gray-50' : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <td className={tdClass} title={order.id}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOpening) handleRowClick(order);
                      }}
                      className="truncate text-left font-mono text-xs text-gray-500 transition-colors hover:text-indigo-600"
                    >
                      {shortId(order.id)}
                    </button>
                  </td>
                  <td className={tdClass}>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-gray-900">{buyerDisplay.name}</span>
                      {buyerDisplay.email && (
                        <span className="truncate text-xs text-gray-400">{buyerDisplay.email}</span>
                      )}
                    </div>
                  </td>
                  <td className={`${tdClass} text-gray-500`}>{formatDate(order.createdAt)}</td>
                  <td className={tdClass}>
                    <span className={`${badgeClass} bg-gray-100 text-gray-700`}>{statusText}</span>
                  </td>
                  <td className={`${tdClass} text-right tabular-nums whitespace-nowrap`}>
                    {formatPrice(order.total, 2)}
                  </td>
                </tr>
              );
            })}
            {!loading && error && list.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-red-600" colSpan={5}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && list.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={5}>
                  No hay órdenes que coincidan con el filtro.
                </td>
              </tr>
            )}
            {loading && list.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={5}>
                  Cargando órdenes...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
