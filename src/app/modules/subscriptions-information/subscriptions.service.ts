import Stripe from 'stripe';
import AppError from '../../../errors/AppError';
import { config } from '../../config';
import stripe from '../../config/stripe';
import { User } from '../auth/user.model';
import { Package } from '../package/package.model';
import { ISubscription } from './subscriptions.interface';
import { Subscription } from './subscriptions.model';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose'; 
// import { ISubscription } from './subscription.interface';
// import { Subscription } from './subscription.model';
// import stripe from '../../../config/stripe';
// import { User } from '../user/user.model';
// import { StatusCodes } from 'http-status-codes';
// import AppError from '../../../errors/AppError';
// import config from '../../../config';

const subscriptionDetailsFromDB = async (id: string): Promise<{ subscription: ISubscription | {} }> => {
     const subscription = await Subscription.findOne({ userId: id }).populate('package', 'title credit duration').lean();

     if (!subscription) {
          return { subscription: {} }; // Return empty object if no subscription found
     }

     const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);

     // Check subscription status and update database accordingly
     if (subscriptionFromStripe?.status !== 'active') {
          await Promise.all([User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }), Subscription.findOneAndUpdate({ user: id }, { status: 'expired' }, { new: true })]);
     }

     return { subscription };
};

const companySubscriptionDetailsFromDB = async (id: string): Promise<{ subscription: ISubscription | {} }> => {
     const subscription = await Subscription.findOne({ userId: id }).populate('package', 'title credit').lean();
     if (!subscription) {
          return { subscription: {} }; // Return empty object if no subscription found
     }

     const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);

     // Check subscription status and update database accordingly
     if (subscriptionFromStripe?.status !== 'active') {
          await Promise.all([User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }), Subscription.findOneAndUpdate({ user: id }, { status: 'expired' }, { new: true })]);
     }

     return { subscription };
};

