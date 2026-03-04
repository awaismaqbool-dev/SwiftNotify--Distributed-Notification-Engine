import express, { json } from "express";
import trackActivity from "./src/middleware/activityTracker.js";
import Client from "./src/services/redisClient.js";
import { redisStreamNotification } from "./src/producers/redisNotificationProducer.js";
import { addNotificationQueue } from "./src/producers/notificationQueue.js";
const app = express();
const PORT = 8585;
app.use(express.json());
app.use(trackActivity);

app.get("/status/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  const lastSeen = await Client.get(`User: ${userId}: last seen`);

  if (!lastSeen) {
    return res.json({ status: "OFFLINE" });
  }
  const differ = Math.floor(Date.now() / 1000) - parseInt(lastSeen);
  if (differ < 120) {
    return res.json({ status: "ONLINE" });
  } else if (differ < 3600) {
    // 1 Hour tak
    return res.json({
      status: "RECENTLY_ACTIVE",
      message: "User was active in the last hour",
    });
  } else if (differ < 172800) {
    // 2 Days tak
    return res.json({
      status: "AWAY",
      message: "User is offline for a while,",
    });
  } else {
    return res.json({ status: "DEEP_OFFLINE" });
  }
});

app.post("/notify", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "missing userId or message" });
  }
  // await redisStreamNotification({userId, message})
  // res.json({ success: true, message: "Job added to Rdis Stream!" });
  await addNotificationQueue({userId, message})
res.json({ success: true, message: "Job added to BullMQ!" });

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
