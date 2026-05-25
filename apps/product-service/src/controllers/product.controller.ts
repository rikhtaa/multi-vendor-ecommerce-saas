import { AuthError, NotFoundError, validationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma"
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
//get product categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.site_config.findFirst()

    if (!config) {
      return res.status(404).json({
        message: "Categories not found."
      })

    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    })

  } catch (error) {
    return next(error)
  }
}

// Create discount codes
export const createDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode
      }
    })

    if (isDiscountCodeExist) {
      return next(
        new validationError("Discount code already please use a different code!")
      )
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id
      }
    })

    res.status(201).json({
      success: true,
      discount_code
    })

  } catch (error) {
    return next(error)
  }
}

// Create discount codes
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
  try {

    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id
      }
    })

    res.status(201).json({
      success: true,
      discount_codes
    })

  } catch (error) {
    return next(error)
  }
}

// delete discount codes
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
  try {

    const { id } = req.params
    const sellerId = req.seller?.id

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true }
    })

    if (!discountCode) {
      return next(
        new NotFoundError("Discount code not found!")
      )
    }

    if (discountCode.sellerId !== sellerId) {
      return next(
        new validationError("Unauthorized access!")
      )
    }

    await prisma.discount_codes.delete({ where: { id } })

    return res.status(200).json({ message: "Discount code succesfully deleted" })

  } catch (error) {
    return next(error)
  }
}

// upload Product Image
export const uploadProductImage = async (req: any, res: Response, next: NextFunction) => {
  try {

    const { fileName } = req.body

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products"
    })

    return res.status(201).json({
      file_url: response.url,
      fileId: response.fileId
    })

  } catch (error) {
    return next(error)
  }
}

//delete product image
export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { fileId } = req.body

    const response = await imagekit.deleteFile(fileId)

    return res.status(201).json({
      success: true,
      response,
    })

  } catch (error) {
    return next(error)
  }
}

//create product 
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {

    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      Subcategory,
      custom_properties = {},
      images = [],
    } = req.body

    if (!title ||
      !slug ||
      !short_description ||
      !category ||
      !Subcategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price ||
      !stock
    ) {
      return next(new validationError("Missing required fields"))
    }

    if (!req.seller.id) {
      return next(new AuthError("Only seller can create products!"))
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      }
    })

    if (slugChecking) {
      return next(new validationError("Slug already exists! Please use a different slug!"))
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: Array.isArray(tags)? tags : tags.split(","),
        brand,
        video_url,
        category,
        subCategory: Subcategory,
        colors: colors || [],
        discount_codes: discountCodes,
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: custom_properties || {},
        custom_specifications: custom_specifications || {}, 
        images: {
          create: images
          .filter((img:any) => img && img.fileId && img.file_url)
          .map((img: any)=> ({
          file_id: img.fileId,
          url: img.file_url
        }))
        } 
      },
      include: {images: true}
    })

    res.status(201).json({
      success: true,
      newProduct
    })

  } catch (error) {
    return next(error)
  }
}

//get  logged in seller products
export const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
  try {

    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id
      },
       include: {
        images: true
       }
    })

    return res.status(201).json({
      success: true,
      products,
    })

  } catch (error) {
    return next(error)
  }
}

//delete product 
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
  try {

    const {productId} = req.params
    const shopId = req.seller?.shop?.id

    const product = await prisma.products.findUnique({
       where: {id: productId},
       select: {id: true, shopId: true, isDeleted: true}
    })

     if (!product) {
      return next(
        new NotFoundError("Product not found")
      )
    }

    if (product.shopId !== shopId) {
      return next(
        new validationError("Unauthorized access")
      )
    }

    if (product.isDeleted) {
      return next(
        new validationError("Product is already deleted")
      )
    }

    const deletedProduct = await prisma.products.update({
      where: {id: productId},
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    })
    
    return res.status(200).json({
      success: "Product is scheduled for deletion is 24 hours. You can restore it within this time.",
      deletedAt: deletedProduct.deletedAt
    })

  } catch (error) {
    return next(error)
  }
}

//restore product 
export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
  try {

    const {productId} = req.params
    const sellerId = req.seller?.shop?.id

    const product = await prisma.products.findUnique({
       where: {id: productId},
       select: {id: true, shopId: true, isDeleted: true}
    })

     if (!product) {
      return next(
        new NotFoundError("Product not found")
      )
    }

    if (product.shopId !== sellerId) {
      return next(
        new validationError("Unauthorized access")
      )
    }

    if (!product.isDeleted) {
      return res
       .status(400)
       .json({message: "Product is already deleted state"})
    }

    await prisma.products.update({
      where: {id: productId},
      data: {
        isDeleted: false,
        deletedAt: null,
      }
    })
    
    return res.status(200).json({message: "Product successfully restored!"})
  } catch (error) {
    return res.status(500).json({message: "Error restoring product", error})
  }
}

//get All products 
export const getAllProducts = async (req: any, res: Response, next: NextFunction) => {
  try {

   const page = parseInt(req.query.page as string) || 1
   const limit = parseInt(req.query.limit as string) || 20
   const skip = (page - 1) * limit
   const type = req.query.type

   const baseFilter = {
      isDeleted: false
   }

   const orderBy: Prisma.productsOrderByWithRelationInput =
   type === "latest"
    ? {createAt: "desc" as Prisma.SortOrder}
    : {totalSales: "desc" as Prisma.SortOrder}

   const [products,total,top10Products] = await Promise.all([
    prisma.products.findMany({
      skip,
      take: limit,
      include: {
        images: true,
        shop: true
      },
      where: baseFilter,
      orderBy: {
        totalSales: "desc"
      }
    }),

    prisma.products.count({where: baseFilter}),
    prisma.products.findMany({
      take: 10,
      where: baseFilter,
      orderBy,
    })
   ])
    
    return res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    next(error)
  }
}