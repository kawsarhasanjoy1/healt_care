import 'dotenv/config'
import { Router } from "express";
import { userRouter } from "../modules/user/route.js";
import { adminRouter } from '../modules/admin/route.js';


const routerPath = [
    {
        path: '/user',
        router: userRouter
    },
    {
        path: '/admin',
        router: adminRouter
    },
]

const router = Router()

routerPath.map(item => router.use(item?.path,item?.router))

export default router