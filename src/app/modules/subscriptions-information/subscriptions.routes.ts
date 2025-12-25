import express from 'express';
import { auth, isAdmin } from '../../middleware/auth.middleware';
import { checkoutSuccessController, SubscriptionController } from './subscriptions.controller';

const router = express.Router();
//USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN
router.get('/', auth, SubscriptionController.subscriptions);

router.get('/details', auth, SubscriptionController.subscriptionDetails);
// router.get('/success', SubscriptionController.orderSuccess);
router.get('/subscription/success', auth, checkoutSuccessController);
router.get('/cancel', SubscriptionController.orderCancel);
router.post('/create-checkout-session/:id', auth, SubscriptionController.createCheckoutSession);
router.post('/update/:id', auth, SubscriptionController.updateSubscription);
router.delete('/subscription/cancel/:id', auth, SubscriptionController.cancelSubscription);
router.get('/earnings/monthly',auth,isAdmin,SubscriptionController.getMonthlyEarnings);




export const SubscriptionRoutes = router;
