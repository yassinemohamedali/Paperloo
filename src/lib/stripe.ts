import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

export const getStripe = () => {
  if (!stripePublicKey) {
    console.warn('Stripe public key missing.');
    return null;
  }
  return loadStripe(stripePublicKey);
};

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    limit: 5,
    features: ['Up to 5 sites', 'Standard documents', 'Email alerts']
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 49,
    limit: 25,
    features: ['Up to 25 sites', 'Custom branding', 'Priority alerts', 'Team members']
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 99,
    limit: 999,
    features: ['Unlimited sites', 'White-label hosting', 'API access', 'Dedicated support']
  }
];
