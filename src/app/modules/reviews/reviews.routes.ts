import express from "express";
import { auth, isAdmin } from "../../middleware/auth.middleware";
import { ReviewService, updateReviewService } from "./reviews.service";
import { GetAllReportsController } from "../report-Information/report.controller";







const router = express.Router();

// create Financial Information 
router.post("/create-review",auth,ReviewService)

router.get("/all-reviews", auth,isAdmin,GetAllReportsController);
// Only admins can update reports
router.put("/reviews/:id", auth,isAdmin, updateReviewService);















export const ReviewRoutes = router;