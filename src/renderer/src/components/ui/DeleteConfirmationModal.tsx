interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ willChange: 'opacity' }}
    >
      <div
        className={`absolute inset-0 bg-[var(--base-color-brand--bean)]/60 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onCancel}
      />
      <div
        className={`relative z-10 w-full max-w-sm rounded-3xl border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] p-6 shadow-2xl transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <h3
          className="text-lg font-semibold text-[var(--base-color-brand--bean)]"
          style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
        >
          {title}
        </h3>
        <p className="mt-2 text-sm text-[var(--base-color-brand--umber)]">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-[var(--base-color-brand--umber)]/60 bg-[var(--base-color-brand--shell)] px-4 py-2 text-sm font-semibold text-[var(--base-color-brand--bean)] transition-colors hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full border-none bg-[var(--base-color-brand--red)] px-4 py-2 text-sm font-semibold text-[var(--base-color-brand--shell)] shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] transition-all hover:bg-[var(--base-color-brand--dark-red)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--base-color-brand--dark-red)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
