import express from "express";
import { auth, isAdmin } from "../../middleware/auth.middleware";
import { GetAllReportsController, ReportController, ReportCountController } from "./report.controller";






const router = express.Router();

// create Financial Information 
router.post("/create-report",auth,ReportController)
router.get("/total-reports",auth,isAdmin, ReportCountController);
router.get("/all-reports", auth,isAdmin,GetAllReportsController);
















export const ReportRoutes = router;