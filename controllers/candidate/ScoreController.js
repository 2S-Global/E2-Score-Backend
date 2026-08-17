import axios from "axios";

export const CibilScore = async (req, res) => {
  const controller = new AbortController();
  const API_URL = process.env.CIBIL_URL;
  // 60-second request timeout
  const timeout = setTimeout(() => {
    controller.abort();
  }, 60000);
  const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB
  try {
    const request = req.body;
    // Basic request validation
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
      });
    }

    const sendRequest = {
      ...request,
      api_id: process.env.CIBIL_API_ID,
      api_key: process.env.CIBIL_API_KEY,
      token_id: process.env.CIBIL_TOKEN_ID,
    };

    const response = await axios.post(API_URL, sendRequest, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      // AbortController
      signal: controller.signal,
      maxContentLength: MAX_RESPONSE_SIZE,
      maxBodyLength: MAX_RESPONSE_SIZE,
      validateStatus: () => true,
    });

    /*  if (response.status < 200 || response.status >= 300) {
      console.error("Credit API request failed", {
        status: response.status,
      });
      return res.status(502).json({
        success: false,
        error: "Credit score service unavailable",
        upstreamStatus: response.status,
      });
    } */
    // Success
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    // AbortController timeout
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
      console.error("Credit API request timed out");
      return res.status(504).json({
        success: false,
        error: "Credit score service timed out",
      });
    }
    // Never expose internal errors
    console.error("Credit API error:", error);
    return res.status(502).json({
      success: false,
      error: "Unable to process credit score request",
    });
  } finally {
    clearTimeout(timeout);
  }
};
