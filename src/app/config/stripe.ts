

import { config } from '../config';
import Stripe from 'stripe';

if (!config.stripe_secret_key) {
  throw new Error('Stripe secret key is missing');
}

const stripe = new Stripe(config.stripe_secret_key as string);

export default stripe;
