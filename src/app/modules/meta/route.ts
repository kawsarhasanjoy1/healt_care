import { userRole } from "@prisma/client";
import { Router } from "express";
import { metaController } from "./controller.js";
import auth from "../../middleware/auth.js";


const router = Router();

router.get(
    '/',
    auth
    (userRole.SUPER_ADMIN, userRole.ADMIN, userRole.DOCTOR, userRole.PATIANT),
    metaController.fetchDashboardMetaData
)


export const MetaRoutes = router;