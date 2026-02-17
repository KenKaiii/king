import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PlusIcon, MinusIcon } from '@/components/icons';
import {
  mockCampaigns,
  audienceInsights,
  getHealthColor,
  getStatusStyle,
  getMetricColor,
  type Campaign,
} from '@/lib/mock/googleAds';
import type { PageType } from '@/App';

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
      ? 'text-zinc-400'
      : (trend.upIsGood ? trend.value >= 0 : trend.value < 0)
        ? 'text-teal-400'
        : 'text-red-400'
    : '';

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colorClass ?? 'text-white'}`}>{value}</p>
      <div className="mt-0.5 flex items-center gap-2">
        {sub && <span className="text-xs text-zinc-500">{sub}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            <span className="font-normal text-zinc-600">vs yday</span>
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
    <div className={`rounded-xl border border-white/10 border-l-4 bg-white/5 p-5 ${health.accent}`}>
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${statusStyle}`}
            >
              {campaign.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 uppercase">
              {campaign.type}
            </span>
          </div>
          {/* Budget */}
          <div className="flex items-center gap-2">
            {editingBudget ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBudgetValue((v) => Math.max(1, v - 5))}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <MinusIcon />
                </button>
                <div className="flex items-center rounded-lg border border-white/10 bg-white/5 px-2">
                  <span className="text-xs text-zinc-500">$</span>
                  <input
                    type="number"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-transparent py-1.5 text-center text-xs text-white outline-none"
                    min={1}
                  />
                </div>
                <button
                  onClick={() => setBudgetValue((v) => v + 5)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <PlusIcon />
                </button>
                <button
                  onClick={handleBudgetSave}
                  className="ml-1 rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-teal-500"
                >
                  Save
                </button>
                <button
                  onClick={handleBudgetCancel}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
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
                className="text-xs text-zinc-400 transition-colors hover:text-white"
              >
                ${campaign.dailyBudget}/day
              </button>
            )}
            {!editingBudget && campaign.status === 'active' && campaign.spent > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      budgetPct >= 90
                        ? 'bg-red-500'
                        : budgetPct >= 75
                          ? 'bg-amber-500'
                          : 'bg-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, budgetPct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{budgetPct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => onToggleStatus(campaign.id)}
          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            campaign.status === 'active'
              ? 'border-zinc-600 text-zinc-300 hover:bg-white/10'
              : 'border-teal-400/30 text-teal-400 hover:bg-teal-400/10'
          }`}
        >
          {campaign.status === 'active' ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Metrics row */}
      <div className="mt-4 grid grid-cols-6 gap-4 border-t border-white/5 pt-4">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">Spent</p>
          <p className="text-sm font-semibold text-white">${campaign.spent.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">CTR</p>
          <p className={`text-sm font-semibold ${ctrColor}`}>{campaign.ctr}%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">CPC</p>
          <p className="text-sm font-semibold text-white">${campaign.cpc.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">
            Conv. Rate
          </p>
          <p className={`text-sm font-semibold ${convRateColor}`}>{campaign.convRate}%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">CPA</p>
          <p className="text-sm font-semibold text-white">${campaign.cpa.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">{title}</p>
        <p className="text-[10px] text-zinc-600">by {metric}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-xs text-zinc-300">{seg.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal-400/60"
                style={{ width: `${seg.share}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-medium text-white">
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

export default function GoogleAdsPage({ onNavigate }: GoogleAdsPageProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  // TODO: Re-enable API key check when real API is wired up
  const [connected] = useState<boolean>(true);
  const [lastSynced] = useState(() => new Date());

  const handleToggleStatus = useCallback((id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = c.status === 'active' ? 'paused' : 'active';
        toast.success(`${c.name} ${next === 'active' ? 'resumed' : 'paused'}`);
        return { ...c, status: next };
      }),
    );
  }, []);

  const handleBudgetSave = useCallback((id: string, newBudget: number) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        toast.success(`Budget updated to $${newBudget}/day`);
        return { ...c, dailyBudget: newBudget };
      }),
    );
  }, []);

  const handleRefresh = () => {
    toast.success('Data refreshed');
  };

  // Disconnected
  if (!connected) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="text-lg font-bold text-white">Connect Google Ads</h2>
          <p className="text-sm text-zinc-400">
            Add your Google Ads API key to view campaign performance and manage ads.
          </p>
          <button
            onClick={() => onNavigate('apis')}
            className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-teal-500"
          >
            Go to API Keys
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
              <h2 className="text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
                Google <span className="text-teal-400">Ads</span>
              </h2>
              <p className="mt-1 text-sm text-zinc-300">
                Campaign performance overview and quick actions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">
                Synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={handleRefresh}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Refresh data"
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

        {/* Audience Insights */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold tracking-wide text-white uppercase">
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

        {/* Campaign Cards */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold tracking-wide text-white uppercase">Campaigns</h3>
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
        </section>
      </div>
    </main>
  );
}
