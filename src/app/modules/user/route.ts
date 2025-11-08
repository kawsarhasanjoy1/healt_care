import { Router } from "express"
import { userController } from "./controller.js"
const router = Router()
router.post('/create-user', userController.createAdmin)
router.get('/', userController.userFromDB)
router.get('/:id', userController.getByIdFromDB)



export const userRouter = router