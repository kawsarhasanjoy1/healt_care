import { Router } from "express";
import auth from "../../middleware/auth.js";
import { userRole } from "@prisma/client";
import { appoinmentController } from "./controller.js";


const router = Router()


router.post('/', auth(userRole.PATIANT),appoinmentController.createAppoinment)
router.get('/my-appoinment', auth(userRole.PATIANT,userRole.DOCTOR),appoinmentController.getMyAppoinment)
router.get('/', auth(userRole.SUPER_ADMIN,userRole.ADMIN),appoinmentController.getAppoinments)
router.patch('/:appointmentId', auth(userRole.SUPER_ADMIN,userRole.ADMIN,userRole.DOCTOR),appoinmentController.changeAppoinmentStatus)

export const appoinmentRouter = router;