import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import { checkoutSuccessController, SubscriptionController } from './subscriptions.controller';

const router = express.Router();
//USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN
router.get('/', auth, SubscriptionController.subscriptions);

router.get('/details', auth, SubscriptionController.subscriptionDetails);
// router.get('/success', SubscriptionController.orderSuccess);
router.get('/success', auth, checkoutSuccessController);
router.get('/cancel', SubscriptionController.orderCancel);
router.post('/create-checkout-session/:id', auth, SubscriptionController.createCheckoutSession);
router.post('/update/:id', auth, SubscriptionController.updateSubscription);
router.delete('/cancel/:id', auth, SubscriptionController.cancelSubscription);

export const SubscriptionRoutes = router;
