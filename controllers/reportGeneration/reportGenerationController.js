import { apiResponse } from "../../utility/apiResponse.js";
import { generateFailedRequestsReport } from "../../services/failedRequestsReportService.js";

export const createReportGeneration = async (req, res) => {
    try {
        const { pdfBuffer } = await generateFailedRequestsReport(24);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("filename", "Failed_Requests_Report.pdf");
        res.setHeader("Access-Control-Expose-Headers", "filename");
        return res.end(pdfBuffer);
    } catch (error) {
        return apiResponse(
            res,
            500,
            false,
            "Failed to generate report",
            null,
            error.message
        );
    }
};