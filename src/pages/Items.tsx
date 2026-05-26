import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Button from '@/components/Button';
import { CATEGORIES } from '@/constants/categories';
import { ItemListItem, disableItemAsAdmin, enableItemAsAdmin, listItems } from '@/services/items';
import { AdminUserLookupItem, lookupUsers } from '@/services/users';

const PAGE_SIZE = 8;

const thClass =
  'px-4 py-[10px] text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const tdClass = 'p-4 align-middle text-gray-900';
const tdCompactClass = 'px-1 py-2 align-middle text-gray-900';
const tdNumericClass = 'px-2 py-3 align-middle text-gray-900';
const thNumericClass =
  'px-2 py-[10px] text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const badgeClass =
  'inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold';

const SELLER_STATUS_BADGE: Record<'active' | 'disabled', { label: string; className: string }> = {
  active: { label: 'H', className: 'bg-emerald-100 text-emerald-700' },
  disabled: { label: 'D', className: 'bg-red-100 text-red-700' },
};

const SELLER_BLOCKED_BADGE: Record<'yes' | 'no', { label: string; className: string }> = {
  yes: { label: 'D', className: 'bg-red-100 text-red-700' },
  no: { label: 'H', className: 'bg-emerald-100 text-emerald-700' },
};

const ADMIN_STATUS_BADGE: Record<'enabled' | 'disabled', { label: string; className: string }> = {
  enabled: { label: 'H', className: 'bg-emerald-100 text-emerald-700' },
  disabled: { label: 'D', className: 'bg-red-100 text-red-700' },
};

function formatPrice(n: number): string {
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
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

function resolveSellerDisplay(
  sellerId: string,
  info: AdminUserLookupItem | undefined,
): { name: string; email?: string } {
  const name = info?.name?.trim();
  const email = info?.email?.trim();
  if (name) return { name, email };
  if (email) return { name: email };
  return { name: sellerId };
}

export default function Items() {
  const [list, setList] = useState<ItemListItem[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellersById, setSellersById] = useState<Map<string, AdminUserLookupItem>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setError(null);

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
  }, [page, query, categoryId]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) setPage(1);
  }, [page, total]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!categoryRef.current) return;
      if (!categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCategoryOpen(false);
      }
    }

    if (categoryOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [categoryOpen]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPage(1);
  }

  function handleCategorySelect(value: string) {
    setCategoryId(value);
    setPage(1);
    setCategoryOpen(false);
  }

  async function handleToggleAdminDisabled(item: ItemListItem) {
    setList((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, adminDisabled: !item.adminDisabled } : i)),
    );
    try {
      if (item.adminDisabled) {
        await enableItemAsAdmin(item.id);
      } else {
        await disableItemAsAdmin(item.id);
      }
    } catch {
      setList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, adminDisabled: item.adminDisabled } : i)),
      );
    }
  }

  const selectedCategory = CATEGORIES.find((cat) => cat.id === categoryId);
  const selectedCategoryLabel = selectedCategory?.label ?? 'Todos';

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
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setPage(1);
            setQuery('');
            setCategoryId('');
          }}
        >
          Actualizar
        </Button>
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
              H
            </span>
            Habilitado
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[11px] font-semibold text-red-700">
              D
            </span>
            Deshabilitado
          </span>
        </div>
      </section>

      <section className="flex items-center justify-between gap-4">
        <div className="relative" ref={categoryRef}>
          <button
            type="button"
            onClick={() => setCategoryOpen((open) => !open)}
            className="flex min-w-[180px] items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none hover:bg-gray-100"
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
          >
            <span className="truncate">{selectedCategoryLabel}</span>
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {categoryOpen && (
            <div className="absolute left-0 z-10 mt-2 w-full overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-sm">
              <div className="max-h-64 overflow-auto py-1" role="listbox">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    categoryId === ''
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={categoryId === ''}
                >
                  Todos
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                      categoryId === cat.id
                        ? 'bg-gray-100 font-semibold text-indigo-600'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    role="option"
                    aria-selected={categoryId === cat.id}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="m-0 text-right text-xs text-gray-400">
          Pasá el cursor por cada indicador de estado para ver su significado.
          <br />
          Si alguno está deshabilitado, el item no se mostrará en la app.
        </p>
      </section>

      {error && list.length > 0 && <p className="m-0 text-sm text-red-600">{error}</p>}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col />
            <col className="w-[140px]" />
            <col className="w-[120px]" />
            <col className="w-[96px]" />
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
              const sellerDisplay = resolveSellerDisplay(item.sellerId, seller);
              const sellerBadge =
                item.status === 'ACTIVE'
                  ? SELLER_STATUS_BADGE.active
                  : SELLER_STATUS_BADGE.disabled;
              const blockedBadge = item.sellerBlocked
                ? SELLER_BLOCKED_BADGE.yes
                : SELLER_BLOCKED_BADGE.no;
              const adminBadge = item.adminDisabled
                ? ADMIN_STATUS_BADGE.disabled
                : ADMIN_STATUS_BADGE.enabled;
              return (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className={tdClass}>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-gray-900">{item.title}</span>
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
                  <td className={`${tdCompactClass} pr-0`}>
                    <div className="flex items-center justify-end gap-1">
                      <span
                        className={`${badgeClass} ${sellerBadge.className}`}
                        title="Estado vendedor: Indica si el vendedor tiene el item habilitado o no"
                      >
                        {sellerBadge.label}
                      </span>
                      <span
                        className={`${badgeClass} ${blockedBadge.className}`}
                        title="Vendedor bloqueado: Indica si el vendedor esta bloqueado"
                      >
                        {blockedBadge.label}
                      </span>
                      <span
                        className={`${badgeClass} ${adminBadge.className}`}
                        title="Estado admin: Indica si el item fue deshabilitado por un administrador"
                      >
                        {adminBadge.label}
                      </span>
                    </div>
                  </td>
                  <td className={`${tdCompactClass} pl-0 text-left whitespace-nowrap`}>
                    <Button
                      size="sm"
                      variant={item.adminDisabled ? 'outlinePrimary' : 'outlineDanger'}
                      fullWidth
                      className="px-3 truncate"
                      onClick={() => handleToggleAdminDisabled(item)}
                    >
                      {item.adminDisabled ? 'Rehabilitar' : 'Deshabilitar'}
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

      <section className="flex items-center justify-end gap-4">
        <Button
          size="sm"
          variant="outline"
          className="font-medium"
          disabled={currentPage === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Anterior
        </Button>
        <span className="text-sm text-gray-500">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="font-medium"
          disabled={currentPage === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente →
        </Button>
      </section>
    </div>
  );
}
