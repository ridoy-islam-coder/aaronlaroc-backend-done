import { Request, Response } from "express";
import {  FinancialUpdateService, getFinancialDataForUser,  } from "./financial.service";






    // export const CreateFinancial=async (req:Request,res:Response) => {
    // let result = await FinancialCreateService(req);
    // res.json(result);

    // }


     export const UpdateFinancial=async (req:Request,res:Response) => {
    let result = await FinancialUpdateService(req);
    res.json(result);

    }


 export const shareFinancial=async (req:Request,res:Response) => {
  const userId = req.params.userId;

  const result = await getFinancialDataForUser(userId);

  if (result.status === "error") {
    return res.status(400).json(result);
  }

  return res.json(result);

    }
