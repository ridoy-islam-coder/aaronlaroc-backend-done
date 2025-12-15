import { Document, Types } from "mongoose";
import { IUser } from "../auth/user.interface";



export const VEHICLE_OWNERSHIP = ["Own", "Lease", "No Vehicle"] as const;
export type TVehicleOwnership = (typeof VEHICLE_OWNERSHIP)[number];

export const HOME_OCCUPANCY = ["Own", "Rent", "Other"] as const;
export type THomeOccupancy = (typeof HOME_OCCUPANCY)[number];

export const POWER_TOYS = ["ATV", "Boat", "Motorcycle"] as const;
export type TPowerToy = (typeof POWER_TOYS)[number];

export const HOME_INSURANCE_TYPE = ["Homeowner", "Renter"] as const;
export type THomeInsuranceType = (typeof HOME_INSURANCE_TYPE)[number];





export interface IHomeVehicle extends Document {
  userID:IUser | Types.ObjectId;

  // Vehicle
  vehicleOwnership?: TVehicleOwnership;   
  vehicleMakeModel?: string;              
  hasCarInsurance?: boolean; 
  homeautoPercentage: number;           
  carInsuranceProvider?: string;          

 
  hasPowerToys?: boolean;               
  powerToyTypes?: TPowerToy[];            

  // Home
  homeOccupancy?: THomeOccupancy;         
  hasHomeInsurance?: boolean;             
  homeInsuranceType?: THomeInsuranceType; 

  createdAt?: Date;
  updatedAt?: Date;
}