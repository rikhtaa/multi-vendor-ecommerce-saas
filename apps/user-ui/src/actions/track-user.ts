"use server";

import { getProducer } from "../lib/kafka-producer";
import { validateUserEvent } from "packages/utils/events/user-event.schema";

export async function sendKafkaEvent(eventData: unknown) {
  try {
    const result = validateUserEvent(eventData);

    if (!result.success) {
      console.log("Invalid event:", result.error.flatten());
      return; 
    }

    const producer = await getProducer();

    await producer.send({
      topic: "users-events",
      messages: [
        {
          value: JSON.stringify(result.data),
        },
      ],
    });
  } catch (error) {
    console.log("Kafka send error:", error);
  }
}