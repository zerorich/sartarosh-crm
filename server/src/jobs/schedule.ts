import { couponQueue, financeQueue, reminderQueue, reportQueue } from "./queues";

const keep = { removeOnComplete: 20, removeOnFail: 20 };

export async function scheduleRepeatableJobs() {
  await reminderQueue.add(
    "process-reminders",
    {},
    { repeat: { every: 5 * 60 * 1000 }, ...keep },
  );

  await couponQueue.add(
    "expire-coupons",
    {},
    { repeat: { every: 60 * 60 * 1000 }, ...keep },
  );

  await reportQueue.add(
    "daily-report",
    {},
    { repeat: { pattern: "0 2 * * *", tz: "UTC" }, ...keep },
  );

  await financeQueue.add(
    "aggregate-finance",
    {},
    { repeat: { pattern: "15 2 * * *", tz: "UTC" }, ...keep },
  );
}
