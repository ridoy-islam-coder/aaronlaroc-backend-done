
// for mongoose model

import { model, Schema, Types } from 'mongoose'
import { REPORT } from './report.interface';





const financialSchema =  new Schema<REPORT>({
    
    
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    company: {type: String, required: false},
    companysize: {type: String, required: false},
    jobtitle: { type: String, required:true },
    details: { type: String, required:true },
    status: { 
    type: String, 
    enum: ["Progress", "Completed"], 
    default: "Progress" 
  },
    userID: { type: Types.ObjectId,   ref: 'User',required:true},

    },{
    timestamps: true,versionKey: false
})

export const ReportModel = model<REPORT>("report", financialSchema);