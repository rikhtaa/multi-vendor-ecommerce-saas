import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export const kafka = new Kafka({
  clientId: "eshop",
  brokers: [
    process.env.KAFKA_BROKER as string,
  ],
  ssl: {
  ca: [fs.readFileSync(path.join(process.cwd(), 'apps/auth-service/src/certs/ca.pem'), 'utf-8')],
  cert: fs.readFileSync(path.join(process.cwd(), 'apps/auth-service/src/certs/service.cert'), 'utf-8'),
  key: fs.readFileSync(path.join(process.cwd(), 'apps/auth-service/src/certs/service.key'), 'utf-8'),
  },
  connectionTimeout: 30000,
  requestTimeout: 60000,
  retry: {
    initialRetryTime: 1000,
    retries: 10,
  },
});