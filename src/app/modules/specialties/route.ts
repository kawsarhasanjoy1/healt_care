import { Router } from "express";
import { specialtiesController } from "./controller.js";
import { upload } from "../../../helpers/multer.js";
import { parseData } from "../../../helpers/parseData.js";
import { zodSpecialtiesSchema } from "./zod.schema.js";
import validateRequest from "../../middleware/validateRequest.js";

const router = Router()

router.post('/create-specialties',upload.single('file'), parseData, validateRequest(zodSpecialtiesSchema.createSpecialtySchema),specialtiesController.createSpecialties)
router.get('/',specialtiesController.fetchSpecialties)
router.delete('/:specialtiesId',specialtiesController.deleteSpecialties)


export const specialtiesRouter = router;