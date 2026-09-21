/**
 * wefik.world — Application Constants
 *
 * All prices in paise (INR) or cents (USD).
 * Integer-only money math.
 */

export const SITE_CONFIG = {
  name: "wefik.world",
  tagline: "Premium digital products for people who build the web",
  description:
    "WordPress themes, HTML templates, plugins, and code snippets — crafted by Wefik, the digital agency behind hundreds of web projects.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://wefik.world",
  ogImage: "/og-default.png",
  creator: "Wefik",
  creatorUrl: "https://wefik.in",
} as const;

export const MEMBERSHIP_PLANS = {
  monthly: {
    name: "All-Access Monthly",
    price_inr_paise: 99900, // ₹999
    price_usd_cents: 1200, // $12
    interval: "month" as const,
    description: "Access every product, cancel anytime",
    features: [
      "Access to all current products",
      "New releases included",
      "Priority support",
      "Cancel anytime",
    ],
  },
  lifetime: {
    name: "Lifetime Deal",
    price_inr_paise: 999900, // ₹9,999
    price_usd_cents: 12000, // $120
    interval: "one-time" as const,
    description: "One payment, lifetime access to everything",
    features: [
      "Access to all current products",
      "All future products included",
      "Priority support forever",
      "No recurring charges",
      "Best value",
    ],
  },
} as const;

export const PRODUCT_TYPES = [
  { value: "theme", label: "WordPress Themes" },
  { value: "template", label: "HTML Templates" },
  { value: "plugin", label: "WordPress Plugins" },
  { value: "snippet", label: "Code Snippets" },
  { value: "bundle", label: "Bundles" },
] as const;

export const LICENSE_TYPES = [
  {
    value: "single",
    label: "Single Site License",
    description: "Use on 1 website",
  },
  {
    value: "unlimited",
    label: "Unlimited Sites License",
    description: "Use on unlimited websites",
  },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
] as const;

export const ITEMS_PER_PAGE = 12;

export const CURRENCIES = {
  INR: { symbol: "₹", code: "INR", name: "Indian Rupee" },
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
} as const;

export type Currency = keyof typeof CURRENCIES;
export type ProductType = (typeof PRODUCT_TYPES)[number]["value"];
export type LicenseType = (typeof LICENSE_TYPES)[number]["value"];
export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
export type MembershipPlan = keyof typeof MEMBERSHIP_PLANS;
