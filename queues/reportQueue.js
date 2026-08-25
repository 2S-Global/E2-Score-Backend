import { Queue } from "bullmq";
import { redis } from "../config/redis.js";


export const reportQueue = new Queue('reportGeneration', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 3000,
        }
    }
},
)