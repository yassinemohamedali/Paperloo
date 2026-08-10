export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    limit: 5,
    features: ['Up to 5 sites', 'Standard documents', 'Email alerts'],
    stripePriceId: 'price_starter_monthly',
    period: '/mo',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 49,
    limit: 25,
    features: ['Up to 25 sites', 'Custom branding', 'Priority alerts', 'Team members'],
    stripePriceId: 'price_agency_monthly',
    popular: true,
    period: '/mo',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 99,
    limit: 999,
    features: ['Unlimited sites', 'White-label hosting', 'API access', 'Dedicated support'],
    stripePriceId: 'price_scale_monthly',
    period: '/mo',
  }
];