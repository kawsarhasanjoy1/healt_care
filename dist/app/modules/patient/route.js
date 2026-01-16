// src/app/modules/patient/patient.routes.ts
import { Router } from "express";
import { patientController } from "./controller.js";
import auth from "../../middleware/auth.js";
import { userRole } from "@prisma/client";
const router = Router();
router.get("/", patientController.patientFromDB);
router.get("/:id", patientController.getByIdFromDB);
router.patch("/:id", patientController.updateIntoDB);
router.delete("/:id", patientController.deletedIntoDB);
router.patch("/:id/soft-delete", patientController.softDeletedIntoDB);
router.put("/donor-status", auth(userRole.PATIANT), patientController.upPatiantDonateStatus);
export const patientRouter = router;
