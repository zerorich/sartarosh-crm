import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { scheduleRepeatableJobs } from "./jobs/schedule";

async function main() {
  await redis.connect().catch(() => {
    console.warn("Redis is not available yet — OTP and jobs will fail until it is up");
  });

  await scheduleRepeatableJobs().catch(() => {
    console.warn("Could not schedule jobs — Redis may be down; worker may handle them separately");
  });

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`Sartarosh API listening on :${env.PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
