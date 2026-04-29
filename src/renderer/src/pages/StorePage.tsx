import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';
import { RefreshIcon } from '@/components/icons';
import { useDemoMode } from '@/hooks/useDemoMode';
import type { PageType } from '@/App';
import { shopifyDemo, shopeeDemo, tiktokDemo, amazonDemo } from '@/lib/mock/storeData';
import { cleanIpcError } from '@/lib/ipcError';

/**
 * Demo mode is controlled globally via the `useDemoMode` hook (master toggle
 * lives in the Header). When enabled, every platform section is force-
 * rendered as `connected` with mock products + orders, regardless of the real
 * connection state. We deliberately do NOT call into the real IPC clients in
 * demo mode, so the screen renders instantly and works fully offline.
 */

function formatRelativeDateInternal(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor(diffMs / day);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Build the four PlatformState objects from the static demo fixtures. */
function demoStates(): {
  shopify: PlatformState;
  tiktok: PlatformState;
  shopee: PlatformState;
  amazon: PlatformState;
} {
  return {
    shopify: {
      connected: true,
      identity: `${shopifyDemo.identity.shopName} · ${shopifyDemo.identity.currency}`,
      loading: false,
      products: shopifyDemo.products.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.vendor,
        status: p.status,
        image: p.image,
      })),
      orders: shopifyDemo.orders.map((o) => ({
        id: o.id,
        label: o.name,
        total: `${o.total} ${o.currency}`.trim(),
        date: formatRelativeDateInternal(o.createdAt),
      })),
    },
    tiktok: {
      connected: true,
      identity: tiktokDemo.identity.shopName,
      loading: false,
      products: tiktokDemo.products.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        price: p.price,
        image: p.image,
      })),
      orders: tiktokDemo.orders.map((o) => ({
        id: o.id,
        label: `Order ${o.id}`,
        status: o.status,
        total: o.total,
        date: formatRelativeDateInternal(o.createdAt),
      })),
    },
    shopee: {
      connected: true,
      identity: `Shop ${shopeeDemo.identity.shopId}`,
      loading: false,
      products: shopeeDemo.products.map((p) => ({
        id: String(p.id),
        title: p.name,
        status: typeof p.stock === 'number' ? `${p.stock} in stock` : undefined,
        price: typeof p.price === 'number' ? p.price.toFixed(2) : undefined,
        image: p.image,
      })),
      orders: shopeeDemo.orders.map((o) => ({
        id: o.id,
        label: `Order ${o.id}`,
        status: o.status,
        total: o.total,
        date: formatRelativeDateInternal(o.createdAt),
      })),
    },
    amazon: {
      connected: true,
      identity: `Seller ${amazonDemo.identity.sellingPartnerId}`,
      loading: false,
      products: amazonDemo.catalog.map((i) => ({
        id: i.asin,
        title: i.title ?? i.asin,
        subtitle: i.brand,
      })),
      orders: amazonDemo.orders.map((o) => ({
        id: o.id,
        label: `Order ${o.id}`,
        status: o.status,
        total: o.total,
        date: formatRelativeDateInternal(o.purchasedAt),
      })),
    },
  };
}

/**
 * Unified store dashboard.
 *
 * Per the product flow (product → AI image → ad), the user's first question on
 * this page is "what's in my stores?" — not "what's the API status?". So for
 * every connected platform we render a Products grid (the input to ad
 * creation) plus a Recent Orders strip (so they know what's selling and worth
 * advertising more of).
 *
 * Each platform section is independent: failures in one don't blank the others.
 */

interface ProductRow {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  price?: string;
  image?: string;
}

interface OrderRow {
  id: string;
  label: string;
  total?: string;
  status?: string;
  date?: string;
}

interface PlatformState {
  /** null = still loading, false = not connected, true = connected. */
  connected: boolean | null;
  identity?: string;
  products: ProductRow[];
  orders: OrderRow[];
  loading: boolean;
  error?: string;
}

const EMPTY: PlatformState = {
  connected: null,
  products: [],
  orders: [],
  loading: false,
};

interface StorePageProps {
  onNavigate: (page: PageType) => void;
}

// ------ Section ----------------------------------------------------------

interface PlatformSectionProps {
  name: string;
  accent: string;
  state: PlatformState;
  emptyHint: string;
  onConnect: () => void;
  onRefresh?: () => void;
}

