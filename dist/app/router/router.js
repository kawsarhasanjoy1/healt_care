import 'dotenv/config';
import { Router } from "express";
import { userRouter } from "../modules/user/route.js";
import { adminRouter } from '../modules/admin/route.js';
import { authRouter } from '../modules/Auth/route.js';
import { specialtiesRouter } from '../modules/specialties/route.js';
import { doctorRouter } from '../modules/doctor/route.js';
import { patientRouter } from '../modules/patient/route.js';
import { scheduleRouter } from '../modules/schedule/route.js';
import { doctorSchedulesRouter } from '../modules/doctorSchedules/route.js';
import { paymentRouter } from '../modules/payment/router.js';
import { appoinmentRouter } from '../modules/Appoinment/router.js';
import { prescriptionRouter } from '../modules/prescription/route.js';
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
    },
    {
        path: "/patients",
        router: patientRouter
    },
    {
        path: "/schedules",
        router: scheduleRouter
    },
    {
        path: "/doctor-schedules",
        router: doctorSchedulesRouter
    },
    {
        path: "/payments",
        router: paymentRouter
    },
    {
        path: "/appoinment",
        router: appoinmentRouter
    },
    {
        path: "/prescription",
        router: prescriptionRouter
    }
];
const router = Router();
routerPath.map(item => router.use(item?.path, item?.router));
export default router;
