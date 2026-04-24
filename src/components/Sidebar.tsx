import { NavLink, useNavigate } from 'react-router-dom';
import Button from './Button';
import { BorderRadius, Colors, FontSize, Spacing } from '../theme';

const navItems = [
  { to: '/users', label: 'Usuarios' },
  { to: '/items', label: 'Items' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <img src="/bazaar.svg" alt="Bazaar" style={styles.brandLogo} />
        <span style={styles.brandSuffix}>Admin</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Button size="sm" variant="outline" style={styles.logout} onClick={() => navigate('/login')}>
        Cerrar sesión
      </Button>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 240,
    backgroundColor: Colors.surface,
    borderRight: `1px solid ${Colors.border}`,
    padding: Spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.lg,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottom: `1px solid ${Colors.border}`,
  },
  brandLogo: {
    height: 22,
    width: 'auto',
    display: 'block',
  },
  brandSuffix: {
    fontSize: FontSize.lg,
    fontWeight: 700,
    color: '#453de0',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.xs,
    flex: 1,
  },
  navItem: {
    display: 'block',
    padding: `${Spacing.sm + 2}px ${Spacing.md}px`,
    borderRadius: BorderRadius.md,
    fontSize: FontSize.md,
    fontWeight: 500,
    color: Colors.textSecondary,
    transition: 'background-color 120ms, color 120ms',
  },
  navItemActive: {
    backgroundColor: Colors.inputBackground,
    color: Colors.primary,
    fontWeight: 600,
  },
  logout: {
    fontWeight: 600,
    color: Colors.textSecondary,
  },
};
