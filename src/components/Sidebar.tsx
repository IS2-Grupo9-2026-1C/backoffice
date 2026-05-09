import { NavLink, useNavigate } from 'react-router-dom';
import Button from '@/components/Button';

const navItems = [
  { to: '/users', label: 'Usuarios' },
  { to: '/items', label: 'Items' },
];

const navItemBase =
  'block px-4 py-[10px] rounded-[10px] text-base font-medium text-gray-500 transition-[background-color,color] duration-[120ms]';
const navItemActive = 'bg-gray-100 text-indigo-600 font-semibold';

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="flex w-60 flex-col gap-6 border-r border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
        <img src="/bazaar.svg" alt="Bazaar" className="block h-[22px] w-auto" />
        <span className="text-lg font-bold text-[#453de0]">Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Button
        size="sm"
        variant="outline"
        className="font-semibold text-gray-500"
        onClick={() => navigate('/login')}
      >
        Cerrar sesión
      </Button>
    </aside>
  );
}
