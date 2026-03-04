import { Worker, Queue } from 'bullmq';
import Client from '../services/redisClient.js';

const email_dlqQueue = new Queue('Email-dlq',{connection: Client});
const push_dlqQueue = new Queue('PushNotification-dlq',{connection: Client});
const inApp_dlqQueue = new Queue('inAppNotification-dlq',{connection: Client});

// 1. In-App Worker (Count Update Logic)
const inApppWorker = new Worker ('inAppNotification-Queue', async(job)=>{
    const {userId, message} = job.data;
    await Client.incr(`user:${userId}:unread_count`)
    const currentCount = await Client.get(`user:${userId}:unread_count`);
        console.log(`[In-App] new notification ${message} and updating count`);
    console.log(`[Status]  Total Unread for ${userId}: ${currentCount}`)

},{connection:Client});

// 2. Push Worker (Recently Active Users)
const pushWorker = new Worker ('PushNotification-Queue', async(job)=>{
    const {userId, message} = job.data;
    console.log(`[Push] Sending Mobile Notification to ${userId}: ${message}`);
},{connection:Client});

// 3. Email Worker (Away Users)
const emailWorker = new Worker ('Email-Queue', async(job)=>{
    const {userId, message} = job.data;
    console.log(`[Email] 📧 Sending Email Summary to ${userId}`);
},{connection:Client});

console.log("✅ All Delivery Workers are running and listening...");

// dlqs 

inApppWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.log(`[DLQ] Moving Job ${job.id} to failed-In App notification queue.`);
    // Failed queue mein data save
    await inApp_dlqQueue.add("failed-log", {
      originalData: job.data,
      error: err.message,
      attempts: job.attemptsMade,
    });
      }
});

pushWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.log(`[DLQ] Moving Job ${job.id} to failed-Push notification queue.`);
    // Failed queue mein data save
    await push_dlqQueue.add("failed-log", {
      originalData: job.data,
      error: err.message,
      attempts: job.attemptsMade,
    });
      }
});
pushWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.log(`[DLQ] Moving Job ${job.id} to failed-Push notification queue.`);
    // Failed queue mein data save
    await push_dlqQueue.add("failed-log", {
      originalData: job.data,
      error: err.message,
      attempts: job.attemptsMade,
    });
      }
});
emailWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.log(`[DLQ] Moving Job ${job.id} to failed-Email notification queue.`);
    // Failed queue mein data save
    await email_dlqQueue.add("failed-log", {
      originalData: job.data,
      error: err.message,
      attempts: job.attemptsMade,
    });
      }
});