
import { User } from "../auth/user.model";
import { HomeAutoModel } from "../homeAuto-Information/homeauto.model";
import { MedicalModel } from "../medical-Information/medical.model";
import { SocialInfoModel } from "../social-Information/social.model";
import { FinancialModel } from "./financial.model";
import { Request } from "express";





// export const FinancialCreateService = async (req:Request) => {
//   try {
//        let user_id = req.user?.id;
//         let requestBody = req.body;
//         requestBody.userID = user_id;
//         await FinancialModel.create(requestBody)
//         return ({status:"success",message:"Financial Create successfully"})

//   } catch (error) {
//     return {status:'failed', data: error};
//   }
// }





export const FinancialUpdateService = async (req: Request) => {
  try {
    const user_id = req.user?.id;
    const requestBody = req.body;
    requestBody.userID = user_id;
     
    const token = req.headers.authorization?.split(" ")[1] || null;
 
    const allFields = [
      requestBody.bankAccount,
      requestBody.retirementAccount,
      requestBody.currentAssets,
      requestBody.debt,
    ];

  
    const filledFields = allFields.filter(
      (field) => typeof field === "string" && field.trim() !== ""
    ).length;

    const totalFields = allFields.length;
    const completenessPercentage = (filledFields / totalFields) * 100;

    const updatedFinancialData = await FinancialModel.findOneAndUpdate(
      { userID: user_id },
      { 
        ...requestBody, 
        financialPercentage: completenessPercentage  
      },
      { upsert: true, new: true }
    );

    return {
      status: "success",
      message: `Financial data updated successfully (${completenessPercentage.toFixed(2)}%)`,
      financialPercentage: completenessPercentage.toFixed(2),
      updatedFinancialData,
      token: token
    };
  } catch (error: any) {
    return { status: "failed", message: error.message };
  }
};






export const FinancialGetService = async (req: Request) => {
  try {

    const user_id = req.user?.id;

    if (!user_id) {
      return { status: "failed", message: "Unauthorized" };
    }


    const financialData = await FinancialModel.findOne(
      { userID: user_id },
      "-createdAt -updatedAt"
    );

    if (!financialData) {
      return { status: "failed", message: "No financial data found" };
    }

    return {
      status: "success",
      data: financialData,
    };
  } catch (error: any) {
    return { status: "failed", message: error.message };
  }
};



























export const shareUserDataWithProxyset = async (userId: string) => {
  try {
    // ১. মূল user fetch + প্রয়োজনীয় fields
    const user = await User.findById(userId).select(
      "email firstName lastName proxysetId city dateOfBirth phoneNumber yearStarted company state"
    );
    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // ২. Proxyset check
    if (!user.proxysetId || user.proxysetId.length === 0) {
      return { status: "failed", message: "No proxyset users found" };
    }

    // ৩. Proxyset-related data fetch (exclude createdAt, updatedAt)
    const financialData = await FinancialModel.find(
      { userID: { $in: user.proxysetId } },
      "-createdAt -updatedAt -__v"
    );



    const medicalData = await MedicalModel.find(
      { userID: { $in: user.proxysetId } },
      "-createdAt -updatedAt -__v"
    );

    const HomeAutoData = await HomeAutoModel.find(
      { userID: { $in: user.proxysetId } },
      "-createdAt -updatedAt -__v"
    );

    const SocialInfoData = await SocialInfoModel.find(
      { userID: { $in: user.proxysetId } },
      "-createdAt -updatedAt -__v"
    );




    if (
      financialData.length === 0 &&
      medicalData.length === 0 &&
      HomeAutoData.length === 0 &&
      SocialInfoData.length === 0
    ) {
      return { status: "failed", message: "No data found" };
    }

    // ৪. Proxyset users info (exclude timestamps)
    const proxysetUsers = await User.find(
      { _id: { $in: user.proxysetId } }
    ).select("email firstName lastName");

    proxysetUsers.forEach((proxyUser) => {
      console.log(`Shared data with ${proxyUser.email}`);
    });

    // ৫. Return combined data including caller user details
    return {
      status: "success",
      callerUser: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        yearStarted: user.yearStarted,
        company: user.company,
        state: user.state
      },
      financialData,
      medicalData,
      HomeAutoData,
      SocialInfoData,
      proxysetUsers
    };
  } catch (error) {
    return { status: "failed", data: error };
  }
};




// export interface CallerUserData {
//   id: string;
//   email: string;
//   phoneNumber?: string;
// }

// export interface ShareFinancialResponse {
//   status: "success" | "error";
//   callerUser?: CallerUserData;
//   financialData?: any[];
//   medicalData?: any[];
//   HomeAutoData?: any[];
//   SocialInfoData?: any[];
//   proxysetUsers?: { _id: string; email: string }[];
//   message?: string;
//   error?: any;
// }

// export const getFinancialDataForUser = async (
//   userId: string
// ): Promise<ShareFinancialResponse> => {
//   try {
//     // 1️⃣ caller user find
//     const user = await User.findById(userId).select("-password -__v");
//     if (!user) {
//       return { status: "error", message: "User not found" };
//     }

//     // 2️⃣ caller own financial data
//     const callerFinancialData = await FinancialModel.find(
//       { userID: user._id },
//       "-createdAt -updatedAt -__v"
//     );

//     // 3️⃣ caller own medical data
//     const callerMedicalData = await MedicalModel.find(
//       { userID: user._id },
//       "-createdAt -updatedAt -__v"
//     );

//     // 4️⃣ caller own home auto data
//     const callerHomeAutoData = await HomeAutoModel.find(
//       { userID: user._id },
//       "-createdAt -updatedAt -__v"
//     );

//     // 5️⃣ caller own social info data
//     const callerSocialInfoData = await SocialInfoModel.find(
//       { userID: user._id },
//       "-createdAt -updatedAt -__v"
//     );

//     // 6️⃣ proxyset users (only list, no data)
//     const proxysetUsers = await User.find(
//       { _id: { $in: user.proxysetId || [] } },
//       "_id email"
//     );

//     return {
//       status: "success",
//       callerUser: {
//         id: user._id.toString(),
//         email: user.email,
//         phoneNumber: user.phoneNumber,
//       },
//       financialData: callerFinancialData,
//       medicalData: callerMedicalData,
//       HomeAutoData: callerHomeAutoData,
//       SocialInfoData: callerSocialInfoData,
//       proxysetUsers: proxysetUsers.map((p) => ({
//         _id: p._id.toString(),
//         email: p.email,
//       })),
//     };
//   } catch (error) {
//     console.error("Error in getFinancialDataForUser:", error);
//     return { status: "error", message: "Server error", error };
//   }
// };