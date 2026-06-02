import { kafka } from "packages/utils/kafka";

let producer: any;
let connected = false;

export const getProducer = async () => {
  if (!producer) {
    producer = kafka.producer();
  }

  if (!connected) {
    await producer.connect();
    connected = true;
  }

  return producer;
};