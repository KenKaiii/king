const stores = [
  {
    name: 'Shopee',
    description: 'Sync products, orders, and inventory from your Shopee store.',
  },
  {
    name: 'Amazon',
    description: 'Sync products, orders, and inventory from your Amazon store.',
  },
  {
    name: 'Shopify',
    description: 'Sync products, orders, and inventory from your Shopify store.',
  },
];

export default function StorePage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 pt-8 pb-8 md:px-10">
        <section className="flex flex-col gap-3">
          <div>
            <h2
              className="text-4xl font-bold tracking-tight text-[var(--base-color-brand--bean)] sm:text-5xl"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              Store <span className="text-[var(--base-color-brand--cinamon)]">Connections</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--base-color-brand--umber)]">
              Connect your e-commerce stores to sync products and orders.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.name}
              className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-8 text-center"
            >
              <h3
                className="text-lg font-bold tracking-wide text-[var(--base-color-brand--bean)]"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                {store.name} <span className="text-[var(--base-color-brand--cinamon)]">Store</span>
              </h3>
              <p className="text-sm text-[var(--base-color-brand--umber)]">{store.description}</p>
              <span className="mt-1 rounded-full border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--shell)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--base-color-brand--umber)]">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
