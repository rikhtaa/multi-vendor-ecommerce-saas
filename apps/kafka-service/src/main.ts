import { kafka } from "@packages/utils/kafka";
import {
  updateUserAnalytics,
  updateProductAnalytics,
} from "./services/analytics.service";

const consumer = kafka.consumer({ groupId: "user-events-group" });

const queue: any[] = [];

const processQueue = async () => {
  if (!queue.length) return;

  const batch = queue.splice(0, queue.length);

  for (const event of batch) {
    try {
      const validActions = [
        "add_to_wishlist",
        "add_to_cart",
        "product_view",
        "remove_from_cart",
        "remove_from_wishlist",
      ];

      if (!validActions.includes(event.action)) continue;

      try {
        await updateUserAnalytics(event);
      } catch (err) {
        console.log("user analytics failed:", err);
      }

      try {
        await updateProductAnalytics(event);
      } catch (err) {
        console.log("product analytics failed:", err);
      }
    } catch (err) {
      console.log("event error:", err);
    }
  }
};

setInterval(processQueue, 3000);

export const startConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: "users-events",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());
        if (!event?.action || !event?.userId) return;
        queue.push(event);
      } catch (err) {
        console.log(
          "Skipping invalid Kafka message:",
          message.value.toString()
        );
      }
    },
  });
};

startConsumer().catch(console.error);

