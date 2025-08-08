import { loadStripe } from '@stripe/stripe-js';

// デモ用のStripe公開キー（実際の決済は行われません）
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key');

export default stripePromise; 