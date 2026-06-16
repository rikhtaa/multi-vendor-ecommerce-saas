"use client"
import { AuthError, validationError } from "@packages/error-handler"
import prisma from "@packages/libs/prisma"
import { NextFunction, Response } from "express"

// get All products 
export const getAllProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        where: {
          isDeleted: false,
        },
        orderBy: {
          totalSales: "desc"
        },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({
        where: {
          starting_date: null,
        }
      })
    ])

    const totalPages = Math.ceil(totalProducts / limit)

    return res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages
      }
    })

  } catch (error) {
    next(error)
  }
}

//get All products 
export const getAllEvents = async (req: any, res: Response, next: NextFunction) => {
  try {

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [events, totalEvents] = await Promise.all([
      prisma.products.findMany({
        where: {
          isDeleted: false
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          starting_date: true,
          ending_date: true,
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: { name: true }
          },
        },
      }),
      prisma.products.count({
        where: {
          starting_date: {
            not: null
          },
        },
      }),
    ])

    const totalPages = Math.ceil(totalEvents / limit)

    return res.status(200).json({
      success: true,
      data: events,
      meta: {
        totalEvents,
        currentPage: page,
        totalPages,
      }
    })

  } catch (error) {
    next(error)
  }
}

// get all admins
export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const admins = await prisma.users.findMany({
      where: {
        role: "admin"
      },
    })

    return res.status(200).json({
      success: true,
      admins,
    })

  } catch (error) {
    next(error)
  }
}

// add new admin
export const addNewAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {

    const { email, role } = req.body

    const isUser = await prisma.users.findUnique({ where: { email } })
    if (!isUser) {
      return next(new validationError("Something went wrong!"))
    }

    const updateRole = await prisma.users.update({
      where: { email },
      data: {
        role,
      },
    })

    return res.status(201).json({
      success: true,
      updateRole,
    })

  } catch (error) {
    next(error)
  }
}

// get all customizations
export const getAllCustomizations = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const config = await prisma.site_config.findFirst()

    return res.status(200).json({
      categories: config?.categories || [],
      subCategories: config?.subCategories || [],
      logo: config?.logo || null,
      banner: config?.banner || null
    })
  } catch (error) {
    next(error)
  }
}

// get all users
export const getAllUsers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.users.count(),
    ])

    const totalPages = Math.ceil(totalUsers / limit)

    return res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalUsers,
        currentPage: page,
        totalPages,
      }
    })
  } catch (error) {
    next(error)
  }
}

// get all sellers
export const getAllSellers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [sellers, totalSellers] = await Promise.all([
      prisma.sellers.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          shop: {
            select: {
              name: true,
              avatar: true,
              address: true
            }
          }
        },
      }),
      prisma.sellers.count(),
    ])

    const totalPages = Math.ceil(totalSellers / limit)

    return res.status(200).json({
      success: true,
      data: sellers,
      meta: {
        totalSellers,
        currentPage: page,
        totalPages,
      }
    })
  } catch (error) {
    next(error)
  }
}

// get all notifications 
export const getAllNotifications = async (req: any, res: Response, next: NextFunction) => {
    try {
        const notifications = await prisma.notifications.findMany({
            orderBy: { createdAt: "desc" }
        })

        return res.status(200).json({ success: true, notifications })
    } catch (error) {
        return next(error)
    }
}

// get user notifications 
export const getUserNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: req.user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json({
      success: true,
      notifications,
    })
  } catch (error) {
    return next(error)
  }
}

// get logged inadmin
export const getLoggedInAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        return res.status(200).json({ success: true, admin: req.admin })
    } catch (error) {
        return next(error)
    }
}