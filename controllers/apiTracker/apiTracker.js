import mongoose from "mongoose";
import ExternalApiLog from "../../models/ExternalApiLogModel.js";
import { apiResponse } from "../../utility/apiResponse.js";

const ALLOWED_STATUSES = ["SUCCESS", "FAILED", "TIMEOUT"];
const ALLOWED_SORT_FIELDS = ["createdAt", "durationMs", "httpStatus", "status"];

const parsePositiveInteger = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
};

const parseDate = (value, isEndDate = false) => {
  if (!value) return null;

  const dateValue =
    value.length === 10
      ? `${value}T${isEndDate ? "23:59:59.999" : "00:00:00.000"}Z`
      : value;

  const date = new Date(dateValue);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getStatusFilter = (status) => {
  if (!status) return null;

  const statuses = String(status)
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  const invalidStatus = statuses.find(
    (item) => !ALLOWED_STATUSES.includes(item)
  );

  if (invalidStatus) {
    return { error: `Invalid status: ${invalidStatus}` };
  }

  return statuses.length === 1
    ? { value: statuses[0] }
    : { value: { $in: statuses } };
};

export const getAllApiResponse = async (req, res) => {
  try {
    const {
      page,
      limit,
      userId,
      status,
      startDate,
      endDate,
      sort = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const currentPage = parsePositiveInteger(page, 1, 10_000);
    const pageSize = parsePositiveInteger(limit, 10, 100);

    if (userId && !mongoose.isValidObjectId(userId)) {
      return apiResponse(res, 422, false, "Invalid userId", null, null);
    }

    if (!ALLOWED_SORT_FIELDS.includes(sort)) {
      return apiResponse(res, 422, false, "Invalid sort field", null, null);
    }

    const statusFilter = getStatusFilter(status);

    if (statusFilter?.error) {
      return apiResponse(res, 422, false, statusFilter.error, null, null);
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate, true);

    if (startDate && !start) {
      return apiResponse(res, 422, false, "Invalid startDate", null, null);
    }

    if (endDate && !end) {
      return apiResponse(res, 422, false, "Invalid endDate", null, null);
    }

    if (start && end && start > end) {
      return apiResponse(
        res,
        422,
        false,
        "startDate cannot be after endDate",
        null,
        null
      );
    }

    const query = {
      ...(userId && { userId }),
      ...(statusFilter?.value && { status: statusFilter.value }),
      ...(start || end
        ? {
          createdAt: {
            ...(start && { $gte: start }),
            ...(end && { $lte: end }),
          },
        }
        : {}),
    };

    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [apiResponses, totalLogs] = await Promise.all([
      ExternalApiLog.find(query)
        .populate("userId", "name profilePicture email phone_number")
        .sort({ [sort]: sortDirection })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      ExternalApiLog.countDocuments(query),
    ]);

    return apiResponse(res, 200, true, "API responses fetched successfully", {
      apiResponses,
      pagination: {
        page: currentPage,
        limit: pageSize,
        totalLogs,
        totalPages: Math.ceil(totalLogs / pageSize),
      },
    });
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      "Internal server error",
      null,
      error.message
    );
  }
};