// import { Model, Types } from 'mongoose';

// export type ISubscription = {
//      customerId: string;
//      price: number;
//      userId: Types.ObjectId;
//      package: Types.ObjectId;
//      trxId: string;
//      remaining: number;
//      subscriptionId: string;
//      status: 'expired' | 'active' | 'cancel';
//      currentPeriodStart: string;
//      currentPeriodEnd: string;
// };

// export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;

import { Model, Types } from 'mongoose';

export type ISubscription = {
     customerId: string;
     price: number;
     userId: Types.ObjectId;
     package: Types.ObjectId;
     trxId?: string; // optional, যদি সব সময় থাকে না
     remaining: number;
     subscriptionId: string;
     stripeSubscriptionId: string;
     status: 'expired' | 'active' | 'cancel' | 'deactivated';
     currentPeriodStart: Date;  // <-- Date type
     currentPeriodEnd: Date;    // <-- Date type
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;