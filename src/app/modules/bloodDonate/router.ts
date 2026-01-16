import { Router } from "express";
import auth from "../../middleware/auth.js";
import { userRole } from "@prisma/client";
import { bloodDonateController } from "./controller.js";

const router = Router();

router.post(
  '/create-blood-donate',
  auth(userRole.PATIANT), 
  bloodDonateController.createBloodDonate
);

router.get(
  '/available-donors',
  auth(userRole.PATIANT),
  bloodDonateController.getAvailableDonorsForPatient
);
router.get(
  '/my-blood-donation',
  auth(userRole.PATIANT),
  bloodDonateController.myBloodDonation
);

export const bloodDonateRoutes = router;