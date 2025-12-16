import { Router } from "express";
import { prescriptionController } from "./controller.js";
import auth from "../../middleware/auth.js";
import { userRole } from "@prisma/client";

const router = Router()


router.post('/',auth(userRole.DOCTOR),prescriptionController.createPrescription)
router.get('/my-prescription',auth(userRole.PATIANT),prescriptionController.getMyPrescription)

export const prescriptionRouter = router;