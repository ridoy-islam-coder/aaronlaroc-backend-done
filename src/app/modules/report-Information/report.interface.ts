import { Document, Types } from "mongoose";
import { IUser } from "../auth/user.interface";

export interface REPORT extends Document{
  jobtitle: string;
  details: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company: string;
  companysize: string;
  status:string;
  userID: IUser | Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}
