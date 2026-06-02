import { z } from "zod";

export const UserEventSchema = z.object({
    userId: z.string().min(1),

    productId: z.string().optional(),
    shopId: z.string().optional(),

    action: z.enum([
        "add_to_wishlist",
        "add_to_cart",
        "product_view",
        "remove_from_cart",
        "remove_from_wishlist",
    ]),

    device: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
});

export type UserEvent = z.infer<typeof UserEventSchema>;

export const validateUserEvent = (data: unknown) => {
    return UserEventSchema.safeParse(data);
};