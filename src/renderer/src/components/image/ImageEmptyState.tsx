export default function ImageEmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <h2
          className="text-center text-3xl font-bold text-[var(--base-color-brand--bean)]"
          style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
        >
          Nothing Here Yet
        </h2>
        <p className="text-center text-sm text-[var(--base-color-brand--umber)]">
          Type something below and hit generate
        </p>
      </div>
    </div>
  );
}
