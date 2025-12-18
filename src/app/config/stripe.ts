

import { config } from '../config';
import Stripe from 'stripe';



const stripe = new Stripe(config.stripe_secret_key as string);

export default stripe;
