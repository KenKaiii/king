import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { PlusIcon, MinusIcon } from '@/components/icons';
import {
  mockCampaigns,
  audienceInsights as mockAudienceInsights,
  getHealthColor,
  getStatusStyle,
  getMetricColor,
  type Campaign,
  type CampaignHealth,
  type CampaignType,
} from '@/lib/mock/googleAds';
import type { PageType } from '@/App';
import { useDemoMode } from '@/hooks/useDemoMode';
import { cleanIpcError } from '@/lib/ipcError';

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

interface CampaignCardProps {
  campaign: Campaign;
  onToggleStatus: (id: string) => void;
  onBudgetSave: (id: string, newBudget: number) => void;
}

function CampaignCard({ campaign, onToggleStatus, onBudgetSave }: CampaignCardProps) {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(campaign.dailyBudget);

  const health = getHealthColor(campaign.health);
  const statusStyle = getStatusStyle(campaign.status);
  const ctrColor = getMetricColor(campaign.ctr, { good: 2, warning: 0.5 });
  const convRateColor = getMetricColor(campaign.convRate, { good: 5, warning: 2 });
  const imprShareColor = getMetricColor(campaign.impressionShare, { good: 70, warning: 40 });
  const budgetPct =
    campaign.dailyBudget > 0 ? Math.round((campaign.spent / campaign.dailyBudget) * 100) : 0;

  const handleBudgetSave = () => {
    if (budgetValue > 0) {
      onBudgetSave(campaign.id, budgetValue);
    }
    setEditingBudget(false);
  };

  const handleBudgetCancel = () => {
    setBudgetValue(campaign.dailyBudget);
    setEditingBudget(false);
  };

  return (
    <div
      className={`rounded-xl border border-l-4 border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-5 ${health.accent}`}
    >
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
              {campaign.name}
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle}`}
            >
              {campaign.status}
            </span>
            <span className="rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] px-2 py-0.5 text-[10px] font-medium text-[var(--base-color-brand--umber)]">
              {campaign.type}
            </span>
          </div>
          {/* Budget */}
          <div className="flex items-center gap-2">
            {editingBudget ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBudgetValue((v) => Math.max(1, v - 5))}
                  className="grid h-7 w-7 place-items-center rounded-full border border-[var(--base-color-brand--umber)]/30 text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
                >
                  <MinusIcon />
                </button>
                <div className="flex items-center rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] px-3">
                  <span className="text-xs text-[var(--base-color-brand--umber)]">$</span>
                  <input
                    type="number"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-transparent py-1.5 text-center text-xs text-[var(--base-color-brand--bean)] outline-none"
                    min={1}
                  />
                </div>
                <button
                  onClick={() => setBudgetValue((v) => v + 5)}
                  className="grid h-7 w-7 place-items-center rounded-full border border-[var(--base-color-brand--umber)]/30 text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
                >
                  <PlusIcon />
                </button>
                <button
                  onClick={handleBudgetSave}
                  className="ml-1 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] transition-colors hover:bg-[var(--base-color-brand--red)]"
                >
                  Save
                </button>
                <button
                  onClick={handleBudgetCancel}
                  className="rounded-full border border-[var(--base-color-brand--umber)]/30 px-3 py-1.5 text-xs text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setBudgetValue(campaign.dailyBudget);
                  setEditingBudget(true);
                }}
                className="text-xs text-[var(--base-color-brand--umber)] transition-colors hover:text-[var(--base-color-brand--bean)]"
              >
                ${campaign.dailyBudget}/day
              </button>
            )}
            {!editingBudget && campaign.status === 'active' && campaign.spent > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--base-color-brand--shell)]">
                  <div
                    className={`h-full rounded-full ${
                      budgetPct >= 90
                        ? 'bg-[var(--status--error)]'
                        : budgetPct >= 75
                          ? 'bg-[var(--status--warning)]'
                          : 'bg-[var(--status--success)]'
                    }`}
                    style={{ width: `${Math.min(100, budgetPct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--base-color-brand--umber)]">
                  {budgetPct}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => onToggleStatus(campaign.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
            campaign.status === 'active'
              ? 'border-[var(--base-color-brand--umber)]/50 text-[var(--base-color-brand--umber)] hover:bg-[var(--base-color-brand--shell)]'
              : 'border-[var(--status--success)]/40 text-[var(--status--success)] hover:bg-[var(--status--success)]/10'
          }`}
        >
          {campaign.status === 'active' ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Metrics row */}
      <div className="mt-4 grid grid-cols-6 gap-4 border-t border-[var(--base-color-brand--umber)]/20 pt-4">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Spent
          </p>
          <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
            ${campaign.spent.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            CTR
          </p>
          <p className={`text-sm font-semibold ${ctrColor}`}>{campaign.ctr}%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            CPC
          </p>
          <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
            ${campaign.cpc.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Conv. Rate
          </p>
          <p className={`text-sm font-semibold ${convRateColor}`}>{campaign.convRate}%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            CPA
          </p>
          <p className="text-sm font-semibold text-[var(--base-color-brand--bean)]">
            ${campaign.cpa.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[var(--base-color-brand--umber)]">
            Impr. Share
          </p>
          <p className={`text-sm font-semibold ${imprShareColor}`}>{campaign.impressionShare}%</p>
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

interface GoogleAdsPageProps {
  onNavigate: (page: PageType) => void;
}

function mapChannelType(t: string): CampaignType {
  switch (t) {
    case 'SEARCH':
      return 'search';
    case 'SHOPPING':
      return 'shopping';
    case 'PERFORMANCE_MAX':
      return 'pmax';
    case 'DISPLAY':
      return 'display';
    case 'VIDEO':
      return 'video';
    default:
      return 'search';
  }
}

function healthFromMetrics(c: { ctr: number; cpa: number; conversions: number }): CampaignHealth {
  if (c.conversions > 0 && c.cpa > 0 && c.cpa < 5) return 'good';
  if (c.cpa > 30 || (c.conversions === 0 && c.ctr < 1)) return 'poor';
  return 'warning';
}

export default function GoogleAdsPage({ onNavigate }: GoogleAdsPageProps) {
  // Empty by default. Demo mode hydrates from mocks; real mode fetches via IPC.
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<typeof mockAudienceInsights>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [demoMode] = useDemoMode();
  const [lastSynced, setLastSynced] = useState<Date>(() => new Date());
  // Map: campaignId → budgetResourceName so pause/resume/budget mutations
  // can target the real Google Ads resource without re-querying.
  const [budgetByCampaign, setBudgetByCampaign] = useState<Record<string, string>>({});

  const refreshFromApi = useCallback(async () => {
    if (!window.api.googleAds) return;
    const rows = await window.api.googleAds.listCampaigns();
    const mapped: Campaign[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status === 'ENABLED' ? 'active' : 'paused',
      type: mapChannelType(r.type),
      health: healthFromMetrics(r),
      dailyBudget: r.dailyBudget,
      spent: r.spent,
      ctr: r.ctr,
      cpc: r.cpc,
      conversions: r.conversions,
      convRate: r.convRate,
      cpa: r.cpa,
      impressionShare: r.impressionShare,
    }));
    setCampaigns(mapped);
    setBudgetByCampaign(
      Object.fromEntries(
        rows
          .filter((r) => !!r.budgetResourceName)
          .map((r) => [r.id, r.budgetResourceName!] as const),
      ),
    );
    setLastSynced(new Date());
  }, []);

  useEffect(() => {
    // Demo mode: skip real API entirely; hydrate from mock fixtures.
    if (demoMode) {
      setCampaigns(mockCampaigns);
      setAudienceInsights(mockAudienceInsights);
      setConnected(true);
      return;
    }
    // Real mode: clear any prior demo-mode mocks before probing.
    setCampaigns([]);
    setAudienceInsights([]);
    let cancelled = false;
    const check = async () => {
      try {
        const status = await window.api.googleAds?.status();
        const isConnected = !!status?.connected;
        if (cancelled) return;
        setConnected(isConnected);
        if (isConnected) {
          try {
            await refreshFromApi();
            const insights = await window.api.googleAds?.listAudienceInsights();
            if (insights && insights.length > 0 && !cancelled) setAudienceInsights(insights);
          } catch (err) {
            toast.error(`Google Ads: ${cleanIpcError(err, 'Failed to load campaigns')}`);
          }
        }
      } catch {
        if (!cancelled) setConnected(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [refreshFromApi, demoMode]);

  const handleToggleStatus = useCallback(
    async (id: string) => {
      const current = campaigns.find((c) => c.id === id);
      if (!current) return;
      const nextStatus = current.status === 'active' ? 'paused' : 'active';
      // Optimistic update.
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
      if (window.api.googleAds && connected) {
        try {
          if (nextStatus === 'paused') await window.api.googleAds.pauseCampaign(id);
          else await window.api.googleAds.resumeCampaign(id);
          toast.success(`${current.name} ${nextStatus === 'active' ? 'resumed' : 'paused'}`);
        } catch (err) {
          // Revert on failure.
          setCampaigns((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: current.status } : c)),
          );
          toast.error(`Google Ads: ${cleanIpcError(err, 'Failed to update campaign')}`);
        }
      } else {
        toast.success(`${current.name} ${nextStatus === 'active' ? 'resumed' : 'paused'}`);
      }
    },
    [campaigns, connected],
  );

  const handleBudgetSave = useCallback(
    async (id: string, newBudget: number) => {
      const previous = campaigns.find((c) => c.id === id)?.dailyBudget ?? newBudget;
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, dailyBudget: newBudget } : c)));
      const budgetResourceName = budgetByCampaign[id];
      if (window.api.googleAds && connected && budgetResourceName) {
        const budgetId = budgetResourceName.split('/').pop() ?? '';
        try {
          await window.api.googleAds.updateBudget(budgetId, Math.round(newBudget * 1_000_000));
          toast.success(`Budget updated to $${newBudget}/day`);
        } catch (err) {
          setCampaigns((prev) =>
            prev.map((c) => (c.id === id ? { ...c, dailyBudget: previous } : c)),
          );
          toast.error(`Google Ads: ${cleanIpcError(err, 'Failed to update budget')}`);
        }
      } else {
        toast.success(`Budget updated to $${newBudget}/day`);
      }
    },
    [campaigns, connected, budgetByCampaign],
  );

  const handleRefresh = async () => {
    if (!window.api.googleAds || !connected) {
      toast.success('Data refreshed');
      return;
    }
    try {
      await refreshFromApi();
      toast.success('Data refreshed');
    } catch (err) {
      toast.error(`Google Ads: ${cleanIpcError(err, 'Failed to refresh')}`);
    }
  };

  if (connected === null) {
    return <main className="flex-1" />;
  }

  // Disconnected
  if (!connected) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-8 text-center">
          <h2 className="text-lg font-bold text-[var(--base-color-brand--bean)]">
            Connect Google Ads
          </h2>
          <p className="text-sm text-[var(--base-color-brand--umber)]">
            Link your Google Ads account to see your campaigns and manage them from here.
          </p>
          <button onClick={() => onNavigate('apis')} className="btn-cinamon btn-sm">
            Connect Google Ads
          </button>
        </div>
      </main>
    );
  }

  // Compute KPIs
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const totalSpend = activeCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = activeCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCpc =
    activeCampaigns.length > 0
      ? activeCampaigns.reduce((sum, c) => sum + c.cpc, 0) / activeCampaigns.length
      : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const totalBudget = activeCampaigns.reduce((sum, c) => sum + c.dailyBudget, 0);

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
                Google <span className="text-[var(--base-color-brand--cinamon)]">Ads</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--base-color-brand--umber)]">
                Campaign performance overview and quick actions.
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
            label="Total Spend"
            value={`$${totalSpend.toFixed(2)}`}
            sub={`of $${totalBudget} budget`}
            trend={{ value: 8 }}
          />
          <KpiCard
            label="Avg CPC"
            value={`$${avgCpc.toFixed(2)}`}
            colorClass={getMetricColor(avgCpc, { good: 1, warning: 2.5 }, true)}
            trend={{ value: -12, upIsGood: false }}
          />
          <KpiCard
            label="Conversions"
            value={String(totalConversions)}
            sub="today"
            trend={{ value: 22, upIsGood: true }}
          />
          <KpiCard
            label="Avg CPA"
            value={`$${avgCpa.toFixed(2)}`}
            colorClass={getMetricColor(avgCpa, { good: 10, warning: 25 }, true)}
            trend={{ value: -8, upIsGood: false }}
          />
          <KpiCard label="Active" value={String(activeCampaigns.length)} sub="campaigns" />
        </section>

        {/* Audience Insights — hide when no data (real API may return none). */}
        {audienceInsights.length > 0 && (
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold tracking-wide text-[var(--base-color-brand--bean)]">
              Audience Insights
            </h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {audienceInsights.map((insight) => (
                <InsightCard
                  key={insight.title}
                  title={insight.title}
                  metric={insight.metric}
                  segments={insight.segments}
                />
              ))}
            </div>
          </section>
        )}

        {/* Campaign Cards */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold tracking-wide text-[var(--base-color-brand--bean)]">
            Campaigns
          </h3>
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)]/50 p-8 text-center text-sm text-[var(--base-color-brand--umber)]">
              No campaigns found in this Google Ads account.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onToggleStatus={handleToggleStatus}
                  onBudgetSave={handleBudgetSave}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
