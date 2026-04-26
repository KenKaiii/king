/**
 * Demo-mode fixtures for the unified Store dashboard.
 *
 * The shapes here intentionally mirror what the real IPC clients return for
 * each platform's `listProducts` / `listOrders` calls. `StorePage` only ever
 * imports this when the demo toggle is on — the real clients are never
 * shadowed in production data flow.
 *
 * Images are bundled local assets (Vite hashes + serves them) so demo mode
 * works fully offline and doesn't rely on third-party CDNs.
 */

import beauty1 from '@/assets/ad-references/beauty-1.jpg';
import beauty2 from '@/assets/ad-references/beauty-2.jpg';
import beauty3 from '@/assets/ad-references/beauty-3.jpg';
import beauty4 from '@/assets/ad-references/beauty-4.jpg';
import health1 from '@/assets/ad-references/health-1.jpg';
import health2 from '@/assets/ad-references/health-2.jpg';
import health3 from '@/assets/ad-references/health-3.jpg';
import health4 from '@/assets/ad-references/health-4.jpg';
import health6 from '@/assets/ad-references/health-6.jpg';
import health7 from '@/assets/ad-references/health-7.jpg';
import health8 from '@/assets/ad-references/health-8.jpg';
import health10 from '@/assets/ad-references/health-10.jpg';

// ---- Shapes (kept in sync with IPC return types) -------------------------

export interface MockShopifyProduct {
  id: string;
  title: string;
  status: string;
  vendor?: string;
  image?: string;
}

export interface MockShopifyOrder {
  id: string;
  name: string;
  total: string;
  currency: string;
  createdAt: string;
}

export interface MockShopeeProduct {
  id: number;
  name: string;
  price?: number;
  stock?: number;
  image?: string;
}

export interface MockShopeeOrder {
  id: string;
  status: string;
  total?: string;
  createdAt: string;
}

export interface MockTiktokProduct {
  id: string;
  title: string;
  status: string;
  price?: string;
  image?: string;
}

export interface MockTiktokOrder {
  id: string;
  status: string;
  total?: string;
  createdAt: string;
}

export interface MockAmazonItem {
  asin: string;
  title?: string;
  brand?: string;
}

export interface MockAmazonOrder {
  id: string;
  status: string;
  total?: string;
  purchasedAt: string;
}

// ---- Helpers -------------------------------------------------------------

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Stable timestamps relative to "now" so demo data always feels fresh. */
function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

// ---- Shopify -------------------------------------------------------------

export const shopifyDemo = {
  identity: { shopName: 'Lumen Beauty', currency: 'USD', shopDomain: 'lumen-beauty.myshopify.com' },
  products: [
    {
      id: '7821093421057',
      title: 'Daily Skin Glow Serum 30ml',
      status: 'active',
      vendor: 'Lumen Beauty',
      image: beauty1,
    },
    {
      id: '7821093421058',
      title: 'Hydra Bloom Cleanser',
      status: 'active',
      vendor: 'Lumen Beauty',
      image: beauty2,
    },
    {
      id: '7821093421059',
      title: 'Velvet Lip Tint — Rose',
      status: 'active',
      vendor: 'Lumen Beauty',
      image: beauty3,
    },
    {
      id: '7821093421060',
      title: 'Botanical Eye Cream',
      status: 'active',
      vendor: 'Lumen Beauty',
      image: beauty4,
    },
    {
      id: '7821093421061',
      title: 'Vitamin C Renewal Mask',
      status: 'draft',
      vendor: 'Lumen Beauty',
      image: health1,
    },
    {
      id: '7821093421062',
      title: 'Overnight Repair Oil 15ml',
      status: 'active',
      vendor: 'Lumen Beauty',
      image: health2,
    },
  ] satisfies MockShopifyProduct[],
  orders: [
    {
      id: '5602137145537',
      name: '#1042',
      total: '74.00',
      currency: 'USD',
      createdAt: ago(2 * HOUR),
    },
    {
      id: '5602137145536',
      name: '#1041',
      total: '34.99',
      currency: 'USD',
      createdAt: ago(5 * HOUR),
    },
    {
      id: '5602137145535',
      name: '#1040',
      total: '128.50',
      currency: 'USD',
      createdAt: ago(1 * DAY),
    },
    {
      id: '5602137145534',
      name: '#1039',
      total: '52.00',
      currency: 'USD',
      createdAt: ago(2 * DAY),
    },
    {
      id: '5602137145533',
      name: '#1038',
      total: '89.99',
      currency: 'USD',
      createdAt: ago(3 * DAY),
    },
  ] satisfies MockShopifyOrder[],
};

// ---- TikTok Shop ---------------------------------------------------------

