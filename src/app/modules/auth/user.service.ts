import { User } from "./user.model";
import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";
import { config } from './../../config/index';
import {  Request } from "express";
import mongoose, { Types } from 'mongoose';
import { SendEmail } from "../../../helpers/emailHelper";
import { ReportModel } from "../report-Information/report.model";
import { FinancialModel } from "../financial-Information/financial.model";
import { MedicalModel } from "../medical-Information/medical.model";
import { HomeAutoModel } from "../homeAuto-Information/homeauto.model";
import { Model } from "mongoose";


type PipelineStage = any;

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id?: string;
        [key: string]: any;
      };
    }
  }
}


 export const existingUser=async (phoneNumber: string, email: string, password: string) => {
    // Check if user already exists
    const user = await User.findOne({ $or: [{ phoneNumber }, { email }] });
    if (user) {
        throw new Error("User already exists");
    }

    const hsedpassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ phoneNumber, email, password:hsedpassword });
    await newUser.save();

    return newUser;

}



export const LoginInUser = async (email: string, password: string) => {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

  


// Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid password");
    }

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        config.jwt_secret as string, { expiresIn: "30d" }
    );

    return {
       user,token
    };
}




export const getprofileService =async (req:Request) => {
  try {

    let user_id=req.user?.id;
    let data=await User.findOne({"_id":user_id})
    return ({status:"success",message:"User profile successfully",data:data})
  } catch (error) {
    return {status:'failed', data: error};
  }
}





export const profileupdateService =async (req:Request) => {
  try {

        let reqBody=req.body;
        let user_id=req.user?.id;
       let data= await User.updateOne({"_id":user_id},reqBody)
        return ({status:"success",Message:"User Update successfully",data:data})
  } catch (error) {
    return {status:'failed', data: error};
  }
}





export const getallUsers = async () => {

  try {

        const users = await User.find();
        return ({status:"success",Message:"Get All User Data successfully",data:users})
  } catch (error) {
    return {status:'failed', data: error};
  }

}





export const Searchbarservice = async (searchTerm:string) => {

  try {
 
    const users = await User.find({
      $or: [
        { email: { $regex: searchTerm, $options: 'i' } },  
        { phoneNumber: { $regex: searchTerm, $options: 'i' } },  
      ]
    },{_id: 0,role:0,password:0,createdAt:0,updatedAt:0,__v:0}); 

    return {
      status: "success",
      message: "Search results successfully fetched",
      data: users
    };
  } catch (error) {
    return {status:'failed', data: error};
  }

}

























export const ProxysetService = async (req: Request) => {
  try {
    const userId = req.user?.id; 
    const ProxysetUserId = req.params.proxysetId;

 

    if (!userId || !ProxysetUserId || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(ProxysetUserId)) {
      return { status: 'failed', message: 'Invalid user or followed user ID' };
    }

    if (userId === ProxysetUserId) {
      return { status: 'failed', message: "You cannot follow yourself" };
    }

    const ProxysetUserIdObjectId = new mongoose.Types.ObjectId(ProxysetUserId);

    const user = await User.findById(userId);
    if (!user) {
      return { status: 'failed', message: 'User not found' };
    }
  console.log("ProxysetId:", user?.proxysetId);
    const followedUser = await User.findById(ProxysetUserIdObjectId);
    if (!followedUser) {
      return { status: 'failed', message: "Followed user not found" };
    }

    if (user.proxysetId.length >= 2) {
    
      user.proxysetId[0] = ProxysetUserIdObjectId; 

      await user.save();

      return { status: 'success', message: 'User followed successfully, updated first ProxySet', data: user };
    }

    
    if (user.proxysetId.includes(ProxysetUserIdObjectId)) {
      return { status: 'failed', message: "You are already following this user" };
    }

    user.proxysetId.push(ProxysetUserIdObjectId);

    await user.save();

    return { status: 'success', message: 'User followed successfully', data: user };
  } catch (error) {
      return {status:'failed', data: error};
  }
};








export const getProxysetData = async (userId: string) => {
  try {
   
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "proxysetId", 
          foreignField: "_id", 
          as: "proxysetDetails", 
        },
      },
      {
        $project: {
          _id: 0,
          proxysetDetails: {
            email: 1,
            phoneNumber: 1,
            imgUrl: 1,
            role: 1,
            followers: 1,
          },
        },
      },
    ]);

    if (user.length === 0) {
      return { status: "failed", message: "User not found" };
    }

    return { status: "success", data: user[0] };
  } catch (error) {
    return {status:'failed', data: error};
  }
};








export const getUserFullProfileService = async (userId: string) => {
  const result = await User.aggregate([
    {
      $match: { _id: new Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "financials",
        localField: "_id",
        foreignField: "userID",
        as: "financialInfo",
      },
    },
    {
      $lookup: {
        from: "socialinfos",
        localField: "_id",
        foreignField: "userID",
        as: "socialInfo",
      },
    },
    {
      $lookup: {
        from: "homeautos",
        localField: "_id",
        foreignField: "userID",
        as: "homeAutoInfo",
      },
    },

     {
      $lookup: {
        from: "medicals",
        localField: "_id",
        foreignField: "userID",
        as: "medicalsInfo",
      },
      
    },
    
    


    {
      $project: {
        _id: 0,
        name: 1,
        email: 1,
        financialPercentage: { $arrayElemAt: ["$financialInfo.financialPercentage", 0] },
        socialInfo: { $arrayElemAt: ["$socialInfo.socialInfoPercentage", 0] },
        homeAutoInfo: { $arrayElemAt: ["$homeAutoInfo.homeautoPercentage", 0] },
        medicalsInfo: { $arrayElemAt: ["$medicalsInfo.medicalsPercentage", 0] },
      },
    },
  ]);

  return result[0] || null;
};





