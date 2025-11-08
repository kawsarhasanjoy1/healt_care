import express, { Request, Response } from 'express'
import cors from 'cors'
import router from './app/router/router.js';
import notFound from './app/middleware/notFound.js';
import GlobalErrorHandler from './app/middleware/GlobalErrorHandler.js';

export const app = express();
app.use(express.json())
app.use(cors())

app.get('/',(req:Request,res:Response) => {
    res.json({
        success: true,
        message: 'connected successful'
    })
})

app.use('/api/v1',router)
app.use(GlobalErrorHandler)
app.use(notFound)