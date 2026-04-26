import { useState, type ReactNode } from 'react';
import { DeleteIcon } from '@/components/icons';

/**
 * Polymorphic API-key card. Each integration declares a config of one of three
 * shapes (`SimpleToken`, `OAuth`, `MultiField`); this component renders the
 * matching variant. Old behaviour for FB+fal is preserved via SimpleToken /
 * MultiField — variants kept narrow on purpose so adding a 7th platform is a
 * single config object, not another inline branch in `ApisPage`.
 */

interface BaseProps {
  name: string;
  description: string;
  keyUrl: string;
  keyUrlLabel: string;
  /** When true, render the connected/saved state and a delete button. */
  saved: boolean;
  savedSummary?: ReactNode;
  maskedKey?: string;
  onDelete: () => void;
  saving?: boolean;
}

// ------ Simple token --------------------------------------------------------

interface SimpleTokenProps extends BaseProps {
  variant: 'simpleToken';
  placeholder: string;
  /** Saves a single string. Resolves with the new masked key. */
  onSave: (value: string) => Promise<void>;
}

function SimpleTokenForm(props: SimpleTokenProps) {
  const [value, setValue] = useState('');
  return (
    <div className="mt-3 flex gap-2">
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={props.placeholder}
        className="min-w-0 flex-1 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
      />
      <button
        onClick={() => {
          const v = value.trim();
          if (!v) return;
          void props.onSave(v).then(() => setValue(''));
        }}
        disabled={!value.trim() || props.saving}
        className="shrink-0 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] transition-colors hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
        style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
      >
        {props.saving ? '...' : 'Save'}
      </button>
    </div>
  );
}

// ------ OAuth ---------------------------------------------------------------

interface OAuthProps extends BaseProps {
  variant: 'oauth';
  buttonLabel?: string;
  onConnect: () => Promise<void>;
}

function OAuthConnect(props: OAuthProps) {
  return (
    <div className="mt-3">
      <button
        onClick={() => void props.onConnect()}
        disabled={props.saving}
        className="w-full rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] transition-colors hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
        style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
      >
        {props.saving ? 'Opening browser…' : (props.buttonLabel ?? `Connect ${props.name}`)}
      </button>
    </div>
  );
}

// ------ Multi-field ---------------------------------------------------------

export interface MultiFieldDef {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'password';
  /** Optional hint shown under the input. */
  hint?: string;
}

interface MultiFieldProps extends BaseProps {
  variant: 'multiField';
  fields: MultiFieldDef[];
  buttonLabel?: string;
  onSave: (values: Record<string, string>) => Promise<void>;
  /** Optional helper text shown above the buttons. */
  footnote?: string;
  /** Optional alternative "Connect via OAuth" button rendered next to Save. */
  oauthButton?: { label: string; onConnect: () => Promise<void> };
}

function MultiFieldForm(props: MultiFieldProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const allRequiredFilled = props.fields.every((f) =>
    f.required === false ? true : (values[f.key] ?? '').trim().length > 0,
  );

  return (
    <div className="mt-3 flex flex-col gap-2">
      {props.fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <input
            type={field.type ?? 'password'}
            value={values[field.key] ?? ''}
            onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className="min-w-0 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
          />
          {field.hint && (
            <span className="px-1 text-[10px] leading-tight text-[var(--base-color-brand--umber)]">
              {field.hint}
            </span>
          )}
        </div>
      ))}
      {props.footnote && (
        <p className="px-1 text-[10px] leading-tight text-[var(--base-color-brand--umber)]">
          {props.footnote}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        {props.oauthButton && (
          <button
            onClick={() => void props.oauthButton!.onConnect()}
            disabled={props.saving}
            className="rounded-full border border-[var(--base-color-brand--umber)]/40 bg-transparent px-3 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--bean)] transition-colors hover:bg-[var(--base-color-brand--shell)] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            {props.oauthButton.label}
          </button>
        )}
        <button
          onClick={() => {
            if (!allRequiredFilled) return;
            void props.onSave(values).then(() => setValues({}));
          }}
          disabled={!allRequiredFilled || props.saving}
          className="rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] transition-colors hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
          style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
        >
          {props.saving ? 'Connecting…' : (props.buttonLabel ?? 'Connect')}
        </button>
      </div>
    </div>
  );
}

// ------ Outer wrapper -------------------------------------------------------

export type ServiceCardProps = SimpleTokenProps | OAuthProps | MultiFieldProps;

export function ServiceCard(props: ServiceCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {props.name}
            </h3>
            <button
              onClick={() => window.api.shell.openExternal(props.keyUrl)}
              className="cursor-pointer text-xs font-semibold text-[var(--base-color-brand--cinamon)] transition-colors hover:text-[var(--base-color-brand--red)]"
            >
              {props.keyUrlLabel} &rarr;
            </button>
          </div>
          <p className="text-xs text-[var(--base-color-brand--umber)]">{props.description}</p>
        </div>
        {props.saved && (
          <button
            onClick={props.onDelete}
            className="grid h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--dark-red)] hover:text-[var(--base-color-brand--shell)]"
            title="Remove"
          >
            <DeleteIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {props.saved ? (
        <div className="mt-3 flex flex-col gap-1">
          <div className="rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] px-4 py-2">
            <code className="text-xs text-[var(--base-color-brand--umber)]">
              {props.maskedKey ?? 'Connected'}
            </code>
          </div>
          {props.savedSummary && (
            <span className="px-1 text-[10px] text-[var(--base-color-brand--umber)]">
              {props.savedSummary}
            </span>
          )}
        </div>
      ) : props.variant === 'simpleToken' ? (
        <SimpleTokenForm {...props} />
      ) : props.variant === 'oauth' ? (
        <OAuthConnect {...props} />
      ) : (
        <MultiFieldForm {...props} />
      )}
    </div>
  );
}
