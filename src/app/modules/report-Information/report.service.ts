import { Request, Response } from "express";
import { ReportModel } from "./report.model";
import { getNewUsersLast10DaysService } from "../auth/user.service";
import { User } from "../auth/user.model";






export const ReportService = async (req: Request, res: Response) => {
    try {
      const { problem, details, userID } = req.body;

      const newReport = await ReportModel.create({
        problem,
        details,
        userID,
      });
     return ({status:true,Message:"Report created successfully", data:newReport})
  

    } catch (error: any) {
        return {status:'false', message: "Failed to create report", data: error};
    
 }
  }





  export const ReportCountService = async () => {
  try {
    const count = await ReportModel.countDocuments();

    return {
      status: true,
      message: "Total reports fetched successfully",
      totalReports: count
    };

  } catch (error: any) {

    return {
      status: false,
      message: "Failed to fetch total reports",
      data: error
    };
  }
};




export const GetAllReportsService = async () => {
  try {
    const reports = await ReportModel.find().populate("userID","firstName lastName email imgUrl  ");

    return {
      status: true,
      message: "All reports fetched successfully",
      data: reports
    };

  } catch (error: any) {

    return {
      status: false,
      message: "Failed to fetch reports",
      data: error
    };
  }
};







    
export const DashboardOverviewService = async () => {
  try {
  
    const reports = await ReportModel.find()
      .populate("userID", "firstName lastName email imgUrl");

  
    const totalReports = await ReportModel.countDocuments();

      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
      const count = await User.countDocuments({
        createdAt: { $gte: tenDaysAgo },
      });

    return {
      status: true,
      message: "Dashboard data fetched successfully",
      data: {
        reports,
        totalReports,
        count
      }
    };

  } catch (error: any) {
    return {
      status: false,
      message: "Failed to fetch dashboard data",
      error: error.message
    };
  }
};