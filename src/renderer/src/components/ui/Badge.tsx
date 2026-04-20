import { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
  className?: string;
}

/**
 * Small pill-shaped badge for labelling thumbnails, cards, and chips.
 * Styled to match the brand aesthetic (champagne/bean palette).
 */
export default memo(function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses =
    variant === 'subtle'
      ? 'bg-[var(--base-color-brand--shell)]/85 text-[var(--base-color-brand--bean)] border-[var(--base-color-brand--umber)]/30'
      : 'bg-[var(--base-color-brand--bean)]/85 text-[var(--base-color-brand--shell)] border-[var(--base-color-brand--shell)]/20';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm ${variantClasses} ${className}`}
      style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
    >
      {children}
    </span>
  );
});
