// src/app/modules/patient/patient.routes.ts

import { Router } from "express";
import { patientController } from "./controller.js";

const router = Router();

router.get("/", patientController.patientFromDB);
router.get("/:id", patientController.getByIdFromDB);
router.patch("/:id", patientController.updateIntoDB);
router.delete("/:id", patientController.deletedIntoDB);
router.patch("/:id/soft-delete", patientController.softDeletedIntoDB);

export const patientRouter = router;
