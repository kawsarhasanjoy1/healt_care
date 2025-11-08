import { Router } from "express"
import { adminController } from "./controller.js"

const router = Router()
router.get('/', adminController.adminFromDB)
router.get('/:id', adminController.getByIdFromDB)
router.patch('/:id', adminController.updateIntoDB)
router.delete('/:id', adminController.deletedIntoDB)
router.patch('/soft/:id', adminController.softDeletedIntoDB)

export const adminRouter = router