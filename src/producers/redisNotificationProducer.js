import Client from "../services/redisClient.js";
export const redisStreamNotification = async(data)=>{
      const notificationPayload = {
    id: Date.now().toString(),
    userId:data.userId,
    message:data.message,
    type: data.type || "GENERIC",
    timeStamp: Math.floor(Date.now() / 1000), // Fix 1: Math (M capital)
  };
    try {
    // '*' ka matlab hai Redis khud ID generate karega stream ke liye
    await Client.xadd(
      "notifications_stream",
      "*",
      "message",
      JSON.stringify(notificationPayload),
    );

    console.log(`[Producer] Notification queued for user: ${userId}`);
  } catch (error) {
    // Yahan 'error' hai
    console.error("Redis XADD Error:", error); // Fix 2: 'error' (err nahi)
  }
}
