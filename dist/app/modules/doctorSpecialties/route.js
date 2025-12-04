import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import { doctorSpecialtiesZodSchema } from "./zod.validation.schema.js";
import { DoctorSpecialtiesController } from "./controller.js";
const router = Router();
router.post('/create-doctor-specialties', validateRequest(doctorSpecialtiesZodSchema.createDoctorSpecialtySchema), DoctorSpecialtiesController.createDoctorSpecialty);
router.delete('/:doctorSpecialtiesId', DoctorSpecialtiesController.deleteDoctorSpecialty);
router.get('/', DoctorSpecialtiesController.getAllDoctorSpecialties);
export const doctorSpecialtiesRoutes = router;
