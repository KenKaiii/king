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
            <h2 className="text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
              Store <span className="text-teal-400">Connections</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-300">
              Connect your e-commerce stores to sync products and orders.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.name}
              className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-8 text-center"
            >
              <h3 className="text-lg font-bold tracking-wide text-white uppercase">
                {store.name} <span className="text-teal-400">Store</span>
              </h3>
              <p className="text-sm text-zinc-300">{store.description}</p>
              <span className="mt-1 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-400">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
