export const parseData = (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
};
