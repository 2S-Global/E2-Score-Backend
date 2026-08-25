import generateReportPDFLocal from "./failedRequestsReportGenerator.js";
import generateReportPDFServer from "./failedRequestsReportGenerator_server.js";

export const generateFailureReportPdf = process.platform === "win32" ? generateReportPDFLocal : generateReportPDFServer;
