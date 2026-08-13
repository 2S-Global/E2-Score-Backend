import { apiResponse } from "../utility/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return apiResponse(
        res,
        statusCode,
        false,
        err.message || "Internal Server Error",
        null,
        null
    );
};