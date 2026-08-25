import { reportQueue } from "../queues/reportQueue.js";

export const ReportScheduler = async () => {
    // 12:00 PM report
    await reportQueue.upsertJobScheduler(
        "failed-report-noon",
        {
            pattern: "0 12 * * *",
            tz: "Asia/Kolkata",
        },
        {
            name: "generate-failed-request-report",
            data: {
                window: "EVENING_TO_NOON",
            },

            opts: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000,
                },
                removeOnComplete: {
                    count: 100,
                },
                removeOnFail: {
                    count: 100,
                },
            },
        }
    );

    // 5:00 PM report
    await reportQueue.upsertJobScheduler(
        "failed-report-evening",
        {
            pattern: "0 17 * * *",
            tz: "Asia/Kolkata",
        },
        {
            name: "generate-failed-request-report",
            data: {
                window: "NOON_TO_EVENING",
            },

            opts: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000,
                },
                removeOnComplete: {
                    count: 100,
                },
                removeOnFail: {
                    count: 100,
                },
            },
        }
    );
};