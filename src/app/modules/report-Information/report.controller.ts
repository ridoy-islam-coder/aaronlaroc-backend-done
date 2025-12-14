import { Request, Response } from "express";
import { DashboardOverviewService, GetAllReportsService, ReportCountService, ReportService } from "./report.service";





export const ReportController=async (req:Request,res:Response) => {
  
    let result = await ReportService(req,res);
    res.json(result);

}


export const ReportCountController = async (req: Request, res: Response) => {
  const result = await ReportCountService();
  res.json(result);
};


export const GetAllReportsController = async (req: Request, res: Response) => {
  const result = await GetAllReportsService();
  res.json(result);
};



export const DashboardOverview = async (req: Request, res: Response) => {
  try {
    const result = await DashboardOverviewService();

    if (!result.status) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
};