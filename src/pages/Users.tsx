import { ChangeEvent, useMemo, useState } from 'react';
import Button from '@/components/Button';
import { CURRENT_ADMIN_ID, User, UserStatus, users as initialUsers } from '@/mocks';

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
          {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
        </span>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={thClass}>Nombre</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Rol</th>
              <th className={thClass}>Fecha de registro</th>
              <th className={thClass}>Estado</th>
              <th className={`${thClass} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((user) => {
              const badge = STATUS_BADGE[user.status];
              const isSelf = user.id === CURRENT_ADMIN_ID;
              return (
                <tr key={user.id} className="border-b border-gray-200">
                  <td className={tdClass}>{user.name}</td>
                  <td className={`${tdClass} text-gray-500`}>{user.email}</td>
                  <td className={tdClass}>
                    <span
                      className={
                        user.role === 'admin'
                          ? 'inline-block rounded-md bg-[#EEF2FF] px-2 py-[2px] text-xs font-semibold capitalize text-indigo-600'
                          : 'inline-block rounded-md px-2 py-[2px] text-xs font-medium capitalize text-gray-500'
                      }
                    >
                      {user.role === 'admin' ? 'admin' : 'usuario'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-gray-500`}>{formatDate(user.registeredAt)}</td>
                  <td className={tdClass}>
                    <span className={`${badgeClass} ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Button
                      size="sm"
                      variant={user.status === 'active' ? 'outlineDanger' : 'outlinePrimary'}
                      disabled={isSelf}
                      title={isSelf ? 'No podés bloquear tu propia cuenta' : ''}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={6}>
                  No hay usuarios que coincidan con la búsqueda.
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
