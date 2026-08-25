import ExternalApiLog from "../models/ExternalApiLogModel.js";
import { generateFailureReportPdf } from "./generateFailureReportPdf.js";

export const generateFailedRequestsReport = async (window) => {
    const now = new Date();

    let from;
    let to;

    if (window === "EVENING_TO_NOON") {
        // Previous day 5:00 PM → Today 12:00 PM
        to = new Date(now);
        to.setHours(12, 0, 0, 0);

        from = new Date(to);
        from.setDate(from.getDate() - 1);
        from.setHours(17, 0, 0, 0);
    }

    else if (window === "NOON_TO_EVENING") {
        // Today 12:00 PM → Today 5:00 PM
        from = new Date(now);
        from.setHours(12, 0, 0, 0);

        to = new Date(now);
        to.setHours(17, 0, 0, 0);
    }

    else {
        throw new Error(`Invalid report window: ${window}`);
    }

    const failures = await ExternalApiLog.find({
        status: { $in: ["FAILED", "TIMEOUT"] },
        createdAt: {
            $gte: from,
            $lt: to,
        },
    })
        .populate("userId", "name email phone_number profile_picture")
        .sort({ createdAt: -1 })
        .lean();

    const pdfBuffer = await generateFailureReportPdf({
        failures,
    });

    return {
        pdfBuffer,
        failuresCount: failures.length,
        from,
        to,
    };
};