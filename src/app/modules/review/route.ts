import { Router } from "express";
import { reviewController } from "./controller.js";
import auth from "../../middleware/auth.js";
import { userRole } from "@prisma/client";

const router = Router();

router.post('/',auth(userRole.PATIANT), reviewController.createReview)
router.get('/',auth(userRole.SUPER_ADMIN,userRole.ADMIN), reviewController.getReview)


export const reviewRouter = router