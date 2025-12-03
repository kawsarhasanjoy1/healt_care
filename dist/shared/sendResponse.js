const sendResponse = (res, jsonData) => {
    res.status(jsonData.status).json({
        success: jsonData.status < 400,
        meta: jsonData.meta,
        data: jsonData.data || null,
        message: jsonData.message,
    });
};
export default sendResponse;
