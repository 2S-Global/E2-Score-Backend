

export const apiResponse = (
    res,
    statusCode,
    success,
    message,
    data = null,
    errors = null
) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        errors,
    });
};


export const apiFailure = (res, statusCode, success, data = false, errors = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        errors
    })
}







