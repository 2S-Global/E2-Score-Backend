import { ZodError } from "zod";

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.body);
            console.log("thats the result")
            // Replace body with validated/transformed data
            req.body = result;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    };
};

export default validateRequest;