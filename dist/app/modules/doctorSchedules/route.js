import { Router } from "express";
import { doctorSchedulesController } from "./controller.js";
import auth from "../../middleware/auth.js";
import { userRole } from "@prisma/client";
const router = Router();
// router.get(
//     '/',
//     auth(userRole.SUPER_ADMIN, userRole.ADMIN, userRole.DOCTOR, userRole.PATIANT));
router.get('/my-schedule', auth(userRole.DOCTOR), doctorSchedulesController.getMySchedule);
router.post('/', auth(userRole.DOCTOR), doctorSchedulesController.createDoctorSchedules);
router.delete('/:id', auth(userRole.DOCTOR), doctorSchedulesController.deleteFromDB);
export const doctorSchedulesRouter = router;
