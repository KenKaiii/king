// Types and mock data for Google Ads dashboard

export type CampaignStatus = 'active' | 'paused';
export type CampaignHealth = 'good' | 'warning' | 'poor';
export type CampaignType = 'search' | 'shopping' | 'pmax' | 'display' | 'video';

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
  conversions: number;
  convRate: number;
  cpa: number;
  impressionShare: number;
}

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Brand Search - Exact',
    status: 'active',
    health: 'good',
    type: 'search',
    dailyBudget: 45,
    spent: 38.7,
    ctr: 8.5,
    cpc: 0.42,
    conversions: 24,
    convRate: 12.3,
    cpa: 1.61,
    impressionShare: 92,
  },
  {
    id: '2',
    name: 'Shopping - Best Sellers',
    status: 'active',
    health: 'good',
    type: 'shopping',
    dailyBudget: 120,
    spent: 108.5,
    ctr: 3.8,
    cpc: 0.65,
    conversions: 32,
    convRate: 5.2,
    cpa: 3.39,
    impressionShare: 78,
  },
  {
    id: '3',
    name: 'PMax - All Products',
    status: 'active',
    health: 'warning',
    type: 'pmax',
    dailyBudget: 200,
    spent: 185.4,
    ctr: 1.2,
    cpc: 1.85,
    conversions: 15,
    convRate: 2.1,
    cpa: 12.36,
    impressionShare: 45,
  },
  {
    id: '4',
    name: 'Display - Remarketing',
    status: 'active',
    health: 'warning',
    type: 'display',
    dailyBudget: 35,
    spent: 31.2,
    ctr: 0.4,
    cpc: 0.95,
    conversions: 4,
    convRate: 1.8,
    cpa: 7.8,
    impressionShare: 65,
  },
  {
    id: '5',
    name: 'YouTube - Product Demo',
    status: 'active',
    health: 'poor',
    type: 'video',
    dailyBudget: 60,
    spent: 54.8,
    ctr: 0.2,
    cpc: 3.2,
    conversions: 1,
    convRate: 0.5,
    cpa: 54.8,
    impressionShare: 35,
  },
  {
    id: '6',
    name: 'Search - Competitor Terms',
    status: 'paused',
    health: 'good',
    type: 'search',
    dailyBudget: 55,
    spent: 0,
    ctr: 4.2,
    cpc: 1.85,
    conversions: 0,
    convRate: 6.8,
    cpa: 4.52,
    impressionShare: 0,
  },
  {
    id: '7',
    name: 'Shopping - Clearance',
    status: 'active',
    health: 'poor',
    type: 'shopping',
    dailyBudget: 25,
    spent: 22.1,
    ctr: 1.1,
    cpc: 2.1,
    conversions: 1,
    convRate: 0.8,
    cpa: 22.1,
    impressionShare: 22,
  },
];

export function getHealthColor(health: CampaignHealth) {
  switch (health) {
    case 'good':
      return {
        border: 'border-teal-400/20',
        bg: 'bg-teal-400/10',
        text: 'text-teal-400',
        accent: 'border-l-teal-400',
      };
    case 'warning':
      return {
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/10',
        text: 'text-amber-500',
        accent: 'border-l-amber-500',
      };
    case 'poor':
      return {
        border: 'border-red-500/20',
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        accent: 'border-l-red-500',
      };
  }
}

export function getStatusStyle(status: CampaignStatus) {
  switch (status) {
    case 'active':
      return 'border-teal-400/20 bg-teal-400/10 text-teal-400';
    case 'paused':
      return 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400';
  }
}

export function getMetricColor(
  value: number,
  thresholds: { good: number; warning: number },
  lowerIsBetter = false,
) {
  if (lowerIsBetter) {
    if (value <= thresholds.good) return 'text-teal-400';
    if (value <= thresholds.warning) return 'text-amber-500';
    return 'text-red-500';
  }
  if (value >= thresholds.good) return 'text-teal-400';
  if (value >= thresholds.warning) return 'text-amber-500';
  return 'text-red-500';
}

export const audienceInsights = [
  {
    title: 'Country',
    metric: 'conversions',
    segments: [
      { label: 'United States', value: '52%', share: 52 },
      { label: 'United Kingdom', value: '22%', share: 22 },
      { label: 'Germany', value: '15%', share: 15 },
      { label: 'Canada', value: '11%', share: 11 },
    ],
  },
  {
    title: 'Age Group',
    metric: 'CPA',
    segments: [
      { label: '25\u201334', value: '$5.40', share: 35 },
      { label: '35\u201344', value: '$8.20', share: 30 },
      { label: '18\u201324', value: '$11.50', share: 18 },
      { label: '45\u201354', value: '$16.80', share: 17 },
    ],
  },
  {
    title: 'Device',
    metric: 'conversions',
    segments: [
      { label: 'Mobile', value: '54%', share: 54 },
      { label: 'Desktop', value: '38%', share: 38 },
      { label: 'Tablet', value: '8%', share: 8 },
    ],
  },
  {
    title: 'Network',
    metric: 'conversions',
    segments: [
      { label: 'Search', value: '48%', share: 48 },
      { label: 'Shopping', value: '27%', share: 27 },
      { label: 'Display', value: '15%', share: 15 },
      { label: 'YouTube', value: '10%', share: 10 },
    ],
  },
];
