import { Router } from "express";
import { DoctorController } from "./controller.js";
const router = Router();
router.patch('/:doctorId', DoctorController.updateDoctor);
export const doctorRouter = router;
