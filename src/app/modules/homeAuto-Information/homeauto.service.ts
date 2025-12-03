import { Request } from "express";
import { HomeAutoModel } from "./homeauto.model";




// export const HomeAutoService = async (req:Request) => {
//   try {
//        let user_id = req.user?.id;
//         let requestBody = req.body;
//         requestBody.userID = user_id;
//         await HomeAutoModel.findOneAndUpdate({userID: user_id}, requestBody, {upsert: true, new: true})
//         return ({status:"success",message:"HomeAuto Update successfully"})

//   } catch (error) {
//     return {status:'failed', data: error};
//   }
// }






export const HomeAutoService = async (req: Request) => {
  try {
    let user_id = req.user?.id;
    let requestBody = req.body;
    requestBody.userID = user_id;
    // Token middleware থেকে আসে
    const token = req.headers.authorization?.split(" ")[1] || null;

    const allFields = [
      requestBody.vehicleOwnership,
      requestBody.vehicleMakeModel,
      requestBody.hasCarInsurance,
      requestBody.carInsuranceProvider,
      requestBody.hasPowerToys,
      requestBody.powerToyTypes,
      requestBody.homeOccupancy,
      requestBody.hasHomeInsurance,
      requestBody.homeInsuranceType
    ];

    const filledFields = allFields.filter(field => {

      if (typeof field === 'string') {
        return field.trim() !== "";  
      } else {

        return field !== undefined && field !== null && field !== "";
      }
    }).length;

   
    const totalFields = allFields.length;
    const completenessPercentage = (filledFields / totalFields) * 100;

   
    const updatedMedicalData = await HomeAutoModel.findOneAndUpdate(
      { userID: user_id },
      { 
        ...requestBody, 
        homeautoPercentage: completenessPercentage  // ✅ fixed
      },
      { upsert: true, new: true }
    );

    return {
      status: "success",
      message: `HomeAuto data updated successfully ${completenessPercentage.toFixed(2)}%`,
      homeautoPercentage: completenessPercentage.toFixed(2),  // Percentage result
      updatedMedicalData,
      token: token
    };
  } catch (error) {
    console.error('Error:', error);  // Log the error to debug
    return { status: 'failed', data: error };
  }
};





