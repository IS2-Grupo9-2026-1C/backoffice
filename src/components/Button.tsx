import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'outlinePrimary' | 'outlineDanger';
type ButtonSize = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const base =
  'border border-transparent rounded-[10px] font-semibold transition-[opacity,background-color,color,border-color] duration-[120ms] disabled:opacity-40 disabled:cursor-not-allowed';

const bySize: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'p-4 text-base',
};

const byVariant: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white border-indigo-600',
  outline: 'bg-white text-gray-900 border-gray-200',
  outlinePrimary: 'bg-transparent text-indigo-600 border-indigo-600',
  outlineDanger: 'bg-transparent text-red-600 border-red-600',
};

export default function Button({
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: Props) {
  const merged = [
    base,
    bySize[size],
    byVariant[variant],
    fullWidth ? 'w-full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={merged} {...rest} />;
}