const subscriptionsFromDB = async (query: Record<string, unknown>): Promise<ISubscription[]> => {
     const conditions: any[] = [];

     const { searchTerm, limit, page, paymentType } = query;

     // Handle search term - search in both package title and user details
     if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
          const trimmedSearchTerm = searchTerm.trim();

          // Find matching packages by title or paymentType
          const matchingPackageIds = await Package.find({
               $or: [{ title: { $regex: trimmedSearchTerm, $options: 'i' } }, { paymentType: { $regex: trimmedSearchTerm, $options: 'i' } }],
          }).distinct('_id');

          // Find matching users by email, name, company, etc.
          const matchingUserIds = await User.find({
               $or: [
                    { email: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { name: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { company: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { contact: { $regex: trimmedSearchTerm, $options: 'i' } },
               ],
          }).distinct('_id');

          // Create search conditions
          const searchConditions = [];

          if (matchingPackageIds.length > 0) {
               searchConditions.push({ package: { $in: matchingPackageIds } });
          }

          if (matchingUserIds.length > 0) {
               searchConditions.push({ userId: { $in: matchingUserIds } });
          }

          // Only add search condition if we found matching packages or users
          if (searchConditions.length > 0) {
               conditions.push({ $or: searchConditions });
          } else {
               // If no matches found, return empty result early
               return {
                    data: [],
                    meta: {
                         page: parseInt(page as string) || 1,
                         total: 0,
                    },
               } as any;
          }
     }

     // Handle payment type filter
     if (paymentType && typeof paymentType === 'string' && paymentType.trim()) {
          const packageIdsWithPaymentType = await Package.find({
               paymentType: paymentType.trim(),
          }).distinct('_id');

          if (packageIdsWithPaymentType.length > 0) {
               conditions.push({ package: { $in: packageIdsWithPaymentType } });
          } else {
               // If no packages match the payment type, return empty result
               return {
                    data: [],
                    meta: {
                         page: parseInt(page as string) || 1,
                         total: 0,
                    },
               } as any;
          }
     }

     // Build final query conditions
     const whereConditions = conditions.length > 0 ? { $and: conditions } : {};

     // Pagination
     const pages = Math.max(1, parseInt(page as string) || 1);
     const size = Math.max(1, Math.min(100, parseInt(limit as string) || 10)); // Limit max size
     const skip = (pages - 1) * size;

     try {
          // Execute query with population
          const result = await Subscription.find(whereConditions)
               .populate([
                    {
                         path: 'package',
                         select: 'title paymentType credit description',
                    },
                    {
                         path: 'userId',
                         select: 'email name linkedIn contact company website',
                    },
               ])
               .select('userId package price trxId currentPeriodStart currentPeriodEnd status createdAt updatedAt')
               .sort({ createdAt: -1 }) // Add sorting by creation date
               .skip(skip)
               .limit(size)
               .lean(); // Use lean() for better performance

          // Get total count for pagination
          const count = await Subscription.countDocuments(whereConditions);

          const data: any = {
               data: result,
               meta: {
                    page: pages,
                    limit: size,
                    total: count,
                    totalPages: Math.ceil(count / size),
               },
          };

          return data;
     } catch (error) {
          console.error('Error fetching subscriptions:', error);
          throw new Error('Failed to fetch subscriptions');
     }
};







// export const createSubscriptionCheckoutSession = async (userId: string, packageId: string) => {
//     // 1️⃣ Check if the package exists and is active
//     const isExistPackage = await Package.findOne({
//         _id: packageId,
//         status: 'active',
//     });

//     if (!isExistPackage) {
//         throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
//     }

//     // 2️⃣ Find the user
//     let user = await User.findById(userId).select('+stripeCustomerId');
//     if (!user) {
//         throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
//     }

//     // 3️⃣ If stripeCustomerId is missing, create it
//     if (!user.stripeCustomerId) {
//         const customer = await stripe.customers.create({
//             email: user.email,
//             name: `${user.firstName || ''} ${user.lastName || ''}`,
//         });

//         user.stripeCustomerId = customer.id;
//         await user.save();
//     }

//     // 4️⃣ Create Stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//         mode: 'subscription',
//         customer: String(user.stripeCustomerId),
//         line_items: [
//             {
//                 price: String(isExistPackage.priceId),
//                 quantity: 1,
//             },
//         ],
//         metadata: {
//             userId: String(user._id),
//             subscriptionId: String(isExistPackage._id),
//         },
//         success_url: `${config.backend_url}/api/v1/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${config.backend_url}/api/v1/subscription/cancel`,
//     });

//     // 5️⃣ Return session info
//     return {
//         url: session.url,
//         sessionId: session.id,
//     };
// };





export const createSubscriptionCheckoutSession = async (userId: string, packageId: string) => {
    // 1️⃣ Check package exists
    const packageDoc = await Package.findOne({ _id: packageId, status: 'active' });
    if (!packageDoc) throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');

    // 2️⃣ Find user
    const user = await User.findById(userId).select('+stripeCustomerId');
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

    // 3️⃣ Create stripe customer if missing
    if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`,
        });
        user.stripeCustomerId = customer.id;
        await user.save();
    }

    // 4️⃣ Create checkout session
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: String(user.stripeCustomerId),
        line_items: [{ price: String(packageDoc.priceId), quantity: 1 }],
        metadata: {
            userId: String(user._id), // MongoDB ObjectId string
            subscriptionId: String(packageDoc._id),
        },
        success_url: `${config.backend_url}/api/v1/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.backend_url}/api/v1/subscription/cancel`,
    });

    return { url: session.url, sessionId: session.id };
};












const upgradeSubscriptionToDB = async (userId: string, packageId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: 'active',
     });

     if (!activeSubscription || !activeSubscription.subscriptionId) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'No active subscription found to upgrade');
     }

     const packageDoc = await Package.findById(packageId);

     if (!packageDoc || !packageDoc.priceId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found or missing Stripe Price ID');
     }

     const user = await User.findById(userId).select('+stripeCustomerId');

     if (!user || !user.stripeCustomerId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     const stripeSubscription = await stripe.subscriptions.retrieve(activeSubscription.subscriptionId);
     console.log(stripeSubscription, 'this is stripe subscription existing');

     await stripe.subscriptions.update(activeSubscription.subscriptionId, {
          items: [
               {
                    id: stripeSubscription.items.data[0].id,
                    price: packageDoc.priceId,
               },
          ],
          proration_behavior: 'create_prorations',
          metadata: {
               userId,
               packageId: packageDoc._id.toString(),
          },
     });
     console.log(' thsi is stripe subscription updated');
     const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: config.frontend_url,
          flow_data: {
               type: 'subscription_update',
               subscription_update: {
                    subscription: activeSubscription.subscriptionId,
               },
          },
     });

     return {
          url: portalSession.url,
     };
};
const cancelSubscriptionToDB = async (userId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: 'active',
     });
     if (!activeSubscription || !activeSubscription.subscriptionId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No active subscription found to cancel');
     }

     await stripe.subscriptions.cancel(activeSubscription.subscriptionId);

     await Subscription.findOneAndUpdate({ userId, status: 'active' }, { status: 'canceled' }, { new: true });

     return { success: true, message: 'Subscription canceled successfully' };
};
// const successMessage = async (id: string) => {
//      const session = await stripe.checkout.sessions.retrieve(id);
//      return session;
// };



// export const saveSubscriptionToDB = async (userId: string, sessionId: string) => {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     if (!session || session.payment_status !== 'paid') {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Payment not completed');
//     }

//     if (!session.subscription) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription not created yet');
//     }

//     // Retrieve Stripe subscription
//     const stripeSubscription = typeof session.subscription === 'string'
//         ? await stripe.subscriptions.retrieve(session.subscription)
//         : session.subscription;

//     // TypeScript safe cast
//     const subscriptionTyped: Stripe.Subscription = stripeSubscription as unknown as Stripe.Subscription;

//     // Retrieve package
//     const packageDoc = await Package.findById(session.metadata?.subscriptionId);
//     if (!packageDoc) throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');

//     // Calculate remaining days
//     const durationMap: Record<string, number> = {
//         '1 month': 30,
//         '3 months': 90,
//         '6 months': 180,
//         '1 year': 365,
//     };
//     const remainingDays = durationMap[packageDoc.duration] || 30;

//     // Convert Stripe period timestamps
//     const currentPeriodStart = subscriptionTyped.current_period_start
//         ? new Date(subscriptionTyped.current_period_start * 1000)
//         : null;

//     const currentPeriodEnd = subscriptionTyped.current_period_end
//         ? new Date(subscriptionTyped.current_period_end * 1000)
//         : null;

//     // Save to MongoDB
//     return await Subscription.create({
//         userId,
//         package: packageDoc._id,
//         price: packageDoc.price,
//         subscriptionId: subscriptionTyped.id,
//         currentPeriodStart,
//         currentPeriodEnd,
//         remaining: remainingDays,
//         status: 'active',
//         customerId: subscriptionTyped.customer,
//     });
// };

interface MyStripeSubscription extends Stripe.Subscription {
    current_period_start?: number;
    current_period_end?: number;
}

export const saveSubscriptionToDB = async (sessionId: string) => {
    // 1️⃣ Retrieve Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Payment not completed');
    }

    if (!session.subscription) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription not created yet');
    }

    // 2️⃣ Retrieve userId
    const userId = session.metadata?.userId;
    if (!userId) throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');

    const user = await User.findById(userId);
    if (!user) throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');

    // 3️⃣ Retrieve Stripe subscription
    const stripeSubscriptionRaw = typeof session.subscription === 'string'
        ? await stripe.subscriptions.retrieve(session.subscription)
        : session.subscription;

    const stripeSubscription = stripeSubscriptionRaw as MyStripeSubscription;

    if (!stripeSubscription.id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Stripe subscription ID is missing');
    }

    // 4️⃣ Retrieve package
    const packageDoc = await Package.findById(session.metadata?.subscriptionId);
    if (!packageDoc) throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');

    // 5️⃣ Calculate remaining days
    const durationMap: Record<string, number> = {
        '1 month': 30,
        '3 months': 90,
        '6 months': 180,
        '1 year': 365,
    };
    const remainingDays = durationMap[packageDoc.duration] || 30;

    // 6️⃣ Convert timestamps safely
    const currentPeriodStart = stripeSubscription.current_period_start
        ? new Date(stripeSubscription.current_period_start * 1000)
        : new Date(); // fallback now

    const currentPeriodEnd = stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : new Date(currentPeriodStart.getTime() + remainingDays * 24 * 60 * 60 * 1000);

    // 7️⃣ Save subscription
    const subscription = await Subscription.create({
        userId: user._id,
        package: packageDoc._id,
        price: packageDoc.price,
        subscriptionId: stripeSubscription.id,
        currentPeriodStart,
        currentPeriodEnd,
        remaining: remainingDays,
        status: 'active',
        customerId: stripeSubscription.customer,
    });

    return subscription;
};




const getMonthlyEarningsStats = async () => {
  const stats = await Subscription.aggregate([
    {
      $match: {
        status: 'active' // বা 'paid'
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalEarnings: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  return stats.map(item => ({
    month: item._id,
    total: item.totalEarnings
  }));
};






















export const SubscriptionService = {
     subscriptionDetailsFromDB,
     subscriptionsFromDB,
     companySubscriptionDetailsFromDB,
     createSubscriptionCheckoutSession,
     upgradeSubscriptionToDB,
     cancelSubscriptionToDB,
     // successMessage,
     saveSubscriptionToDB,
     getMonthlyEarningsStats,
};
