// Types and mock data for Facebook Ads dashboard

export type CampaignStatus = 'active' | 'paused' | 'error';
export type CampaignHealth = 'good' | 'warning' | 'poor';
export type CampaignObjective = 'conversions' | 'awareness' | 'traffic' | 'engagement';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  health: CampaignHealth;
  objective: CampaignObjective;
  dailyBudget: number;
  spent: number;
  ctr: number;
  cpc: number;
  conversions: number;
  roas: number;
}

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale - Lookalike',
    status: 'active',
    health: 'good',
    objective: 'conversions',
    dailyBudget: 50,
    spent: 42.3,
    ctr: 3.2,
    cpc: 0.85,
    conversions: 18,
    roas: 4.8,
  },
  {
    id: '2',
    name: 'Retargeting - Cart Abandoners',
    status: 'active',
    health: 'good',
    objective: 'conversions',
    dailyBudget: 30,
    spent: 27.5,
    ctr: 5.1,
    cpc: 0.62,
    conversions: 12,
    roas: 6.2,
  },
  {
    id: '3',
    name: 'Brand Awareness - Video',
    status: 'active',
    health: 'warning',
    objective: 'awareness',
    dailyBudget: 80,
    spent: 74.2,
    ctr: 0.8,
    cpc: 2.15,
    conversions: 3,
    roas: 1.1,
  },
  {
    id: '4',
    name: 'New Product Launch',
    status: 'active',
    health: 'poor',
    objective: 'traffic',
    dailyBudget: 100,
    spent: 95.0,
    ctr: 0.3,
    cpc: 4.5,
    conversions: 1,
    roas: 0.4,
  },
  {
    id: '5',
    name: 'Holiday Promo 2024',
    status: 'paused',
    health: 'good',
    objective: 'conversions',
    dailyBudget: 40,
    spent: 0,
    ctr: 2.8,
    cpc: 0.95,
    conversions: 0,
    roas: 3.5,
  },
  {
    id: '6',
    name: 'Engagement - Instagram',
    status: 'error',
    health: 'poor',
    objective: 'engagement',
    dailyBudget: 25,
    spent: 0,
    ctr: 0.1,
    cpc: 8.2,
    conversions: 0,
    roas: 0.0,
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
    case 'error':
      return 'border-[var(--status--error)]/30 bg-[var(--status--error)]/10 text-[var(--status--error)]';
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
    metric: 'conversions',
    segments: [
      { label: 'United States', value: '58%', share: 58 },
      { label: 'United Kingdom', value: '19%', share: 19 },
      { label: 'Australia', value: '13%', share: 13 },
      { label: 'Canada', value: '10%', share: 10 },
    ],
  },
  {
    title: 'Age Group',
    metric: 'CPA',
    segments: [
      { label: '25\u201334', value: '$4.20', share: 38 },
      { label: '35\u201344', value: '$6.80', share: 28 },
      { label: '18\u201324', value: '$9.10', share: 20 },
      { label: '45\u201354', value: '$14.20', share: 14 },
    ],
  },
  {
    title: 'Gender',
    metric: 'conversions',
    segments: [
      { label: 'Female', value: '61%', share: 61 },
      { label: 'Male', value: '39%', share: 39 },
    ],
  },
  {
    title: 'Placement',
    metric: 'conversions',
    segments: [
      { label: 'Feed', value: '45%', share: 45 },
      { label: 'Stories', value: '28%', share: 28 },
      { label: 'Reels', value: '18%', share: 18 },
      { label: 'Audience Net.', value: '9%', share: 9 },
    ],
  },
];
