import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import Button from '@/components/Button';
import FilterDropdown from '@/components/FilterDropdown';
import Pagination from '@/components/Pagination';
import ItemDetailModal from '@/components/ItemDetailModal';
import { CATEGORIES } from '@/constants/categories';
import { ItemListItem, disableItemAsAdmin, enableItemAsAdmin, listItems } from '@/services/items';
import { AdminUserLookupItem, lookupUsers } from '@/services/users';
import { formatPrice, resolveUserDisplay } from '@/utils/format';

const PAGE_SIZE = 8;

const thClass =
  'px-4 py-[10px] text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const tdClass = 'p-4 align-middle text-gray-900';
const tdCompactClass = 'px-1 py-2 align-middle text-gray-900';
const tdNumericClass = 'px-2 py-3 align-middle text-gray-900';
const thNumericClass =
  'px-2 py-[10px] text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const chipClass =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap';

const iconProps = {
  width: 13,
  height: 13,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const CheckIcon = (
  <svg {...iconProps} strokeWidth={3}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const PauseIcon = (
  <svg {...iconProps}>
    <path d="M9 5v14M15 5v14" />
  </svg>
);

const UserIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20c.8-3.6 3.9-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
  </svg>
);

const ShieldIcon = (
  <svg {...iconProps}>
    <path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z" />
  </svg>
);

type ReasonKey = 'admin' | 'cuenta' | 'vendedor';

const REASON_META: Record<ReasonKey, { label: string; className: string; icon: ReactNode }> = {
  vendedor: {
    label: 'Pausado por el vendedor',
    className: 'bg-amber-100 text-amber-800 border border-amber-200',
    icon: PauseIcon,
  },
  cuenta: {
    label: 'Cuenta bloqueada',
    className: 'bg-red-100 text-red-700 border border-red-200',
    icon: UserIcon,
  },
  admin: {
    label: 'Deshabilitado por admin',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
    icon: ShieldIcon,
  },
};

// Resume el estado de un ítem en un motivo principal. Prioridad: admin > cuenta > vendedor.
function getStatusSummary(item: ItemListItem) {
  const isOk = item.status === 'ACTIVE' && !item.sellerBlocked && !item.adminDisabled;
  const reasons: ReasonKey[] = [];
  if (item.adminDisabled) reasons.push('admin');
  if (item.sellerBlocked) reasons.push('cuenta');
  if (item.status === 'DISABLED') reasons.push('vendedor');
  const [primary, ...extra] = reasons;
  return {
    isOk,
    primary,
    extraCount: extra.length,
    extraTitle: extra.map((reason) => REASON_META[reason].label).join(' · '),
  };
}

function formatCompactNumber(n: number, maxDigits = 10): string {
  const digits = Math.abs(Math.trunc(n)).toString();
  if (digits.length <= maxDigits) {
    return n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }
  const head = Number(digits.slice(0, maxDigits));
  return `${head.toLocaleString('es-AR')}...`;
}

function formatCompactPrice(n: number): string {
  const digits = Math.abs(Math.trunc(n)).toString();
  if (digits.length <= 10) {
    return formatPrice(n);
  }
  return `$ ${formatCompactNumber(n)}`;
}

export default function Items() {
  const [list, setList] = useState<ItemListItem[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [refreshTick, setRefreshTick] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [sellersById, setSellersById] = useState<Map<string, AdminUserLookupItem>>(new Map());
  const [detailItemId, setDetailItemId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setActionError(null);

    const timer = setTimeout(() => {
      setLoading(true);
      listItems({
        page,
        size: PAGE_SIZE,
        search: query.trim() || undefined,
        categoryId: categoryId || undefined,
      })
        .then(async (response) => {
          if (cancelled) return;
          setList(response.data);
          setTotal(response.meta.total);

          const sellerIds = response.data.map((i) => i.sellerId).filter(Boolean);
          if (sellerIds.length === 0) {
            setSellersById(new Map());
            return;
          }
          try {
            const resolved = await lookupUsers(sellerIds);
            if (!cancelled) setSellersById(resolved);
          } catch {
            if (!cancelled) setSellersById(new Map());
          }
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : 'Error al cargar items');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, query, categoryId, refreshTick]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) setPage(1);
  }, [page, total]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPage(1);
  }

  function handleCategorySelect(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  async function handleToggleAdminDisabled(item: ItemListItem) {
    if (pendingIds.has(item.id)) return;
    setActionError(null);
    setPendingIds((prev) => new Set(prev).add(item.id));

    const optimistic = !item.adminDisabled;
    setList((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, adminDisabled: optimistic } : i)),
    );
    try {
      if (item.adminDisabled) {
        await enableItemAsAdmin(item.id);
      } else {
        await disableItemAsAdmin(item.id);
      }
    } catch (err) {
      setList((prev) =>
        prev.map((i) =>
          i.id === item.id && i.adminDisabled === optimistic
            ? { ...i, adminDisabled: item.adminDisabled }
            : i,
        ),
      );
      const action = item.adminDisabled ? 'rehabilitar' : 'deshabilitar';
      setActionError(
        err instanceof Error
          ? `No se pudo ${action} "${item.title}": ${err.message}`
          : `No se pudo ${action} "${item.title}".`,
      );
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 text-[32px] font-bold text-gray-900">Items</h1>
        <p className="m-0 text-base text-gray-500">Administrá los items de la plataforma.</p>
      </header>

      <section className="flex items-center gap-4">
        <input
          className="flex-1 max-w-[360px] rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none"
          placeholder="Buscar por título..."
          value={query}
          onChange={handleSearch}
        />
        <span className="text-sm text-gray-500">
          {total} resultado{total === 1 ? '' : 's'}
        </span>
        {loading && <span className="text-sm text-gray-400">Cargando...</span>}
        <Button size="sm" variant="outline" onClick={() => setRefreshTick((tick) => tick + 1)}>
          Actualizar
        </Button>
      </section>

      <section className="flex items-center justify-between gap-4">
        <FilterDropdown
          options={CATEGORIES}
          selectedId={categoryId}
          onSelect={handleCategorySelect}
        />

        <p className="m-0 text-right text-xs text-gray-400">
          El ítem no se mostrará en la app si su estado es distinto de "Visible" o si su stock es 0.
          <br />
          Hacé click en un ítem para ver más detalles y moderar su estado.
        </p>
      </section>

      {error && list.length > 0 && <p className="m-0 text-sm text-red-600">{error}</p>}

      {actionError && (
        <p className="m-0 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="shrink-0 font-bold text-red-500 transition-colors hover:text-red-700"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col />
            <col className="w-[140px]" />
            <col className="w-[120px]" />
            <col className="w-[230px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr>
              <th className={thClass}>Nombre</th>
              <th className={thNumericClass}>Precio</th>
              <th className={thNumericClass}>Stock</th>
              <th className={thClass}>Estado</th>
              <th className={`${thClass} text-right`}></th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => {
              const seller = sellersById.get(item.sellerId);
              const sellerDisplay = resolveUserDisplay(item.sellerId, seller);
              const status = getStatusSummary(item);
              return (
                <tr
                  key={item.id}
                  onClick={() => setDetailItemId(item.id)}
                  className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50"
                >
                  <td className={tdClass}>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailItemId(item.id);
                        }}
                        className="truncate text-left text-gray-900 transition-colors hover:text-indigo-600"
                      >
                        {item.title}
                      </button>
                      <span className="truncate text-xs text-gray-400">
                        Vendedor: {sellerDisplay.name}
                      </span>
                    </div>
                  </td>
                  <td className={`${tdNumericClass} text-left tabular-nums whitespace-nowrap`}>
                    {formatCompactPrice(item.price)}
                  </td>
                  <td
                    className={`${tdNumericClass} text-left tabular-nums whitespace-nowrap ${
                      item.stock === 0 ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {formatCompactNumber(item.stock)}
                  </td>
                  <td className={tdClass}>
                    {status.isOk ? (
                      <span
                        className={`${chipClass} bg-emerald-100 text-emerald-700 border border-emerald-200`}
                      >
                        {CheckIcon}
                        Visible
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={`${chipClass} ${REASON_META[status.primary].className}`}>
                          {REASON_META[status.primary].icon}
                          {REASON_META[status.primary].label}
                        </span>
                        {status.extraCount > 0 && (
                          <span
                            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500"
                            title={status.extraTitle}
                          >
                            +{status.extraCount}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={`${tdCompactClass} pl-0 text-left whitespace-nowrap`}>
                    <Button
                      size="sm"
                      variant={item.adminDisabled ? 'outlinePrimary' : 'outlineDanger'}
                      fullWidth
                      className="px-3 truncate"
                      disabled={pendingIds.has(item.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAdminDisabled(item);
                      }}
                    >
                      {pendingIds.has(item.id)
                        ? 'Guardando...'
                        : item.adminDisabled
                          ? 'Rehabilitar'
                          : 'Deshabilitar'}
                    </Button>
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
                  No hay items que coincidan con la búsqueda.
                </td>
              </tr>
            )}
            {loading && list.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={5}>
                  Cargando items...
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

      {detailItemId && (
        <ItemDetailModal itemId={detailItemId} onClose={() => setDetailItemId(null)} />
      )}
    </div>
  );
}
