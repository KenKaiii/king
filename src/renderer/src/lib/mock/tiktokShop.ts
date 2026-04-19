// Types and mock data for TikTok Shop dashboard

export type ShopStatus = 'active' | 'paused' | 'review';
export type ShopHealth = 'good' | 'warning' | 'poor';
export type ProductCategory = 'electronics' | 'fashion' | 'beauty' | 'home' | 'food';

export interface ShopProduct {
  id: string;
  name: string;
  status: ShopStatus;
  health: ShopHealth;
  category: ProductCategory;
  price: number;
  orders: number;
  revenue: number;
  views: number;
  convRate: number;
  rating: number;
}

export const mockProducts: ShopProduct[] = [
  {
    id: '1',
    name: 'LED Ring Light Kit',
    status: 'active',
    health: 'good',
    category: 'electronics',
    price: 29.99,
    orders: 142,
    revenue: 4258.58,
    views: 8420,
    convRate: 1.69,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Oversized Hoodie - Black',
    status: 'active',
    health: 'good',
    category: 'fashion',
    price: 34.99,
    orders: 98,
    revenue: 3429.02,
    views: 5210,
    convRate: 1.88,
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Vitamin C Serum 30ml',
    status: 'active',
    health: 'warning',
    category: 'beauty',
    price: 18.5,
    orders: 67,
    revenue: 1239.5,
    views: 9100,
    convRate: 0.74,
    rating: 4.3,
  },
  {
    id: '4',
    name: 'Aroma Diffuser 300ml',
    status: 'active',
    health: 'good',
    category: 'home',
    price: 24.99,
    orders: 83,
    revenue: 2074.17,
    views: 4320,
    convRate: 1.92,
    rating: 4.7,
  },
  {
    id: '5',
    name: 'Matcha Powder Organic 200g',
    status: 'review',
    health: 'warning',
    category: 'food',
    price: 15.99,
    orders: 0,
    revenue: 0,
    views: 0,
    convRate: 0,
    rating: 0,
  },
  {
    id: '6',
    name: 'Phone Case - Clear TPU',
    status: 'paused',
    health: 'poor',
    category: 'electronics',
    price: 9.99,
    orders: 12,
    revenue: 119.88,
    views: 3800,
    convRate: 0.32,
    rating: 3.2,
  },
];

export function getHealthColor(health: ShopHealth) {
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

export function getStatusStyle(status: ShopStatus) {
  switch (status) {
    case 'active':
      return 'border-[var(--status--success)]/30 bg-[var(--status--success)]/10 text-[var(--status--success)]';
    case 'paused':
      return 'border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--umber)]/10 text-[var(--base-color-brand--umber)]';
    case 'review':
      return 'border-[var(--status--warning)]/30 bg-[var(--status--warning)]/10 text-[var(--status--warning)]';
  }
}

export function getMetricColor(value: number, thresholds: { good: number; warning: number }) {
  if (value >= thresholds.good) return 'text-[var(--status--success)]';
  if (value >= thresholds.warning) return 'text-[var(--status--warning)]';
  return 'text-[var(--status--error)]';
}

export const shopInsights = [
  {
    title: 'Traffic Source',
    metric: 'orders',
    segments: [
      { label: 'For You Page', value: '52%', share: 52 },
      { label: 'Live Stream', value: '24%', share: 24 },
      { label: 'Search', value: '16%', share: 16 },
      { label: 'Profile', value: '8%', share: 8 },
    ],
  },
  {
    title: 'Age Group',
    metric: 'orders',
    segments: [
      { label: '18\u201324', value: '41%', share: 41 },
      { label: '25\u201334', value: '35%', share: 35 },
      { label: '35\u201344', value: '16%', share: 16 },
      { label: '45+', value: '8%', share: 8 },
    ],
  },
  {
    title: 'Top Category',
    metric: 'revenue',
    segments: [
      { label: 'Electronics', value: '39%', share: 39 },
      { label: 'Fashion', value: '31%', share: 31 },
      { label: 'Home', value: '19%', share: 19 },
      { label: 'Beauty', value: '11%', share: 11 },
    ],
  },
  {
    title: 'Country',
    metric: 'orders',
    segments: [
      { label: 'United States', value: '62%', share: 62 },
      { label: 'United Kingdom', value: '18%', share: 18 },
      { label: 'Indonesia', value: '12%', share: 12 },
      { label: 'Malaysia', value: '8%', share: 8 },
    ],
  },
];
