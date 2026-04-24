import { ChangeEvent, useMemo, useState } from 'react';
import { BorderRadius, Colors, FontSize, Spacing } from '../theme';
import { Item, ItemStatus, User, items as initialItems, users } from '../mocks';

const PAGE_SIZE = 8;

type FiltroEstado = 'todos' | ItemStatus;

const STATUS_BADGE: Record<ItemStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Activo', bg: '#D1FAE5', fg: '#047857' },
  out_of_stock: { label: 'Sin stock', bg: '#F3F4F6', fg: '#4B5563' },
  disabled_by_seller: {
    label: 'Deshabilitado por vendedor',
    bg: '#FEF3C7',
    fg: '#B45309',
  },
  disabled_by_admin: {
    label: 'Deshabilitado por admin',
    bg: '#FEE2E2',
    fg: '#B91C1C',
  },
};

const FILTER_OPTIONS: { value: FiltroEstado; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'out_of_stock', label: 'Sin stock' },
  { value: 'disabled_by_seller', label: 'Deshabilitados por vendedor' },
  { value: 'disabled_by_admin', label: 'Deshabilitados por admin' },
];

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
    const m = new Map<string, User>();
    users.forEach((u) => m.set(u.id, u));
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
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Items</h1>
        <p style={styles.subtitle}>Administrá los items de la plataforma.</p>
      </header>

      <section style={styles.toolbar}>
        <select style={styles.filter} value={filtro} onChange={handleFilter}>
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span style={styles.count}>
          {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
        </span>
      </section>

      <section style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Vendedor</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Precio</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Stock</th>
              <th style={styles.th}>Estado</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((item) => {
              const badge = STATUS_BADGE[item.status];
              const seller = sellersById.get(item.sellerId);
              const isDisabledByAdmin = item.status === 'disabled_by_admin';
              return (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={{ ...styles.td, color: Colors.textSecondary }}>
                    {seller?.name ?? '—'}
                  </td>
                  <td
                    style={{ ...styles.td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatPrice(item.price)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: 'right',
                      color: item.stock === 0 ? Colors.textSecondary : Colors.textPrimary,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.stock}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: badge.bg, color: badge.fg }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <button
                      style={{
                        ...styles.actionBtn,
                        ...(isDisabledByAdmin ? styles.actionBtnPrimary : styles.actionBtnDanger),
                      }}
                      onClick={() => toggleAdminStatus(item)}
                    >
                      {isDisabledByAdmin ? 'Rehabilitar' : 'Deshabilitar'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr>
                <td style={styles.empty} colSpan={6}>
                  No hay items con ese estado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section style={styles.pagination}>
        <button
          style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {}) }}
          disabled={currentPage === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Anterior
        </button>
        <span style={styles.pageInfo}>
          Página {currentPage} de {totalPages}
        </span>
        <button
          style={{
            ...styles.pageBtn,
            ...(currentPage === totalPages ? styles.pageBtnDisabled : {}),
          }}
          disabled={currentPage === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente →
        </button>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: Spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.lg,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  title: {
    margin: 0,
    fontSize: FontSize.xxl,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  subtitle: {
    margin: 0,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: Spacing.md,
  },
  filter: {
    backgroundColor: Colors.background,
    border: `1px solid ${Colors.border}`,
    borderRadius: BorderRadius.md,
    padding: `${Spacing.sm + 2}px ${Spacing.md}px`,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    outline: 'none',
    minWidth: 240,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  tableWrapper: {
    backgroundColor: Colors.surface,
    border: `1px solid ${Colors.border}`,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: FontSize.sm,
  },
  th: {
    textAlign: 'left',
    padding: `${Spacing.sm + 2}px ${Spacing.md}px`,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    borderBottom: `1px solid ${Colors.border}`,
  },
  tr: {
    borderBottom: `1px solid ${Colors.border}`,
  },
  td: {
    padding: `${Spacing.md}px`,
    color: Colors.textPrimary,
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  actionBtn: {
    border: '1px solid transparent',
    borderRadius: BorderRadius.sm,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    backgroundColor: 'transparent',
  },
  actionBtnPrimary: {
    color: Colors.primary,
    borderColor: Colors.primary,
  },
  actionBtnDanger: {
    color: Colors.error,
    borderColor: Colors.error,
  },
  empty: {
    padding: Spacing.xl,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  pageBtn: {
    backgroundColor: Colors.surface,
    border: `1px solid ${Colors.border}`,
    borderRadius: BorderRadius.md,
    padding: `${Spacing.sm}px ${Spacing.md}px`,
    fontSize: FontSize.sm,
    fontWeight: 500,
    color: Colors.textPrimary,
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
};
