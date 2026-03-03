import Redis from "ioredis"
import { error } from "node:console";

const Client = new Redis;

export default Client;