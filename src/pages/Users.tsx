import { ChangeEvent, useMemo, useState } from 'react';
import { BorderRadius, Colors, FontSize, Spacing } from '../theme';
import { CURRENT_ADMIN_ID, User, UserStatus, users as initialUsers } from '../mocks';

const PAGE_SIZE = 8;

const STATUS_BADGE: Record<UserStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Activo', bg: '#D1FAE5', fg: '#047857' },
  blocked: { label: 'Bloqueado', bg: '#FEE2E2', fg: '#B91C1C' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Users() {
  const [list, setList] = useState<User[]>(initialUsers);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [list, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPage(1);
  }

  function toggleStatus(user: User) {
    if (user.id === CURRENT_ADMIN_ID) return;
    setList((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u,
      ),
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Usuarios</h1>
        <p style={styles.subtitle}>Administrá los usuarios de la plataforma.</p>
      </header>

      <section style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="Buscar por nombre o email..."
          value={query}
          onChange={handleSearch}
        />
        <span style={styles.count}>
          {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
        </span>
      </section>

      <section style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Fecha de registro</th>
              <th style={styles.th}>Estado</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((user) => {
              const badge = STATUS_BADGE[user.status];
              const isSelf = user.id === CURRENT_ADMIN_ID;
              return (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.name}</td>
                  <td style={{ ...styles.td, color: Colors.textSecondary }}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={user.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                      {user.role === 'admin' ? 'admin' : 'usuario'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: Colors.textSecondary }}>
                    {formatDate(user.registeredAt)}
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
                        ...(user.status === 'active'
                          ? styles.actionBtnDanger
                          : styles.actionBtnPrimary),
                        ...(isSelf ? styles.actionBtnDisabled : {}),
                      }}
                      disabled={isSelf}
                      title={isSelf ? 'No podés bloquear tu propia cuenta' : ''}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr>
                <td style={styles.empty} colSpan={6}>
                  No hay usuarios que coincidan con la búsqueda.
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
  search: {
    flex: 1,
    maxWidth: 360,
    backgroundColor: Colors.background,
    border: `1px solid ${Colors.border}`,
    borderRadius: BorderRadius.md,
    padding: `${Spacing.sm + 2}px ${Spacing.md}px`,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    outline: 'none',
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
  },
  roleAdmin: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: BorderRadius.sm,
    fontSize: 12,
    fontWeight: 600,
    color: Colors.primary,
    backgroundColor: '#EEF2FF',
    textTransform: 'capitalize',
  },
  roleUser: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: BorderRadius.sm,
    fontSize: 12,
    fontWeight: 500,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
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
  actionBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
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
