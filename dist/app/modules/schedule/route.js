// src/app/modules/schedule/schedule.routes.ts
import { Router } from "express";
import { scheduleController } from "./controller.js";
import auth from "../../middleware/auth.js";
import { userRole } from "@prisma/client";
const router = Router();
router.post("/", scheduleController.createSchedule);
router.get("/", auth(userRole.DOCTOR), scheduleController.getSchedules);
router.delete("/:id", scheduleController.deleteSchedule);
export const scheduleRouter = router;
