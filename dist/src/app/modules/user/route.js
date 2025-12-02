import { Router } from "express";
import { userController } from "./controller.js";
import { upload } from "../../../helpers/multer.js";
import { parseData } from "../../../helpers/parseData.js";
import { userZodValidationSchema } from "./zod.validation.js";
import auth from "../../middleware/auth.js";
import { userRole } from "../../constance/global.js";
const router = Router();
router.get('/get-me', auth(userRole.ADMIN, userRole.PATIANT, userRole.DOCTOR, userRole.SUPER_ADMIN), userController.getMe);
router.post('/create-admin', upload.single('file'), parseData, (req, res, next) => {
    userZodValidationSchema.adminZodValidationSchema.parseAsync({ body: req.body.admin }), next();
}, userController.createAdmin);
router.post('/create-doctor', upload.single('file'), parseData, (req, res, next) => {
    userZodValidationSchema.adminZodValidationSchema.parseAsync({ body: req.body.doctor }), next();
}, userController.createDoctor);
router.get('/', userController.userFromDB);
router.patch('/:id', userController.updateStatus);
router.get('/:id', userController.getByIdFromDB);
export const userRouter = router;
