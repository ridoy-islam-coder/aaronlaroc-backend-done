import { Request, Response } from "express";
import {  FinancialGetService, FinancialUpdateService, shareUserDataWithProxyset } from "./financial.service";






 export const UpdateFinancial=async (req:Request,res:Response) => {
    let result = await FinancialUpdateService(req);
    res.json(result);

  }


export const GetFinancialData = async (req: Request, res: Response) => {
  const result = await FinancialGetService(req);
  return res.status(200).json(result);
};







    export const shareFinancial=async (req:Request,res:Response) => {
    const id = req.params.id; 
    let result = await shareUserDataWithProxyset(id);
    res.json(result);

    }




