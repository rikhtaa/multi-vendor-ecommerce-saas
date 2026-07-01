import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import { recommendProducts } from "../services/recommendationService";

export const getRecommenedProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const products = await prisma.products.findMany({
      include: { images: true, Shop: true },
    });

    if (products.length === 0) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    const userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true, recommendations: true, lastTrained: true },
    });

    // no analytics at all → fallback
    if (!userAnalytics) {
      return res.status(200).json({
        success: true,
        recommendations: products.slice(-10),
      });
    }

    const actions = Array.isArray(userAnalytics.actions)
      ? (userAnalytics.actions as any[])
      : [];

    // not enough actions → fallback
    if (actions.length < 50) {
      return res.status(200).json({
        success: true,
        recommendations: products.slice(-10),
      });
    }

    const now = new Date();
    const lastTrainedTime = userAnalytics.lastTrained
      ? new Date(userAnalytics.lastTrained)
      : null;
    const hoursDiff = lastTrainedTime
      ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60)
      : Infinity;

    const storedIds = Array.isArray(userAnalytics.recommendations)
      ? (userAnalytics.recommendations as string[])
      : [];

    // reuse stored recommendations if fresh and valid
    if (hoursDiff < 3 && storedIds.length > 3) {
      const matched = products.filter((p) => storedIds.includes(p.id));

      // stored IDs are stale/mismatched → regenerate
      if (matched.length > 0) {
        return res.status(200).json({
          success: true,
          recommendations: matched,
        });
      }
    }

    // generate new recommendations
    const recommendedIds = await recommendProducts(userId, products);

    if (!recommendedIds || recommendedIds.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: products.slice(-10),
      });
    }

    const recommendedProducts = products.filter((p) =>
      recommendedIds.includes(p.id)
    );

    // save to DB for future reuse
    await prisma.userAnalytics.update({
      where: { userId },
      data: {
        recommendations: recommendedIds,
        lastTrained: now,
      },
    });

    return res.status(200).json({
      success: true,
      recommendations:
        recommendedProducts.length > 0
          ? recommendedProducts
          : products.slice(-10), // fallback if model returned non-matching IDs
    });
  } catch (error) {
    console.log("ERROR in getRecommendedProducts:", error);
    return next(error);
  }
};