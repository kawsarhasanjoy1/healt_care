import { Router } from "express";
import { userController } from "./controller.js";
import { upload } from "../../../helpers/multer.js";
import { parseData } from "../../../helpers/parseData.js";
import { userZodValidationSchema } from "./zod.validation.js";
import auth from "../../middleware/auth.js";
import { userRole } from "../../constance/global.js";
const router = Router();
router.get('/', userController.userFromDB);
router.get('/get-me', auth(userRole.ADMIN, userRole.PATIANT, userRole.DOCTOR, userRole.SUPER_ADMIN), userController.getMe);
router.get('/:id', userController.getByIdFromDB);
router.post('/create-admin', upload.single('file'), parseData, (req, res, next) => {
    userZodValidationSchema.adminZodValidationSchema.parseAsync({ body: req.body.admin }), next();
}, userController.createAdmin);
router.post('/create-doctor', upload.single('file'), parseData, (req, res, next) => {
    userZodValidationSchema.adminZodValidationSchema.parseAsync({ body: req.body.doctor }), next();
}, userController.createDoctor);
router.post("/create-patient", upload.single('file'), parseData, userController.createPatient);
router.patch('/:id', userController.updateStatus);
export const userRouter = router;
