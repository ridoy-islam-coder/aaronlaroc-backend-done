import { Request } from "express";
import { SocialInfoModel } from "./social.model";



// export const SocialInformationService = async (req:Request) => {
//   try {
//        let user_id = req.user?.id;
//         let requestBody = req.body;
//         requestBody.userID = user_id;

//       await SocialInfoModel.findOneAndUpdate({userID: user_id}, requestBody, {upsert: true, new: true})
    
//         return ({status:"success",message:"Financial Update successfully" })

//   } catch (error) {
//     return {status:'failed', data: error};
//   }
// }



export const SocialInformationService = async (req: Request) => {
  try {
    let user_id = req.user?.id;
    let requestBody = req.body;
    requestBody.userID = user_id;
    
    // Token middleware থেকে আসে
    const token = req.headers.authorization?.split(" ")[1] || null;

    // Define all required fields for medical data
    const allFields = [
      requestBody.socialMedia,
      requestBody.website,
      requestBody.streamingService
     
    ];

    // Count how many fields are filled (non-null, non-empty)
    const filledFields = allFields.filter(field => field && field.trim() !== "").length;

    // Calculate percentage completeness (based on number of fields filled)
    const totalFields = allFields.length;
    const completenessPercentage = (filledFields / totalFields) * 100;

    // Update medical data and include completeness percentage
    const updatedMedicalData = await SocialInfoModel.findOneAndUpdate(
      { userID: user_id },
         { 
        ...requestBody, 
        socialInfoPercentage: completenessPercentage  // ✅ fixed
      },
      { upsert: true, new: true }
    );

    return {
      status: "success",
      message: `Medical data updated successfully ${completenessPercentage.toFixed(2)}%`,
      socialInfoPercentage: completenessPercentage.toFixed(2),  // Percentage result
      updatedMedicalData,
      token: token
     
    };
  } catch (error) {
    return { status: 'failed', data: error,};
  }
};






export const SocialGetService = async (req: Request) => {
  try {

    const user_id = req.user?.id;

    if (!user_id) {
      return { status: "failed", message: "Unauthorized" };
    }


    const financialData = await SocialInfoModel.findOne(
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
