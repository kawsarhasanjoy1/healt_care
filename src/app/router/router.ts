import 'dotenv/config'
import { Router } from "express";
import { userRouter } from "../modules/user/route.js";
import { adminRouter } from '../modules/admin/route.js';
import { authRouter } from '../modules/Auth/route.js';
import { specialtiesRouter } from '../modules/specialties/route.js';
import { doctorSpecialtiesRoutes } from '../modules/doctorSpecialties/route.js';
import { doctorRouter } from '../modules/doctor/route.js';


const routerPath = [
    {
        path: '/user',
        router: userRouter
    },
    {
        path: '/admin',
        router: adminRouter
    },
    {
        path: '/auth',
        router: authRouter
    },
    {
        path: "/specialties",
        router: specialtiesRouter
    },
    {
        path: "/doctors",
        router: doctorRouter
    }
]

const router = Router()

routerPath.map(item => router.use(item?.path,item?.router))

export default router