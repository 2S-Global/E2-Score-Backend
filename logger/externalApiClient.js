import axios from "axios";
import ExternalApiLog from "../models/ExternalApiLogModel.js";

const serializeBody = (data) => {
  if (data == null) return "";

  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
};

const saveLog = async (payload) => {
  try {
    await ExternalApiLog.create(payload);
  } catch (logError) {
    console.error("Failed to save external API log:", logError.message);
  }
};

export const externalApiClient = async ({
  provider,
  service,
  url,
  method = "POST",
  data,
  headers,
  userId,
}) => {
  const startTime = Date.now();

  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      timeout: 10_000,
    });

    await saveLog({
      userId,
      provider,
      service,
      endpoint: url,
      status: "SUCCESS",
      httpStatus: response.status,
      durationMs: Date.now() - startTime,
      responseBody: serializeBody(response.data),
    });

    return response.data;
  } catch (error) {
    const responseData = error.response?.data;

    await saveLog({
      userId,
      provider,
      service,
      endpoint: url,
      status: error.code === "ECONNABORTED" ? "TIMEOUT" : "FAILED",
      httpStatus: error.response?.status ?? null,
      errorMessage: error.message,
      durationMs: Date.now() - startTime,
      responseBody: serializeBody(responseData ?? { error: error.message }),
    });

    throw error;
  }
};