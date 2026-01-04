import { Request, Response } from "express";
import { GetAllReviewsService,  ReviewService, updateReviewService } from "./reviews.service";




export const ReviewController = async (
  req: Request,
  res: Response
)=> {
  try {
    const result = await ReviewService(req);

    if (result.status) {
      res.status(201).json({
        status: "success",
        message: result.message,
        data: result.data,
      });
    } else {
      res.status(400).json({
        status: "error",
        message: result.message,
        error: result.data,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



export const GetAllReviewsController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await GetAllReviewsService(req);

    if (result.status) {
      res.status(200).json({
        status: "success",
        message: result.message,
        data: result.data
      });
    } else {
      res.status(500).json({
        status: "error",
        message: result.message,
        error: result.data
      });
    }
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};




export const updateReviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await updateReviewService(req);

    if (result.status) {
      res.status(200).json({
        status: "success",
        message: result.message
      });
    } else {
      res.status(404).json({
        status: "error",
        message: result.message,
        error: result.data
      });
    }
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
