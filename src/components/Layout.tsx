import { Outlet } from 'react-router-dom';
import { Colors } from '@/theme';
import Sidebar from '@/components/Sidebar';

export default function Layout() {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: Colors.background,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
  },
};
