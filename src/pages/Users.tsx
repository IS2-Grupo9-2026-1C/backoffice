import { ChangeEvent, useEffect, useState } from 'react';
import Button from '@/components/Button';
import { blockUser, listUsers, unblockUser, UserListItem } from '@/services/users';

type UserStatus = 'active' | 'blocked';

const PAGE_SIZE = 8;

const STATUS_BADGE: Record<UserStatus, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' },
  blocked: { label: 'Bloqueado', className: 'bg-red-100 text-red-700' },
};

const thClass =
  'px-4 py-[10px] text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500 bg-gray-50 border-b border-gray-200';
const tdClass = 'p-4 align-middle text-gray-900';
const badgeClass = 'inline-block px-[10px] py-1 rounded-full text-xs font-semibold';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Users() {
  const [list, setList] = useState<UserListItem[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const timer = setTimeout(() => {
      setLoading(true);
      listUsers({
        page,
        size: PAGE_SIZE,
        search: query.trim() || undefined,
      })
        .then((response) => {
          if (cancelled) return;
          setList(response.data);
          setTotal(response.meta.total);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, query]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) setPage(1);
  }, [total]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPage(1);
  }

  function setPending(userId: number, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }

  async function toggleStatus(user: UserListItem) {
    setError(null);
    setPending(user.id, true);
    try {
      if (user.isActive) {
        await blockUser(user.id);
      } else {
        await unblockUser(user.id);
      }
      setList((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario');
    } finally {
      setPending(user.id, false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 text-[32px] font-bold text-gray-900">Usuarios</h1>
        <p className="m-0 text-base text-gray-500">Administrá los usuarios de la plataforma.</p>
      </header>

      <section className="flex items-center gap-4">
        <input
          className="flex-1 max-w-[360px] rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none"
          placeholder="Buscar por nombre o email..."
          value={query}
          onChange={handleSearch}
        />
        <span className="text-sm text-gray-500">
          {total} resultado{total === 1 ? '' : 's'}
        </span>
        {loading && <span className="text-sm text-gray-400">Cargando...</span>}
      </section>

      {error && list.length > 0 && <p className="m-0 text-sm text-red-600">{error}</p>}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col />
            <col />
            <col className="w-[140px]" />
            <col className="w-[120px]" />
            <col className="w-[140px]" />
          </colgroup>
          <thead>
            <tr>
              <th className={thClass}>Nombre</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Fecha de registro</th>
              <th className={thClass}>Estado</th>
              <th className={`${thClass} text-right`}></th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => {
              const status: UserStatus = user.isActive ? 'active' : 'blocked';
              const badge = STATUS_BADGE[status];
              const isPending = pendingIds.has(user.id);
              const fullName = `${user.firstName} ${user.lastName}`.trim();
              return (
                <tr key={user.id} className="border-b border-gray-200">
                  <td className={tdClass}>
                    <div className="max-w-[320px] truncate">{fullName}</div>
                  </td>
                  <td className={tdClass}>
                    <div className="max-w-[320px] truncate text-gray-500">{user.email}</div>
                  </td>
                  <td className={`${tdClass} text-gray-500`}>{formatDate(user.createdAt)}</td>
                  <td className={tdClass}>
                    <span className={`${badgeClass} ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Button
                      size="sm"
                      variant={user.isActive ? 'outlineDanger' : 'outlinePrimary'}
                      disabled={isPending}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.isActive ? 'Bloquear' : 'Desbloquear'}
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
                  No hay usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            )}
            {loading && list.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={5}>
                  Cargando usuarios...
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
