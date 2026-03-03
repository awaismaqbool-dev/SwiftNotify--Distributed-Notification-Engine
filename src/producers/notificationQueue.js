import { Queue } from 'bullmq';
import Client from '../services/redisClient.js';

const notificationQueue = new Queue('notification-queue',{
    connection: Client
});

export const addNotificationQueue= async (data)=>{
     const notificationPayload = {
    id: Date.now().toString(),
    userId:data.userId,
    message:data.message,
    type: data.type || "GENERIC",
    timeStamp: Math.floor(Date.now() / 1000), // Fix 1: Math (M capital)
  };
    await notificationQueue.add('notification-job',notificationPayload, {
        attempts: 3, // Agar fail ho toh 3 baar retry kare
        backoff: {
      type: 'exponential',
      delay: 5000 // Pehla retry 5 sec baad
    }
    })
    
}
