import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();


export const kafka = new Kafka({
  clientId: "eshop",
  brokers: [
    "d8a4r8ghvfrjvm53ueu0.any.us-east-1.mpx.prd.cloud.redpanda.com:9092",
  ],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  },
});