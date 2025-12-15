import { Document, Types } from "mongoose";
import { IUser } from "../auth/user.interface";

export interface REPORT extends Document{
  problem: string;
  details: string;
  status:string;
  userID: IUser | Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}
