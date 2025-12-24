import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from 'http-status-codes';
import { saveSubscriptionToDB, SubscriptionService } from "./subscriptions.service";
import AppError from "../../../errors/AppError";

const subscriptions = catchAsync(async (req, res) => {
     const result = await SubscriptionService.subscriptionsFromDB(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Subscription list retrieved successfully',
          data: result,
     });
});

const subscriptionDetails = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await SubscriptionService.subscriptionDetailsFromDB(id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Subscription details retrieved successfully',
          data: result.subscription,
     });
});

const cancelSubscription = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await SubscriptionService.cancelSubscriptionToDB(id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Cancel subscription successfully',
          data: result,
     });
});
// create checkout session
const createCheckoutSession = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const packageId = req.params.id;
     const result = await SubscriptionService.createSubscriptionCheckoutSession(id, packageId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Create checkout session successfully',
          data: {
               sessionId: result.sessionId,
               url: result.url,
          },
     });
});
// update subscriptions
const updateSubscription = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const packageId = req.params.id;
     const result = await SubscriptionService.upgradeSubscriptionToDB(id, packageId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Update checkout session successfully',
          data: {
               url: result.url,
          },
     });
});


// const orderSuccess = catchAsync(async (req, res) => {
//      const sessionId = req.query.session_id as string;
//      const session = await SubscriptionService.successMessage(sessionId);
//      res.render('success', { session });
// });




// Assuming you have OrderServices imported properly
const orderCancel = catchAsync(async (req, res) => {
     res.render('cancel');
});
















// Controller for Stripe checkout success
export const checkoutSuccessController = catchAsync(async (req, res ) => {
    const sessionId = req.query.session_id as string;
    const userId = req.user?.id;

    if (!sessionId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Session ID is required');
    }

    if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');
    }

    // Save subscription in DB
    const subscription = await saveSubscriptionToDB(userId, sessionId);

    // Send response
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Subscription created successfully',
        data: subscription,
    });
});















export const SubscriptionController = {
     subscriptions,
     subscriptionDetails,
     createCheckoutSession,
     updateSubscription,
     cancelSubscription,
     // orderSuccess,
     orderCancel,
};
