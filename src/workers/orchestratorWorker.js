import { Worker, Queue } from "bullmq";
import Client from "../services/redisClient.js";

const EmailNotification = new Queue("Email-Queue", { connection: Client });
const PushNotification = new Queue("PushNotification-Queue", {
  connection: Client,
});
const inAppNotification = new Queue("inAppNotification-Queue", {
  connection: Client,
});
// job stay limit
const jobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: {
    count: 100, // 100 tak completed jobs record ke liye rakho
    age: 3600, // 1 ghante baad saaf kar do
  },
  removeOnFail: {
    count: 50, // Failed jobs ko check karne ke liye rakho
    age: 24 * 3600,
  },
};

const dlqQueue = new Queue("notifications-dlq", { connection: Client });
const orchestratorWorker = new Worker(
  "notification-queue",
  async (job) => {
    const { userId, message } = job.data;
    // 1. Redis se direct status lo (No need to hit HTTP route)

    const lastSeen = await Client.get(`User: ${userId}: last seen`);
    const now = Math.floor(Date.now() / 1000);
    const differ = lastSeen ? now - parseInt(lastSeen) : 999999;
    // --- STEP A: In-App Queue (Hamesha bhejni hai) ---
    // User online ho ya offline, in-app notification count update hona chahiye
    if (differ < 120) {
      await inAppNotification.add(
        "in-app-job",
        {
          userId,
          message,
          type: "IN-APP-NOTIFICATION",
        },
        jobOptions,
      );
      console.log(`-> User is ONLINE. Only In-App update sent.`);
    }

    // --- STEP B: Activity Based Routing ---
    if (differ > 120 && differ < 172800) {
      await PushNotification.add(
        "push-job",
        {
          userId,
          message,
          type: "PUSH-NOTIFICATION",
        },
        jobOptions,
      );
      console.log(`-> Dispatched to PUSH queue for ${userId}`);
    } else if (differ > 172800) {
      await EmailNotification.add(
        "email-job",
        {
          userId,
          message,
          type: "EMAIL_SUMMARY",
        },
        jobOptions,
      );
      console.log(`-> Dispatched to EMAIL queue for ${userId}`);
    }
    // AWAY: Yahan tumhari marzi hai, shayad sirf In-App hi kafi ho
    // ya phir "Silent Push" bhej do.
  },
  { connection: Client },
);

orchestratorWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.log(`[DLQ] Moving Job ${job.id} to failed-notification queue.`);
    // Failed queue mein data save
    await dlqQueue.add("failed-log", {
      originalData: job.data,
      error: err.message,
      attempts: job.attemptsMade,
    });
  }
});

// const dlqQueue = new Queue('Email-dlq',{connection: Client});
// const dlqQueue = new Queue('PushNotification-dlq',{connection: Client});
// const dlqQueue = new Queue('inAppNotification-dlq',{connection: Client});
