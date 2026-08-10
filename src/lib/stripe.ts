import { loadStripe } from '@stripe/stripe-js';
import { PLANS } from '@/src/lib/plans';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

export const getStripe = () => {
  if (!stripePublicKey) {
    console.warn('Stripe public key missing.');
    return null;
  }
  return loadStripe(stripePublicKey);
};

export { PLANS };