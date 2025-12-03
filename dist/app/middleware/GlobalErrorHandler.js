const GlobalErrorHandler = (err, req, res, next) => {
    let StatusCodes = 500;
    let message = err?.message || 'Something went wrong';
    let errorSourch = [{
            path: '',
            message: err?.message
        }];
    res.status(StatusCodes).json({
        success: false,
        message,
        errorSourch
    });
    next();
};
export default GlobalErrorHandler;
