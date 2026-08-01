import { Queue } from "bullmq";
import { redis } from "../config/redis.js";


export const emailQueue = new Queue('email', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3
    },
    backoff: {
        type: 'exponential',
        delay: 3000,
    }
},
)

// export const notificationQueue = new Queue('notification', {
//     connection: redis,
//     defaultJobOptions: {
//         attempts: 3
//     },
//     backoff: {
//         type: 'fixed',
//         delay: 3000,
//     },

// })