export const tiktokDemo = {
  identity: { shopId: '7493012380194813', shopName: 'Lumen Beauty US' },
  products: [
    {
      id: '1729384756102938475',
      title: 'LED Ring Light Kit 10"',
      status: 'ACTIVATE',
      price: '29.99',
      image: health3,
    },
    {
      id: '1729384756102938476',
      title: 'Cordless Heatless Hair Curlers',
      status: 'ACTIVATE',
      price: '18.50',
      image: health4,
    },
    {
      id: '1729384756102938477',
      title: 'Glow Setting Spray',
      status: 'ACTIVATE',
      price: '14.99',
      image: health6,
    },
    {
      id: '1729384756102938478',
      title: 'Magnetic False Lashes — 5pk',
      status: 'ACTIVATE',
      price: '22.00',
      image: health7,
    },
    {
      id: '1729384756102938479',
      title: 'Aloe Recovery Mist 100ml',
      status: 'INACTIVE',
      price: '19.99',
      image: health8,
    },
  ] satisfies MockTiktokProduct[],
  orders: [
    {
      id: '578304920183746',
      status: 'AWAITING_SHIPMENT',
      total: '29.99',
      createdAt: ago(1 * HOUR),
    },
    {
      id: '578304920183745',
      status: 'AWAITING_SHIPMENT',
      total: '44.50',
      createdAt: ago(3 * HOUR),
    },
    { id: '578304920183744', status: 'IN_TRANSIT', total: '22.00', createdAt: ago(8 * HOUR) },
    { id: '578304920183743', status: 'DELIVERED', total: '57.98', createdAt: ago(1 * DAY) },
    { id: '578304920183742', status: 'DELIVERED', total: '19.99', createdAt: ago(2 * DAY) },
  ] satisfies MockTiktokOrder[],
};

// ---- Shopee --------------------------------------------------------------

export const shopeeDemo = {
  identity: { shopId: 482910374 },
  products: [
    {
      id: 24812039471,
      name: 'Wireless Earbuds Pro — White',
      price: 149,
      stock: 240,
      image: health10,
    },
    { id: 24812039472, name: 'Foldable Tote Bag — Beige', price: 45, stock: 78, image: beauty1 },
    {
      id: 24812039473,
      name: 'Rose Gold Watch — Mesh Strap',
      price: 189,
      stock: 12,
      image: beauty2,
    },
    { id: 24812039474, name: 'Mini Air Humidifier', price: 79, stock: 165, image: health1 },
    { id: 24812039475, name: 'Bamboo Sock Pack — 5pcs', price: 35, stock: 320, image: health2 },
    { id: 24812039476, name: 'Silicone Phone Grip', price: 12, stock: 0, image: health3 },
  ] satisfies MockShopeeProduct[],
  orders: [
    { id: '241027ABCDXYZ1', status: 'TO_SHIP', total: '189', createdAt: ago(4 * HOUR) },
    { id: '241027ABCDXYZ2', status: 'SHIPPED', total: '57', createdAt: ago(9 * HOUR) },
    { id: '241026ABCDXYZ3', status: 'COMPLETED', total: '45', createdAt: ago(1 * DAY) },
    { id: '241026ABCDXYZ4', status: 'COMPLETED', total: '224', createdAt: ago(2 * DAY) },
  ] satisfies MockShopeeOrder[],
};

// ---- Amazon --------------------------------------------------------------

export const amazonDemo = {
  identity: { sellingPartnerId: 'A2EUQ1WTGCTBG2', marketplaceIds: ['ATVPDKIKX0DER'] },
  catalog: [
    { asin: 'B09B8V1LZ3', title: 'Echo Dot (5th Gen) — Charcoal', brand: 'Amazon' },
    { asin: 'B019GJLER8', title: 'Anker PowerCore 10000', brand: 'Anker' },
    { asin: 'B0CGYP6T9M', title: 'Kindle Paperwhite (16 GB)', brand: 'Amazon' },
    { asin: 'B08KH53NKR', title: 'Sony WH-1000XM4 Wireless Headphones', brand: 'Sony' },
    { asin: 'B07XJ8C8F5', title: 'Logitech MX Master 3', brand: 'Logitech' },
    { asin: 'B0C75ZJTHF', title: 'Apple AirTag — 4 Pack', brand: 'Apple' },
  ] satisfies MockAmazonItem[],
  orders: [
    {
      id: '113-7382910-0019473',
      status: 'Pending',
      total: '149.99 USD',
      purchasedAt: ago(2 * HOUR),
    },
    {
      id: '113-7382910-0019472',
      status: 'Shipped',
      total: '54.00 USD',
      purchasedAt: ago(11 * HOUR),
    },
    {
      id: '113-7382910-0019471',
      status: 'Shipped',
      total: '329.00 USD',
      purchasedAt: ago(1 * DAY),
    },
    {
      id: '113-7382910-0019470',
      status: 'Delivered',
      total: '24.99 USD',
      purchasedAt: ago(3 * DAY),
    },
  ] satisfies MockAmazonOrder[],
};
