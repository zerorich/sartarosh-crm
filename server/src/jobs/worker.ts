import { Worker } from "bullmq";
import { prisma } from "../config/prisma";
import { processCouponExpiration } from "./coupon-expiration.job";
import { processDailyReports } from "./daily-report.job";
import { processFinanceAggregation } from "./finance-aggregation.job";
import { processNotificationJob } from "./notification.job";
import { jobConnection, QUEUE_NAMES } from "./queues";
import { processReminders } from "./reminder.job";
import { scheduleRepeatableJobs } from "./schedule";

function listen(worker: Worker, name: string) {
  worker.on("failed", (job, err) => {
    console.error(`${name} job failed`, job?.id, err);
  });
  return worker;
}

const notificationWorker = listen(
  new Worker(
    QUEUE_NAMES.notifications,
    async (job) => processNotificationJob(job.data),
    { connection: jobConnection },
  ),
  QUEUE_NAMES.notifications,
);

const reminderWorker = listen(
  new Worker(QUEUE_NAMES.reminders, async () => processReminders(), {
    connection: jobConnection,
  }),
  QUEUE_NAMES.reminders,
);

const couponWorker = listen(
  new Worker(QUEUE_NAMES.coupons, async () => processCouponExpiration(), {
    connection: jobConnection,
  }),
  QUEUE_NAMES.coupons,
);

const reportWorker = listen(
  new Worker(QUEUE_NAMES.reports, async () => processDailyReports(), {
    connection: jobConnection,
  }),
  QUEUE_NAMES.reports,
);

const financeWorker = listen(
  new Worker(QUEUE_NAMES.finance, async () => processFinanceAggregation(), {
    connection: jobConnection,
  }),
  QUEUE_NAMES.finance,
);

const workers = [notificationWorker, reminderWorker, couponWorker, reportWorker, financeWorker];

scheduleRepeatableJobs().catch(() => {
  console.warn("Could not schedule repeatable jobs — Redis may be down");
});

console.log("Sartarosh workers started");

async function shutdown() {
  await Promise.all(workers.map((worker) => worker.close()));
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