//proxysetId  data 


export const getUserSectionDataService = async (
  userId: string,
  loggedInUserId: string,
  type: string
) => {

  let hasAccess = userId === loggedInUserId;


  if (!hasAccess) {
    const user = await User.findById(userId).select("proxysetId");
    if (!user) throw new Error("USER_NOT_FOUND");

    hasAccess = user.proxysetId.some(
      (id) => id.toString() === loggedInUserId
    );
  }

  if (!hasAccess) throw new Error("ACCESS_DENIED");

  let model: Model<any>;
  switch (type) {
    case "homeauto":
      model = HomeAutoModel;
      break;
    case "medical":
      model = MedicalModel;
      break;
    case "financial":
      model = FinancialModel;
      break;
    default:
      throw new Error("INVALID_TYPE");
  }

  // 4️⃣ Fetch data
  const data = await model.find({ userID: userId });
  return data;
};






//admin routes


export const adminEmailService = async (req:Request) => {
  try {
    let { email } = req.body;
    let code = Math.floor(100000 + Math.random() * 900000);
    let EmailTo=email ;
    let EmailText = `Your code is= ${code}`;
    let EmailSubject = `PlainB E-commerce Website Email Verification Code `;
    await SendEmail(EmailTo, EmailText, EmailSubject)
    await User.updateOne(
      { email: email },
      { otp: code },
      { upsert: true }
    );

    return { status: "success", message: "6 digit code send successfully" };
  } catch (error) {
     return {status:'failed', data: error};
  }
};







export const codeVerification = async (email: string, code: string) => {
  // Check if user exists
  const user = await User.findOne({ email:email, otp: code });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.otp !== code) {
    throw new Error("Invalid code");
  }

  return { message: "Code verified successfully" };
};








export const updatePassword = async (email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
  if (!user) {
    throw new Error("User not found");
  }
  return { message: "Password updated successfully" };
};






export const getUserList = async (
  pageNo: number,
  perPage: number,
  searchKeyword: string
) => {
  const skipRow = (pageNo - 1) * perPage;
  let data;

  if (searchKeyword !== "0") {
    const searchRegex = { $regex: searchKeyword, $options: "i" };
    const searchQuery = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { company: searchRegex },
        
      ],
    };

    const pipeline: PipelineStage[] = [
      {
        $facet: {
          Total: [{ $match: searchQuery }, { $count: "count" }],
          Rows: [{ $match: searchQuery }, { $skip: skipRow }, { $limit: perPage }],
        },
      },
    ];

    data = await User.aggregate(pipeline);
  } else {
    const pipeline: PipelineStage[] = [
      {
        $facet: {
          Total: [{ $count: "count" }],
          Rows: [{ $skip: skipRow }, { $limit: perPage }],
        },
      },
    ];

    data = await User.aggregate(pipeline);
  }

  return data;
};











export const getNewUsersLast10DaysService = async () => {
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const count = await User.countDocuments({
    createdAt: { $gte: tenDaysAgo },
  });

  return count;
};





export const updateUserService = async (req:Request) => {
  try {
       let user_id=req.params.id;
        let requestBody = req.body;
     
        await User.updateOne({_id: user_id}, requestBody, {upsert: true})
        return ({status: true ,message:"User Update successfully"})

  } catch (error) {
    return {status: false, data: error};
  }
}





export const deleteUserService = async (req:Request) => {
  try {
       let user_id=req.params.id;


        await User.deleteOne({_id: user_id})
        return ({status: true ,message:"User deleted successfully"})

  } catch (error) {
    return {status: false, data: error};
  }
}










export const getCountsService = async (req: Request) => {
  try {
    const days = Number(req.query.days) || 10; // optional ?days=5
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - days);

    const [totalUsers, newUsersLastNDays, totalReports] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: tenDaysAgo } }),
      ReportModel.countDocuments()
    ]);

    return {
      status: true,
      data: {
        totalUsers,
        newUsersLastNDays,
        totalReports
      }
    };
  } catch (error) {
    return { status: false, data: error };
  }
};
























export class UserAnalysisService {
  // Daily analysis (last 7 days)
  static async getDailyAnalysis() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const data = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lte: today }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1 = Sunday, 2 = Monday...
          users: { $sum: 1 }
        }
      }
    ]);

    // Map numbers to weekday names
    const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const result = weekdays.map((day, index) => {
      const found = data.find(d => d._id === index + 1);
      return { name: day, users: found ? found.users : 0 };
    });

    return result;
  }

  // Monthly analysis (last 12 months)
  static async getMonthlyAnalysis() {
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);

    const data = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: lastYear, $lte: today }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          users: { $sum: 1 }
        }
      }
    ]);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const result = months.map((month, index) => {
      const found = data.find(d => d._id === index + 1);
      return { name: month, users: found ? found.users : 0 };
    });

    return result;
  }

  // Yearly analysis (last 5 years)
  static async getYearlyAnalysis() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4; // last 5 years

    const data = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(`${startYear}-01-01`), $lte: new Date() }
        }
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          users: { $sum: 1 }
        }
      }
    ]);

    const result = [];
    for (let year = startYear; year <= currentYear; year++) {
      const found = data.find(d => d._id === year);
      result.push({ name: year.toString(), users: found ? found.users : 0 });
    }

    return result;
  }
}