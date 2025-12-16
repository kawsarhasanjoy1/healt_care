import { Router } from "express";
import { DoctorController } from "./controller.js";

const router = Router();


router.get("/", DoctorController.getAllDoctors);
router.get("/:doctorId", DoctorController.getDoctorById);
router.patch("/:doctorId", DoctorController.updateDoctor);
router.patch("/:doctorId/soft-delete", DoctorController.softDeleteDoctor);
router.patch("/:doctorId/restore", DoctorController.restoreSoftDeleteDoctor);
router.delete("/:doctorId", DoctorController.deleteDoctor);

export const doctorRouter = router;
