import { validationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { Prisma } from "@prisma/client";
import { NextFunction, Response } from "express";
import Stripe from "stripe"
import { sendEmail } from "../utils/send-email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia"
})

// create payment intent
export const createPaymentIntent = async (req: any, res: Response, next: NextFunction) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body

  const customerAmount = Math.round(amount * 100)
  const platformFee = Math.floor(customerAmount * 0.1)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req.user.id
      }
    })
    res.send({
      clientSecret: paymentIntent.client_secret,
    })

    console.log("sellerStripeAccountId:", sellerStripeAccountId)

  } catch (error) {
    return next(error)
  }
}

// create payment session
export const createPaymentSession = async (req: any, res: Response, next: NextFunction) => {
  try {

    const { cart, selectedAddressId, coupon } = req.body
    const userId = req.user.id

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new validationError("Cart is empty or invalid."))
    }

    const normailizedCart = JSON.stringify(
      cart.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        sale_price: item.sale_price,
        shopId: item.shopId,
        selectedOptions: item.selectedOptions || {},
      }))
        .sort((a, b) => a.id.localeCompare(b.id))
    )

    const keys = await redis.keys("payment-session:*")
    for (const key of keys) {
      const data = await redis.get(key)

      if (data) {
        const session =
          typeof data === "string"
            ? JSON.parse(data)
            : data
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              sale_price: item.sale_price,
              shopId: item.shopId,
              selectedOptions: item.selectedOptions || {},
            }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          )

          if (existingCart === normailizedCart) {
            return res.status(200).json({ sessionId: key.split(":")[1] })
          } else {
            await redis.del(key)
          }
        }
      }
    }

    // fetch sellers and their stripe accounts
    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))]

    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShopIds }
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true
          }
        }
      }
    })

    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountOd: shop?.sellers?.stripeId
    }))

    // calculate total
    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.sale_price
    }, 0)

    //create session payload
    const sessionId = crypto.randomUUID()

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null
    }

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    )

    return res.status(201).json({ sessionId })
  } catch (error) {
    return next(error)
  }
}

// create payment session
export const verifyingPaymentSession = async (req: any, res: Response, next: NextFunction) => {
  try {

    const sessionId = req.query.sessionId as string
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." })
    }

    const sessionKey = `payment-session:${sessionId}`
    const sessionData = await redis.get(sessionKey)

    if (!sessionData) {
      return res.status(404).json({ error: "Session not found or expired." })
    }

    // Parse and return session
    const session = typeof sessionData === "string"
      ? JSON.parse(sessionData)
      : sessionData;

    return res.status(200).json({
      success: true,
      session,
    })
  } catch (error) {
    return next(error)
  }
}

// create order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const stripeSignature = req.headers["stripe-signature"]
    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe signature")
    }

    const rawBody = (req as any).rawBody

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      console.log("webhook signature verification failed.", err.message)
      return res.status(400).send(`webhook Error: ${err.message}`)
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn("Session data expired or missing for", sessionId);
        return res
          .status(200)
          .send("No session found, skipping order creation");
      }

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData)

      const user = await prisma.users.findUnique({ where: { id: userId } });
      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
        )

        let orderTotal = orderItems.reduce(
          0
        )
        //Apply discount if applicable
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedproductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          )
          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                  discountedItem.quantity *
                  coupon.discountPercent) /
                100
                : coupon.discountAmount
            orderTotal -= discount
          }
        }

        //create order
        await prisma.orders.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: "Paid",
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                selectedOptions: item.selectedOptions,
              }))
            }
          }
        })

        //update product & analytics
        for (const item of orderItems) {
          const { id: productId, quantity } = item

          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity }
            }
          })

          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date()
            },
            update: {
              purchases: { increment: quantity }
            }
          })

          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId },
          })

          const newAction = {
            productId,
            shopId,
            action: "purchase",
            timestamp: Date.now()
          }

          const currentActions = Array.isArray(existingAnalytics?.actions)
            ? (existingAnalytics.actions as Prisma.JsonArray)
            : []

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: { userId },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            })
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
              }
            })
          }
        }

        //send email for user
        await sendEmail(
          email,
          " Your Eshop Order Confirmation",
          "order-confirmation",
          {
            name,
            cart,
            totalAmount: coupon?.discountAmount
              ? totalAmount - coupon?.discountAmount
              : totalAmount,
            trackingUrl: `https://eshop.com/order/${sessionId}`
          }
        )

        // Create notifications for sellers
        const createdShopIds = Object.keys(shopGrouped)
        const sellerShops = await prisma.shops.findMany({
          where: { id: { in: createdShopIds } },
          select: {
            id: true,
            sellerId: true,
            name: true
          }
        })

        for (const shop of sellerShops) {
          const firstProduct = shopGrouped[shop.id][0];
          const productTitle = firstProduct?.title || "new item";

          await prisma.notifications.create({
            data: {
              title: "🛒 New Order Received",
              message: `A customer just ordered ${productTitle} from your shop.`,
              creatorId: userId,
              receiverId: shop.sellerId,
              redirect_link: `https://eshop.com/order/${sessionId}`,
            },
          });
        }

        // Create notification for admin
        await prisma.notifications.create({
          data: {
            title: "📦 Platform Order Alert",
            message: `A new order was placed by ${name}.`,
            creatorId: userId,
            receiverId: "admin",
            redirect_link: `https://eshop.com/order/${sessionId}`,
          },
        });

        await redis.del(sessionKey)
      }
    }
    res.status(200).json({ received: true })
  } catch (error) {
    console.log(error)
    return next(error)
  }
}