import express from "express";
import cors from "cors";
import router from "./app/router/router.js";
import notFound from "./app/middleware/notFound.js";
import GlobalErrorHandler from "./app/middleware/GlobalErrorHandler.js";
import cookieParser from 'cookie-parser';
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "connected successful",
    });
});
app.use("/api/v1", router);
app.use(notFound);
app.use(GlobalErrorHandler);
export default app;
