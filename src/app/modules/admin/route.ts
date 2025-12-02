import { Router } from "express"
import { adminController } from "./controller.js"
import auth from "../../middleware/auth.js"
import { userRole } from "../../constance/global.js"


const router = Router()
router.get('/', auth(userRole.ADMIN,userRole.SUPER_ADMIN), adminController.adminFromDB)
router.get('/:id',auth(userRole.ADMIN,userRole.SUPER_ADMIN) ,adminController.getByIdFromDB)
router.patch('/:id',auth(userRole.ADMIN,userRole.SUPER_ADMIN), adminController.updateIntoDB)
router.delete('/:id',auth(userRole.ADMIN,userRole.SUPER_ADMIN), adminController.deletedIntoDB)
router.patch('/soft/:id', auth(userRole.ADMIN,userRole.SUPER_ADMIN),adminController.softDeletedIntoDB)

export const adminRouter = router