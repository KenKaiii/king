import { useDemoMode } from '@/hooks/useDemoMode';

/**
 * Pill-style switch that controls the global demo-mode flag. Persists in
 * localStorage via `useDemoMode` and stays in sync across every mounted copy
 * (header, page-level mirrors).
 *
 * `compact` variant drops the text label \u2014 used in the header where space is
 * tight; full variant shows "Demo data" beside the switch.
 */

interface DemoToggleProps {
  compact?: boolean;
  /** Optional className for outer wrapper. */
  className?: string;
}

export function DemoToggle({ compact = false, className }: DemoToggleProps) {
  const [on, setOn] = useDemoMode();

  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
        on
          ? 'border-[var(--base-color-brand--cinamon)]/50 bg-[var(--base-color-brand--cinamon)]/15 text-[var(--base-color-brand--cinamon)]'
          : 'border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--umber)] hover:bg-[var(--base-color-brand--champagne)]'
      } ${className ?? ''}`}
      title={
        on
          ? 'Demo data is ON \u2014 click to use real data'
          : 'Demo data is OFF \u2014 click to populate every dashboard with sample data'
      }
      aria-pressed={on}
      aria-label={on ? 'Disable demo data' : 'Enable demo data'}
      style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
    >
      <span
        aria-hidden="true"
        className={`relative inline-block h-3.5 w-7 rounded-full transition-colors ${
          on ? 'bg-[var(--base-color-brand--cinamon)]' : 'bg-[var(--base-color-brand--umber)]/40'
        }`}
      >
        <span
          className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${
            on ? 'left-3.5' : 'left-0.5'
          }`}
        />
      </span>
      {!compact && <span>Demo</span>}
    </button>
  );
}
