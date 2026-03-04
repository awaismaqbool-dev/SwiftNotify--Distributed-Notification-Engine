import Redis from "ioredis"
import { error } from "node:console";

const Client = new Redis({
    host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
});

export default Client;