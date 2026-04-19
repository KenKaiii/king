// Types and mock data for Shopee Ads dashboard

export type CampaignStatus = 'active' | 'paused' | 'ended';
export type CampaignHealth = 'good' | 'warning' | 'poor';
export type CampaignType = 'search' | 'discovery' | 'shop' | 'boost';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  health: CampaignHealth;
  type: CampaignType;
  dailyBudget: number;
  spent: number;
  ctr: number;
  cpc: number;
  orders: number;
  roas: number;
}

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Flash Sale - Top Products',
    status: 'active',
    health: 'good',
    type: 'search',
    dailyBudget: 40,
    spent: 35.2,
    ctr: 4.5,
    cpc: 0.38,
    orders: 22,
    roas: 5.8,
  },
  {
    id: '2',
    name: 'Discovery - New Arrivals',
    status: 'active',
    health: 'good',
    type: 'discovery',
    dailyBudget: 60,
    spent: 51.8,
    ctr: 2.9,
    cpc: 0.55,
    orders: 18,
    roas: 4.2,
  },
  {
    id: '3',
    name: 'Shop Ads - Homepage',
    status: 'active',
    health: 'warning',
    type: 'shop',
    dailyBudget: 35,
    spent: 30.5,
    ctr: 1.1,
    cpc: 1.2,
    orders: 5,
    roas: 1.8,
  },
  {
    id: '4',
    name: 'Product Boost - Electronics',
    status: 'active',
    health: 'good',
    type: 'boost',
    dailyBudget: 25,
    spent: 19.4,
    ctr: 3.8,
    cpc: 0.42,
    orders: 14,
    roas: 6.1,
  },
  {
    id: '5',
    name: 'Search Ads - Beauty Keywords',
    status: 'active',
    health: 'poor',
    type: 'search',
    dailyBudget: 50,
    spent: 46.3,
    ctr: 0.6,
    cpc: 2.8,
    orders: 2,
    roas: 0.7,
  },
  {
    id: '6',
    name: 'Payday Sale Campaign',
    status: 'paused',
    health: 'good',
    type: 'discovery',
    dailyBudget: 80,
    spent: 0,
    ctr: 3.2,
    cpc: 0.48,
    orders: 0,
    roas: 4.5,
  },
  {
    id: '7',
    name: '12.12 Promo - Ended',
    status: 'ended',
    health: 'good',
    type: 'shop',
    dailyBudget: 100,
    spent: 100,
    ctr: 5.1,
    cpc: 0.32,
    orders: 45,
    roas: 7.2,
  },
];

export function getHealthColor(health: CampaignHealth) {
  switch (health) {
    case 'good':
      return {
        border: 'border-[var(--status--success)]/30',
        bg: 'bg-[var(--status--success)]/10',
        text: 'text-[var(--status--success)]',
        accent: 'border-l-[var(--status--success)]',
      };
    case 'warning':
      return {
        border: 'border-[var(--status--warning)]/30',
        bg: 'bg-[var(--status--warning)]/10',
        text: 'text-[var(--status--warning)]',
        accent: 'border-l-[var(--status--warning)]',
      };
    case 'poor':
      return {
        border: 'border-[var(--status--error)]/30',
        bg: 'bg-[var(--status--error)]/10',
        text: 'text-[var(--status--error)]',
        accent: 'border-l-[var(--status--error)]',
      };
  }
}

export function getStatusStyle(status: CampaignStatus) {
  switch (status) {
    case 'active':
      return 'border-[var(--status--success)]/30 bg-[var(--status--success)]/10 text-[var(--status--success)]';
    case 'paused':
      return 'border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--umber)]/10 text-[var(--base-color-brand--umber)]';
    case 'ended':
      return 'border-[var(--base-color-brand--umber)]/20 bg-[var(--base-color-brand--umber)]/10 text-[var(--base-color-brand--umber)]';
  }
}

export function getMetricColor(value: number, thresholds: { good: number; warning: number }) {
  if (value >= thresholds.good) return 'text-[var(--status--success)]';
  if (value >= thresholds.warning) return 'text-[var(--status--warning)]';
  return 'text-[var(--status--error)]';
}

export const audienceInsights = [
  {
    title: 'Country',
    metric: 'orders',
    segments: [
      { label: 'Indonesia', value: '34%', share: 34 },
      { label: 'Philippines', value: '22%', share: 22 },
      { label: 'Thailand', value: '20%', share: 20 },
      { label: 'Malaysia', value: '14%', share: 14 },
      { label: 'Vietnam', value: '10%', share: 10 },
    ],
  },
  {
    title: 'Age Group',
    metric: 'CPA',
    segments: [
      { label: '18\u201324', value: '$2.10', share: 35 },
      { label: '25\u201334', value: '$3.40', share: 32 },
      { label: '35\u201344', value: '$5.80', share: 20 },
      { label: '45+', value: '$8.50', share: 13 },
    ],
  },
  {
    title: 'Device',
    metric: 'orders',
    segments: [
      { label: 'Mobile', value: '82%', share: 82 },
      { label: 'Desktop', value: '14%', share: 14 },
      { label: 'Tablet', value: '4%', share: 4 },
    ],
  },
  {
    title: 'Ad Placement',
    metric: 'orders',
    segments: [
      { label: 'Search Results', value: '42%', share: 42 },
      { label: 'Discovery', value: '28%', share: 28 },
      { label: 'Shop Page', value: '18%', share: 18 },
      { label: 'Product Boost', value: '12%', share: 12 },
    ],
  },
];