function PlatformSection({
  name,
  accent,
  state,
  emptyHint,
  onConnect,
  onRefresh,
}: PlatformSectionProps) {
  const headingHtml = (
    <h3
      className="text-2xl font-bold tracking-tight text-[var(--base-color-brand--bean)] sm:text-3xl"
      style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
    >
      {name} <span className="text-[var(--base-color-brand--cinamon)]">{accent}</span>
    </h3>
  );

  // Loading shimmer (initial fetch).
  if (state.connected === null) {
    return (
      <section className="flex flex-col gap-4 rounded-3xl border border-[var(--base-color-brand--umber)]/20 bg-[var(--base-color-brand--champagne)]/40 p-6">
        <div className="flex items-baseline justify-between">
          {headingHtml}
          <span className="text-xs text-[var(--base-color-brand--umber)]/60">Checking…</span>
        </div>
      </section>
    );
  }

  // Disconnected: connect CTA.
  if (!state.connected) {
    return (
      <section className="flex flex-col gap-4 rounded-3xl border border-dashed border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)]/40 p-6">
        <div className="flex items-baseline justify-between">
          {headingHtml}
          <span className="text-xs text-[var(--base-color-brand--umber)]">Not connected</span>
        </div>
        <p className="text-sm text-[var(--base-color-brand--umber)]">{emptyHint}</p>
        <button onClick={onConnect} className="btn-cinamon btn-sm self-start">
          Connect {name}
        </button>
      </section>
    );
  }

  // Connected.
  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          {headingHtml}
          {state.identity && (
            <span className="text-xs text-[var(--base-color-brand--umber)]">{state.identity}</span>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--base-color-brand--umber)]/30 text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
            title="Refresh"
            disabled={state.loading}
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {state.error && (
        <p className="rounded-2xl border border-[var(--status--error)]/30 bg-[var(--status--error)]/10 px-4 py-2 text-xs text-[var(--status--error)]">
          {state.error}
        </p>
      )}

      {/* Products */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h4 className="text-sm font-semibold tracking-wide text-[var(--base-color-brand--bean)]">
            Products
          </h4>
          <span className="text-xs text-[var(--base-color-brand--umber)]">
            {state.loading
              ? 'Loading…'
              : `${state.products.length} ${state.products.length === 1 ? 'item' : 'items'}`}
          </span>
        </div>
        {state.loading && state.products.length === 0 ? (
          <ProductSkeleton />
        ) : state.products.length === 0 ? (
          <p className="text-sm text-[var(--base-color-brand--umber)]/80">
            No products in this store.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.products.slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {state.products.length > 12 && (
          <span className="text-xs text-[var(--base-color-brand--umber)]/70">
            Showing 12 of {state.products.length}.
          </span>
        )}
      </div>

      {/* Recent orders */}
      {state.orders.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold tracking-wide text-[var(--base-color-brand--bean)]">
            Recent orders
          </h4>
          <div className="flex flex-col divide-y divide-[var(--base-color-brand--umber)]/15 rounded-2xl border border-[var(--base-color-brand--umber)]/20 bg-[var(--base-color-brand--shell)]">
            {state.orders.slice(0, 6).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: ProductRow }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--base-color-brand--umber)]/20 bg-[var(--base-color-brand--shell)] p-3">
      {product.image ? (
        <img
          src={product.image}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--base-color-brand--champagne)] text-[10px] font-semibold tracking-wide text-[var(--base-color-brand--umber)]/60 uppercase">
          No img
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--base-color-brand--bean)]">
          {product.title}
        </p>
        <p className="truncate text-xs text-[var(--base-color-brand--umber)]">
          {[product.subtitle, product.status, product.price].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: OrderRow }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--base-color-brand--bean)]">
          {order.label}
        </p>
        {order.date && (
          <p className="truncate text-xs text-[var(--base-color-brand--umber)]">{order.date}</p>
        )}
      </div>
      {order.status && (
        <span className="rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--base-color-brand--umber)]">
          {order.status}
        </span>
      )}
      {order.total && (
        <span className="shrink-0 text-sm font-semibold text-[var(--base-color-brand--bean)]">
          {order.total}
        </span>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-[var(--base-color-brand--umber)]/15 bg-[var(--base-color-brand--shell)] p-3"
        >
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-[var(--base-color-brand--champagne)]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-[var(--base-color-brand--champagne)]" />
            <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-[var(--base-color-brand--champagne)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ------ Page -------------------------------------------------------------

// Re-exported under the original name so existing callers below stay unchanged.
const formatRelativeDate = formatRelativeDateInternal;

export default function StorePage({ onNavigate }: StorePageProps) {
  const [demoMode] = useDemoMode();
  const [shopify, setShopify] = useState<PlatformState>(EMPTY);
  const [shopee, setShopee] = useState<PlatformState>(EMPTY);
  const [tiktok, setTiktok] = useState<PlatformState>(EMPTY);
  const [amazon, setAmazon] = useState<PlatformState>(EMPTY);
  const [lastSynced, setLastSynced] = useState<Date>(() => new Date());

  // ---- Per-platform fetchers ----

  const loadShopify = useCallback(async () => {
    if (!window.api.shopify) {
      setShopify({ ...EMPTY, connected: false });
      return;
    }
    setShopify((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const status = await window.api.shopify.status();
      if (!status.connected) {
        setShopify({ ...EMPTY, connected: false });
        return;
      }
      const [products, orders] = await Promise.all([
        window.api.shopify.listProducts(50).catch(() => []),
        window.api.shopify.listOrders(20).catch(() => []),
      ]);
      setShopify({
        connected: true,
        identity: status.shop?.shopName
          ? `${status.shop.shopName}${status.shop.currency ? ` · ${status.shop.currency}` : ''}`
          : status.shopDomain,
        loading: false,
        products: products.map((p) => ({
          id: p.id,
          title: p.title,
          subtitle: p.vendor,
          status: p.status,
          image: p.image,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          label: o.name,
          total: `${o.total} ${o.currency}`.trim(),
          date: formatRelativeDate(o.createdAt),
        })),
      });
    } catch (err) {
      setShopify((s) => ({
        ...s,
        connected: true,
        loading: false,
        error: cleanIpcError(err, 'Failed to load Shopify data'),
      }));
    }
  }, []);

  const loadShopee = useCallback(async () => {
    if (!window.api.shopee) {
      setShopee({ ...EMPTY, connected: false });
      return;
    }
    setShopee((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const status = await window.api.shopee.status();
      if (!status.connected) {
        setShopee({ ...EMPTY, connected: false });
        return;
      }
      const [products, orders] = await Promise.all([
        window.api.shopee.listProducts().catch(() => []),
        window.api.shopee.listOrders().catch(() => []),
      ]);
      setShopee({
        connected: true,
        identity: status.shopId ? `Shop ${status.shopId}` : undefined,
        loading: false,
        products: products.map((p) => ({
          id: String(p.id),
          title: p.name,
          status: typeof p.stock === 'number' ? `${p.stock} in stock` : undefined,
          price: typeof p.price === 'number' ? p.price.toFixed(2) : undefined,
          image: p.image,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          label: `Order ${o.id}`,
          status: o.status,
          total: o.total,
          date: formatRelativeDate(o.createdAt),
        })),
      });
    } catch (err) {
      setShopee((s) => ({
        ...s,
        connected: true,
        loading: false,
        error: cleanIpcError(err, 'Failed to load Shopee data'),
      }));
    }
  }, []);

  const loadTiktok = useCallback(async () => {
    if (!window.api.tiktokShop) {
      setTiktok({ ...EMPTY, connected: false });
      return;
    }
    setTiktok((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const status = await window.api.tiktokShop.status();
      if (!status.connected) {
        setTiktok({ ...EMPTY, connected: false });
        return;
      }
      const [products, orders] = await Promise.all([
        window.api.tiktokShop.listProducts().catch(() => []),
        window.api.tiktokShop.listOrders().catch(() => []),
      ]);
      setTiktok({
        connected: true,
        identity: status.shopName ?? (status.shopId ? `Shop ${status.shopId}` : undefined),
        loading: false,
        products: products.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          price: p.price,
          image: p.image,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          label: `Order ${o.id}`,
          status: o.status,
          total: o.total,
          date: formatRelativeDate(o.createdAt),
        })),
      });
    } catch (err) {
      setTiktok((s) => ({
        ...s,
        connected: true,
        loading: false,
        error: cleanIpcError(err, 'Failed to load TikTok Shop data'),
      }));
    }
  }, []);

  const loadAmazon = useCallback(async () => {
    if (!window.api.amazon) {
      setAmazon({ ...EMPTY, connected: false });
      return;
    }
    setAmazon((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const status = await window.api.amazon.status();
      if (!status.connected) {
        setAmazon({ ...EMPTY, connected: false });
        return;
      }
      const [items, orders] = await Promise.all([
        window.api.amazon.listCatalogItems().catch(() => []),
        window.api.amazon.listOrders().catch(() => []),
      ]);
      setAmazon({
        connected: true,
        identity: status.sellingPartnerId ? `Seller ${status.sellingPartnerId}` : undefined,
        loading: false,
        products: items.map((i) => ({
          id: i.asin,
          title: i.title ?? i.asin,
          subtitle: i.brand,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          label: `Order ${o.id}`,
          status: o.status,
          total: o.total,
          date: formatRelativeDate(o.purchasedAt),
        })),
      });
    } catch (err) {
      setAmazon((s) => ({
        ...s,
        connected: true,
        loading: false,
        error: cleanIpcError(err, 'Failed to load Amazon data'),
      }));
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadShopify(), loadShopee(), loadTiktok(), loadAmazon()]);
    setLastSynced(new Date());
  }, [loadShopify, loadShopee, loadTiktok, loadAmazon]);

  useEffect(() => {
    if (demoMode) return; // Demo overlays the real state — no need to fetch.
    void loadAll();
  }, [loadAll, demoMode]);

  const handleRefreshAll = async () => {
    if (demoMode) {
      setLastSynced(new Date());
      toast.success('Demo data refreshed');
      return;
    }
    await loadAll();
    toast.success('Stores refreshed');
  };

  // When demoMode is on, swap each platform's real state for fixtures. The
  // real state objects above stay around so flipping the toggle off restores
  // them instantly without a re-fetch.
  const view = demoMode ? demoStates() : { shopify, tiktok, shopee, amazon };

  // ---- Top-line counts (only across connected stores) ----

  const connectedCount = [view.shopify, view.shopee, view.tiktok, view.amazon].filter(
    (s) => s.connected,
  ).length;
  const totalProducts =
    view.shopify.products.length +
    view.shopee.products.length +
    view.tiktok.products.length +
    view.amazon.products.length;
  const recentOrderCount =
    view.shopify.orders.length +
    view.shopee.orders.length +
    view.tiktok.orders.length +
    view.amazon.orders.length;

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 pt-8 pb-8 md:px-10">
        {/* Header */}
        <section className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-4xl font-bold tracking-tight text-[var(--base-color-brand--bean)] sm:text-5xl"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                Your <span className="text-[var(--base-color-brand--cinamon)]">Inventory</span>
              </h2>
              <p className="mt-2 text-sm text-[var(--base-color-brand--umber)]">
                Products and recent orders across every connected store. Pick what to advertise
                next.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--base-color-brand--umber)]">
                {demoMode ? 'Demo' : 'Synced'}{' '}
                {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={handleRefreshAll}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--base-color-brand--umber)]/30 text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
                title="Refresh all"
              >
                <RefreshIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* KPI strip */}
        <section className="grid grid-cols-3 gap-3">
          <KpiTile label="Stores connected" value={`${connectedCount} / 4`} />
          <KpiTile label="Products synced" value={String(totalProducts)} />
          <KpiTile label="Recent orders" value={String(recentOrderCount)} />
        </section>

        {/* Per-store sections. In demo mode every section reports connected
            with mock data; per-section refresh is disabled because there's
            nothing to fetch. */}
        <PlatformSection
          name="Shopify"
          accent="Store"
          state={view.shopify}
          emptyHint="Add your Shopify Custom App access token in API Keys to sync products and orders."
          onConnect={() => onNavigate('apis')}
          onRefresh={demoMode ? undefined : () => void loadShopify()}
        />
        <PlatformSection
          name="TikTok"
          accent="Shop"
          state={view.tiktok}
          emptyHint="Connect your TikTok Shop in API Keys to pull listings and orders."
          onConnect={() => onNavigate('apis')}
          onRefresh={demoMode ? undefined : () => void loadTiktok()}
        />
        <PlatformSection
          name="Shopee"
          accent="Store"
          state={view.shopee}
          emptyHint="Connect Shopee in API Keys to pull your listings and recent orders."
          onConnect={() => onNavigate('apis')}
          onRefresh={demoMode ? undefined : () => void loadShopee()}
        />
        <PlatformSection
          name="Amazon"
          accent="Seller"
          state={view.amazon}
          emptyHint="Connect Amazon Seller Central in API Keys to pull your catalog and orders."
          onConnect={() => onNavigate('apis')}
          onRefresh={demoMode ? undefined : () => void loadAmazon()}
        />
      </div>
    </main>
  );
}

// ------ KPI tile ---------------------------------------------------------

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-4">
      <p className="text-xs font-medium tracking-wide text-[var(--base-color-brand--umber)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-[var(--base-color-brand--bean)]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--base-color-brand--umber)]">{sub}</p>}
    </div>
  );
}
