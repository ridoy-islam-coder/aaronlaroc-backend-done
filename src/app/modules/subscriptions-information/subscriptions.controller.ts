import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

import { getMonthlyRevenueService, saveSubscriptionToDB, SubscriptionService } from "./subscriptions.service";
import AppError from "../../../errors/AppError";
import { StatusCodes } from "http-status-codes";

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





// Assuming you have OrderServices imported properly
const orderCancel = catchAsync(async (req, res) => {
     res.render('cancel');
});
















// Controller for Stripe checkout success
export const checkoutSuccessController = catchAsync(async (req, res ) => {
    const sessionId = req.query.session_id as string;
//     const userId = req.user?.id;

    if (!sessionId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Session ID is required');
    }

//     if (!userId) {
//         throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');
//     }

    // Save subscription in DB   userId
    const subscription = await saveSubscriptionToDB(sessionId);
  
    // Send response
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Subscription created successfully',
//         data: subscription,
//     });
// 

     res.render('subscription-success', { subscription });


});






 const monthlyEarningsStats = catchAsync(async (req, res) => {
          const year = Number(req.query.year) || new Date().getFullYear();

          const result =
               await SubscriptionService.getMonthlyEarningsStatsFromDB(year);

          sendResponse(res, {
               statusCode: StatusCodes.OK,
               success: true,
               message: 'Monthly earnings stats retrieved successfully',
               data: result,
          });
     }
);






export const getMonthlyRevenueController = catchAsync(async (req, res) => {
    const revenueData = await getMonthlyRevenueService();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Monthly revenue fetched successfully",
        data: revenueData,
    });
});

export const SubscriptionController = {
     subscriptions,
     subscriptionDetails,
     createCheckoutSession,
     updateSubscription,
     cancelSubscription,
     getMonthlyRevenueController,
     // orderSuccess,
     orderCancel,
     monthlyEarningsStats,
  
};
