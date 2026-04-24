import { ButtonHTMLAttributes, CSSProperties } from 'react';
import { BorderRadius, Colors, FontSize, Spacing } from '@/theme';

type ButtonVariant = 'primary' | 'outline' | 'outlinePrimary' | 'outlineDanger';
type ButtonSize = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export default function Button({
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  style,
  type = 'button',
  ...rest
}: Props) {
  const mergedStyle: CSSProperties = {
    ...styles.base,
    ...styles.bySize[size],
    ...styles.byVariant[variant],
    ...(fullWidth ? styles.fullWidth : {}),
    ...(rest.disabled ? styles.disabled : {}),
    ...style,
  };

  return <button type={type} style={mergedStyle} {...rest} />;
}

const styles: {
  base: CSSProperties;
  fullWidth: CSSProperties;
  disabled: CSSProperties;
  bySize: Record<ButtonSize, CSSProperties>;
  byVariant: Record<ButtonVariant, CSSProperties>;
} = {
  base: {
    border: '1px solid transparent',
    borderRadius: BorderRadius.md,
    fontWeight: 600,
    transition: 'opacity 120ms, background-color 120ms, color 120ms, border-color 120ms',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  bySize: {
    sm: {
      padding: `${Spacing.sm}px ${Spacing.md}px`,
      fontSize: FontSize.sm,
    },
    md: {
      padding: `${Spacing.md}px`,
      fontSize: FontSize.md,
    },
  },
  byVariant: {
    primary: {
      backgroundColor: Colors.primary,
      color: '#FFFFFF',
      borderColor: Colors.primary,
    },
    outline: {
      backgroundColor: Colors.surface,
      color: Colors.textPrimary,
      borderColor: Colors.border,
    },
    outlinePrimary: {
      backgroundColor: 'transparent',
      color: Colors.primary,
      borderColor: Colors.primary,
    },
    outlineDanger: {
      backgroundColor: 'transparent',
      color: Colors.error,
      borderColor: Colors.error,
    },
  },
};
