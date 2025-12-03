import { StatusCodes } from "http-status-codes";
const notFound = (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Api not found',
        error: {
            path: req.originalUrl,
            message: 'Your requested path is not found'
        }
    });
};
export default notFound;
