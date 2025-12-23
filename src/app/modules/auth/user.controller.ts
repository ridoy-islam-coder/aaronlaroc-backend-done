import { NextFunction, Request, Response } from "express";
import { adminEmailService, codeVerification, deleteUserService, existingUser,   getAllOwnUserDataService,   getAllUserDataService,  getallUsers, getCountsService, getNewUsersLast10DaysService, getprofileService, getProxysetData, getUserFullProfileService, getUserList,getUsersWhoAddedMeAsProxyService,getUsersWhoSetMyProxyService,LoginInUser, profileupdateService, ProxysetService, searchUsersService,  updatePassword, updateUserService, UserAnalysisService } from "./user.service";
import { ProxyUser } from "./user.interface";







export const registerUser = async (req:Request, res:Response, next:NextFunction) => {

    try{
      const { phoneNumber, email, password } = req.body;

      if (!phoneNumber || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

     const user = await existingUser(phoneNumber, email, password);

   


return res.status(201).json({success: true,message: "User registered successfully",statusCode: 201, data: { _id: user._id ,phoneNumber: user.phoneNumber,email: user.email,role: user.role,},meta: null});


    }catch(error){
        next(error);
    }



}





export const loginUser = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const { user,token} = await LoginInUser(email, password);

    

      return res.status(200).json({ success: true, message: "User logged in successfully",statusCode: 200, data: {_id: user._id,phoneNumber: user.phoneNumber, email: user.email, role: user.role, token: token },
     meta: null
      });


    }catch(error){
        next(error);
    }
}   




export const GetProfileData=async (req:Request,res:Response) => {
  
    let result = await getprofileService(req);
    res.json(result);

}


export const ProfileUpdate=async (req:Request,res:Response) => {
  
    let result = await profileupdateService(req);
    res.json(result);

}



export const GetAllProfile=async (req:Request,res:Response) => {
  
    let result = await getallUsers();
    res.json(result);

}



export const searchUsersController = async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm as string;

  if (!searchTerm || typeof searchTerm !== "string") {
    return res.status(400).json({ message: "Search term is required and must be a string" });
  }

  try {
    const users = await searchUsersService(searchTerm);

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Search results successfully fetched",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ status: "failed", data: error });
  }
};











export const ProxysetController = async (req: Request, res: Response) => {
  const result = await ProxysetService(req);
  return res.json(result);
};



export const getAllProxysetController = async (req: Request, res: Response) => {
  const { id } = req.params; 
  const result = await getProxysetData(id);
  return res.json(result);
};










export const alldatapercentage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userProfile = await getUserFullProfileService(userId);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};









export const  AdminEmail = async (req: Request, res: Response) => {
  const result = await adminEmailService(req);
  return res.json(result);
};






export const codeverify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and otp are required" });
    }

    const result = await codeVerification(email, otp);
    console.log(result);

    return res.json({ status: "success", message: result.message });
  } catch (error) {
    next(error);
  }
};








export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    // If OTP is "0" or not provided, skip verification
    if (otp !== "0" && otp) {
      const result = await codeVerification(email, otp);
      if(result.message !== "Code verified successfully"){
        return res.status(400).json({ message: result.message });
      }
    }

    await updatePassword(email, password);
    return res.json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};





export const UserList = async (req: Request, res: Response): Promise<void> => {
  try {
    const pageNo = Number(req.params.pageNo);
    const perPage = Number(req.params.perPage);
    const searchKeyword = req.params.searchKeyword;

    const data = await getUserList(pageNo, perPage, searchKeyword);

    res.status(200).json({ status: "success", data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};







export const getNewUsersLast10Days = async (req: Request, res: Response) => {
  try {
    const newUserCount = await getNewUsersLast10DaysService();

    return res.status(200).json({
      success: true,
      message: "Last 10 days new user count fetched successfully",
      count: newUserCount,
    });
  } catch (error) {
    console.error("Error counting last 10 days users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while counting last 10 days users",
    });
  }
};






    export const updateUserController = async (req:Request,res:Response) => {
    let result = await updateUserService(req);
    res.json(result);

    }


    
    export const deleteUserController = async (req:Request,res:Response) => {
    let result = await deleteUserService(req);
    res.json(result);

    }




export const getCounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getCountsService(req);

    if (result.status) {
      res.status(200).json({ status: "success", data: result.data });
    } else {
      res.status(500).json({ status: "error", message: "Failed to fetch counts", error: result.data });
    }
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
};










export class UserAnalysisController {
  static async getAnalysis(req: Request, res: Response) {
    try {
      const daily = await UserAnalysisService.getDailyAnalysis();
      const monthly = await UserAnalysisService.getMonthlyAnalysis();
      const yearly = await UserAnalysisService.getYearlyAnalysis();

      res.json({
        success: true,
        daily,
        monthly,
        yearly
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}











//proxysetId  data 


export const getAllOwnUserDataController = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?.id;

    const data = await getAllOwnUserDataService(loggedInUserId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const getAllUserDataController = async (req: Request, res: Response) => {
  try {
    const requestedUserId = req.params.userId;
    const loggedInUserId = req.user?.id; 

    const data = await getAllUserDataService(requestedUserId, loggedInUserId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {

    if (error.message === "ACCESS_DENIED") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }


    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getUsersWhoAddedMeAsProxyController = async (
  req: Request,
  res: Response
) => {
  try {
    const myUserId = req.user?.id;

    const users = await getUsersWhoAddedMeAsProxyService(myUserId);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




export const getUsersWhoSetMyProxy = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const myUserId = req.user?.id;

    if (!myUserId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
      return;
    }

    const result = await getUsersWhoSetMyProxyService(myUserId);

    if (!result.status) {
      res.status(500).json({
        status: "error",
        message: "Failed to fetch users"
      });
      return;
    }

    res.status(200).json({
      status: "success",
      total: result.data.length,
      data: result.data
    });

    // এখানে আর return করা হয়নি → void safe
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


