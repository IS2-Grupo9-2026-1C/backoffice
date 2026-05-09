import { ChangeEvent, useMemo, useState } from 'react';
import Button from '@/components/Button';
import { Item, ItemStatus, Seller, items as initialItems, sellers } from '@/mocks';

const PAGE_SIZE = 8;

type FiltroEstado = 'todos' | ItemStatus;

const STATUS_BADGE: Record<ItemStatus, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' },
  out_of_stock: { label: 'Sin stock', className: 'bg-gray-100 text-gray-600' },
  disabled_by_seller: {
    label: 'Deshabilitado por vendedor',
    className: 'bg-amber-100 text-amber-700',
  },
  disabled_by_admin: {
    label: 'Deshabilitado por admin',
    className: 'bg-red-100 text-red-700',
  },
};

const FILTER_OPTIONS: { value: FiltroEstado; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'out_of_stock', label: 'Sin stock' },
  { value: 'disabled_by_seller', label: 'Deshabilitados por vendedor' },
  { value: 'disabled_by_admin', label: 'Deshabilitados por admin' },
];

const thClass =
  'px-4 py-[10px] text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const tdClass = 'p-4 align-middle text-gray-900';
const badgeClass =
  'inline-block whitespace-nowrap px-[10px] py-1 rounded-full text-xs font-semibold';

function formatPrice(n: number): string {
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
}

export default function Items() {
  const [list, setList] = useState<Item[]>(initialItems);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [page, setPage] = useState(1);

  const sellersById = useMemo(() => {
    const m = new Map<string, Seller>();
    sellers.forEach((seller) => m.set(seller.id, seller));
    return m;
  }, []);

  const filtered = useMemo(() => {
    if (filtro === 'todos') return list;
    return list.filter((i) => i.status === filtro);
  }, [list, filtro]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleFilter(e: ChangeEvent<HTMLSelectElement>) {
    setFiltro(e.target.value as FiltroEstado);
    setPage(1);
  }

  function toggleAdminStatus(item: Item) {
    setList((prev) =>
      prev.map((x) => {
        if (x.id !== item.id) return x;
        const newStatus: ItemStatus =
          x.status === 'disabled_by_admin'
            ? x.stock === 0
              ? 'out_of_stock'
              : 'active'
            : 'disabled_by_admin';
        return { ...x, status: newStatus };
      }),
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 text-[32px] font-bold text-gray-900">Items</h1>
        <p className="m-0 text-base text-gray-500">Administrá los items de la plataforma.</p>
      </header>

      <section className="flex items-center gap-4">
        <select
          className="min-w-[240px] rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none"
          value={filtro}
          onChange={handleFilter}
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
        </span>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={thClass}>Nombre</th>
              <th className={thClass}>Vendedor</th>
              <th className={`${thClass} text-right`}>Precio</th>
              <th className={`${thClass} text-right`}>Stock</th>
              <th className={thClass}>Estado</th>
              <th className={`${thClass} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((item) => {
              const badge = STATUS_BADGE[item.status];
              const seller = sellersById.get(item.sellerId);
              const isDisabledByAdmin = item.status === 'disabled_by_admin';
              return (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className={tdClass}>{item.name}</td>
                  <td className={`${tdClass} text-gray-500`}>{seller?.name ?? '—'}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>
                    {formatPrice(item.price)}
                  </td>
                  <td
                    className={`${tdClass} text-right tabular-nums ${
                      item.stock === 0 ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {item.stock}
                  </td>
                  <td className={tdClass}>
                    <span className={`${badgeClass} ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Button
                      size="sm"
                      variant={isDisabledByAdmin ? 'outlinePrimary' : 'outlineDanger'}
                      onClick={() => toggleAdminStatus(item)}
                    >
                      {isDisabledByAdmin ? 'Rehabilitar' : 'Deshabilitar'}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={6}>
                  No hay items con ese estado.
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
