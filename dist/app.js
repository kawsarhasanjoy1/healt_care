import express from "express";
import cors from "cors";
import cron from 'node-cron';
import router from "./app/router/router.js";
import notFound from "./app/middleware/notFound.js";
import cookieParser from 'cookie-parser';
import { AppoinmentServices } from "./app/modules/Appoinment/services.js";
import globalErrorHandler from "./app/middleware/GlobalErrorHandler.js";
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "https://healt-care-frtd.vercel.app", credentials: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "connected successful",
    });
});
cron.schedule('* * * * *', () => {
    AppoinmentServices.cancelUnpaidAppoinment();
});
app.use("/api/v1", router);
app.use(notFound);
app.use(globalErrorHandler);
export default app;
