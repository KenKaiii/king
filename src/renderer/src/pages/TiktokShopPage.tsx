import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  mockProducts,
  shopInsights,
  getHealthColor,
  getStatusStyle,
  getMetricColor,
  type ShopProduct,
} from '@/lib/mock/tiktokShop';
import type { PageType } from '@/App';
import { useDemoMode } from '@/hooks/useDemoMode';

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
      <path d="M13.65 2.35a8 8 0 1 0 1.22 9.27.75.75 0 0 0-1.32-.72A6.5 6.5 0 1 1 13 3.54V6h-1.25a.75.75 0 0 0 0 1.5H14.5A.75.75 0 0 0 15.25 6.75V4a.75.75 0 0 0-1.5 0v.28A8 8 0 0 0 13.65 2.35Z" />
    </svg>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  colorClass?: string;
  trend?: { value: number; upIsGood?: boolean };
}

function KpiCard({ label, value, sub, colorClass, trend }: KpiCardProps) {
  const trendColor = trend
    ? trend.upIsGood === undefined
      ? 'text-[var(--base-color-brand--umber)]'
      : (trend.upIsGood ? trend.value >= 0 : trend.value < 0)
        ? 'text-[var(--status--success)]'
        : 'text-[var(--status--error)]'
    : '';

  return (
    <div className="rounded-xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-4">
      <p className="text-xs font-medium tracking-wide text-[var(--base-color-brand--umber)]">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${colorClass ?? 'text-[var(--base-color-brand--bean)]'}`}
      >
        {value}
      </p>
      <div className="mt-0.5 flex items-center gap-2">
        {sub && <span className="text-xs text-[var(--base-color-brand--umber)]">{sub}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            <span className="font-normal text-[var(--base-color-brand--umber)]/70">vs yday</span>
          </span>
        )}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: ShopProduct;
}

function ProductCard({ product }: ProductCardProps) {
  const health = getHealthColor(product.health);
  const statusStyle = getStatusStyle(product.status);
  const convColor = getMetricColor(product.convRate, { good: 1.5, warning: 0.8 });
  const ratingColor = getMetricColor(product.rating, { good: 4.5, warning: 3.5 });

  return (
    <div
      className={`rounded-xl border border-l-4 border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-5 ${health.accent}`}
    >
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
              {product.name}
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle}`}
            >
              {product.status}
            </span>
            <span className="rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] px-2 py-0.5 text-[10px] font-medium text-[var(--base-color-brand--umber)]">
              {product.category}
            </span>
          </div>
          <p className="text-xs text-[var(--base-color-brand--umber)]">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="mt-4 grid grid-cols-5 gap-4 border-t border-[var(--base-color-brand--umber)]/20 pt-4">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Orders
          </p>
          <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
            {product.orders}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Revenue
          </p>
          <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
            ${product.revenue.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Views
          </p>
          <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
            {product.views.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Conv.
          </p>
          <p className={`text-sm font-semibold ${convColor}`}>{product.convRate}%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Rating
          </p>
          <p className={`text-sm font-semibold ${ratingColor}`}>
            {product.rating > 0 ? `${product.rating}★` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  metric: string;
  segments: { label: string; value: string; share: number }[];
}

function InsightCard({ title, metric, segments }: InsightCardProps) {
  return (
    <div className="rounded-xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
          {title}
        </p>
        <p className="text-[10px] text-[var(--base-color-brand--umber)]/70">by {metric}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-xs text-[var(--base-color-brand--umber)]">
              {seg.label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--base-color-brand--shell)]">
              <div
                className="h-full rounded-full bg-[var(--status--success)]/60"
                style={{ width: `${seg.share}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-medium text-[var(--base-color-brand--bean)]">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TiktokShopPageProps {
  onNavigate: (page: PageType) => void;
}

export default function TiktokShopPage({ onNavigate }: TiktokShopPageProps) {
  // Empty by default. Demo mode hydrates from mocks; real mode fetches via IPC.
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [demoMode] = useDemoMode();
  const [lastSynced, setLastSynced] = useState<Date>(() => new Date());

  const refreshFromApi = async () => {
    if (!window.api.tiktokShop) return;
    const list = await window.api.tiktokShop.listProducts();
    // Real API returns id/title/status/image; metrics (orders/revenue/views/
    // convRate/rating) require separate analytics endpoints — zero them out
    // until those are wired so users see real product names + statuses without
    // misleading mock metrics.
    const mapped: ShopProduct[] = list.map((p) => ({
      id: p.id,
      name: p.title,
      status: p.status === 'ACTIVATE' || p.status === 'ACTIVE' ? 'active' : 'paused',
      health: 'good',
      category: 'home',
      price: p.price ? Number(p.price) : 0,
      orders: 0,
      revenue: 0,
      views: 0,
      convRate: 0,
      rating: 0,
    }));
    setProducts(mapped);
    setLastSynced(new Date());
  };

  useEffect(() => {
    if (demoMode) {
      setProducts(mockProducts);
      setConnected(true);
      return;
    }
    setProducts([]);
    let cancelled = false;
    void (async () => {
      try {
        const status = await window.api.tiktokShop?.status();
        const isConnected = !!status?.connected;
        if (!cancelled) setConnected(isConnected);
        if (isConnected) {
          try {
            await refreshFromApi();
          } catch (err) {
            toast.error(
              `TikTok Shop: ${err instanceof Error ? err.message : 'Failed to load products'}`,
            );
          }
        }
      } catch {
        if (!cancelled) setConnected(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  const handleRefresh = async () => {
    if (window.api.tiktokShop && connected) {
      try {
        await refreshFromApi();
        toast.success('Data refreshed');
        return;
      } catch (err) {
        toast.error(`TikTok Shop: ${err instanceof Error ? err.message : 'Failed to refresh'}`);
        return;
      }
    }
    toast.success('Data refreshed');
  };

  if (connected === null) {
    return <main className="flex-1" />;
  }

  if (!connected) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-8 text-center">
          <h2 className="text-lg font-bold text-[var(--base-color-brand--bean)]">
            Connect TikTok Shop
          </h2>
          <p className="text-sm text-[var(--base-color-brand--umber)]">
            Link your TikTok Shop to see your products and orders from here.
          </p>
          <button onClick={() => onNavigate('apis')} className="btn-cinamon btn-sm">
            Connect TikTok Shop
          </button>
        </div>
      </main>
    );
  }

  const activeProducts = products.filter((p) => p.status === 'active');
  const totalRevenue = activeProducts.reduce((sum, p) => sum + p.revenue, 0);
  const totalOrders = activeProducts.reduce((sum, p) => sum + p.orders, 0);
  const totalViews = activeProducts.reduce((sum, p) => sum + p.views, 0);
  const avgConvRate =
    activeProducts.length > 0
      ? activeProducts.reduce((sum, p) => sum + p.convRate, 0) / activeProducts.length
      : 0;

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 pt-8 pb-8 md:px-10">
        {/* Header */}
        <section className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-4xl font-bold tracking-tight text-[var(--base-color-brand--bean)] sm:text-5xl"
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                TikTok <span className="text-[var(--base-color-brand--cinamon)]">Shop</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--base-color-brand--umber)]">
                Shop performance overview and product metrics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--base-color-brand--umber)]">
                Synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={handleRefresh}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--base-color-brand--umber)]/30 text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
                title="Refresh"
              >
                <RefreshIcon />
              </button>
            </div>
          </div>
        </section>

        {/* KPI Summary */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            label="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            sub="this month"
            trend={{ value: 18, upIsGood: true }}
          />
          <KpiCard
            label="Orders"
            value={String(totalOrders)}
            sub="this month"
            trend={{ value: 24, upIsGood: true }}
          />
          <KpiCard label="Total Views" value={totalViews.toLocaleString()} trend={{ value: 11 }} />
          <KpiCard
            label="Avg Conv. Rate"
            value={`${avgConvRate.toFixed(2)}%`}
            colorClass={getMetricColor(avgConvRate, { good: 1.5, warning: 0.8 })}
            trend={{ value: 5, upIsGood: true }}
          />
          <KpiCard label="Active Products" value={String(activeProducts.length)} sub="listed" />
        </section>

        {/* Shop Insights */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold tracking-wide text-[var(--base-color-brand--bean)]">
            Shop Insights
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {shopInsights.map((insight) => (
              <InsightCard
                key={insight.title}
                title={insight.title}
                metric={insight.metric}
                segments={insight.segments}
              />
            ))}
          </div>
        </section>

        {/* Product Cards */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold tracking-wide text-[var(--base-color-brand--bean)]">
            Products
          </h3>
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)]/50 p-8 text-center text-sm text-[var(--base-color-brand--umber)]">
              No products found in this TikTok Shop.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
