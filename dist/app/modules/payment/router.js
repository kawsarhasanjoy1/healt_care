import { Router } from "express";
import { paymentController } from "./controller.js";
const router = Router();
router.get('/ipn', paymentController.validatePayment);
router.post('/init-payment/:appointmentId', paymentController.initPayment);
// router.get('/my-payment' )
export const paymentRouter = router;
