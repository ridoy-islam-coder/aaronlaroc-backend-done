import express from "express";
import { ReviewService, updateReviewService } from "./reviews.service";
import { GetAllReviewsController, ReviewController } from "./reviews.controller";
import { auth, isAdmin } from "../../middleware/auth.middleware";










const router = express.Router();

// create Financial Information 
router.post("/create-review",auth,ReviewController)

router.get("/all-reviews", auth,isAdmin,GetAllReviewsController);
// Only admins can update reports
router.put("/reviews/:id", auth,isAdmin, updateReviewService);















export const ReviewRoutes = router;