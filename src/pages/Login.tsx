import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BorderRadius, Colors, FontSize, Spacing } from '../theme';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate('/users');
  }

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.brand}>
            <img src="/bazaar.svg" alt="Bazaar" style={styles.brandLogo} />
            <span style={styles.brandSuffix}>Admin</span>
          </div>
          <p style={styles.subtitle}>Iniciá sesión para continuar</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    border: `1px solid ${Colors.border}`,
    padding: Spacing.xl,
    boxShadow: '0 1px 3px rgba(17, 24, 39, 0.04), 0 4px 12px rgba(17, 24, 39, 0.04)',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  brandLogo: {
    height: 32,
    width: 'auto',
    display: 'block',
  },
  brandSuffix: {
    fontSize: FontSize.xl,
    fontWeight: 700,
    color: '#453de0',
  },
  subtitle: {
    margin: 0,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.md,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    border: `1px solid ${Colors.border}`,
    borderRadius: BorderRadius.md,
    padding: `${Spacing.sm + 4}px ${Spacing.md}px`,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    outline: 'none',
  },
  button: {
    backgroundColor: Colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: BorderRadius.md,
    padding: `${Spacing.md}px`,
    fontSize: FontSize.md,
    fontWeight: 600,
    marginTop: Spacing.sm,
  },
};
