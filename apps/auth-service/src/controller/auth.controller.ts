import { NextFunction, Request, Response } from "express";
import { checkOtpRegstrictions, handleForgetPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgetPasswordOtp, verifyOtp } from "../utils/auth.helper";
import { AuthError, NotFoundError, validationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs"
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe"
import { sendLog } from "@packages/utils/logs/send-logs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})

// Register a new user
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateRegistrationData(req.body, "user")
    const { name, email } = req.body

    const existingUser = await prisma.users.findUnique({ where: { email: email } })

    if (existingUser) {
      return next(new validationError("User already exists with this email!"))
    }

    await checkOtpRegstrictions(email, next)
    await trackOtpRequests(email, next)
    await sendOtp(name, email, "user-activation-mail")

    res.status(200).json({
      message: "OTP sent to email. Please verify your account."
    })
  } catch (error) {
    return next(error)
  }
}

// verify user with otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    const { email, otp, password, name } = req.body
    if (!email || !otp || !password || !name) {
      return next(new validationError("All fields are required!"))
    }

    const existingUser = await prisma.users.findUnique({ where: { email: email } })

    if (existingUser) {
      return next(new validationError("User already exists with this email!"))
    }

    await verifyOtp(email, otp, next)
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.users.create({
      data: { name, email, password: hashedPassword }
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully!"
    })
  } catch (error) {
    return next(error)
  }
}

// login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return next(new validationError("Email and password are required!"))
    }

    const user = await prisma.users.findUnique({ where: { email: email } })

    if (!user) {
      return next(new validationError("User doesn't exists!"))
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!)
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"))
    }

    res.clearCookie("access_token")
    res.clearCookie("refresh_token")


    //Generate access and refresh token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m"
      }
    )

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d"
      }
    )

    // store the refresh and access token in an httOnly secure cookie 
    setCookie(res, "refresh_token", refreshToken)
    setCookie(res, "access_token", accessToken)

    res.status(201).json({
      message: "Login successfull!",
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error) {
    return next(error)
  }
}

// refresh Token 
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] ||
      req.cookies["seler-refresh_token"] ||
      req.headers.authorization?.split(" ")[1]

    if (!refreshToken) {
      return next(new validationError("Unauthorized! No refresh token."))
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string }

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError("Forbidden! Invalid refresh token."))
    }

    let account
    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decoded.id } })
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true }
      })
    }

    if (!account) {
      return new AuthError("Forbidden! User/Seller not found")
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    )

    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken)
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken)
    }

    req.role = decoded.role

    return res.status(201).json({ success: true })
  } catch (error) {
    return next(error)
  }
}

// get logged in user
export const getUser = async (
  req: any,
  res: Response,
  next: NextFunction) => {
  try {
    const user = req.user
    await sendLog({
      type: "success",
      message: `User data retrieved ${user?.email}`,
      source: "auth-service",
    })

    return res.status(201).json({ success: true, user })
  } catch (error) {
    return next(error)
  }
}

// user forgot password
export const userForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    await handleForgetPassword(req, res, next, 'user')
  } catch (error) {
    return next(error)
  }
}

// user reset password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    const { email, newPassword } = req.body
    if (!email || !newPassword) {
      return next(new validationError("Email and password are required!"))
    }

    const user = await prisma.users.findUnique({ where: { email: email } })

    if (!user) {
      return next(new validationError("User not found!"))
    }

    // compare new password with the existing one
    const isSamePassword = await bcrypt.compare(newPassword, user.password!)

    if (isSamePassword) {
      return next(new validationError("New password cannot be the same as the old password!"))
    }

    // hash  the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword }
    })

    res.status(201).json({
      message: "password reset successfully!"
    })
  } catch (error) {
    return next(error)
  }
}

// verify user password
export const verifyForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction) => {

  await verifyForgetPasswordOtp(req, res, next)
}

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    validateRegistrationData(req.body, "seller")
    const { name, email } = req.body

    const existingSeller = await prisma.sellers.findUnique({ where: { email: email } })

    if (existingSeller) {
      return next(new validationError("Seller already exists with this email!"))
    }

    await checkOtpRegstrictions(email, next)
    await trackOtpRequests(email, next)
    await sendOtp(name, email, "seller-activation-mail")

    res.status(200).json({
      message: "OTP sent to email. Please verify your account."
    })


  } catch (error) {
    next(error)
  }
}

// verify seller with OTP
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new validationError("All fields are required!"))
    }

    const existingSeller = await prisma.sellers.findUnique({ where: { email: email } })

    if (existingSeller) {
      return next(new validationError("Seller already exists with this email!"))
    }

    await verifyOtp(email, otp, next)
    const hashedPassword = await bcrypt.hash(password, 10)

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number
      }
    })

    res
      .status(201)
      .json({ seller, message: "Seller registered successfully!" })
  } catch (error) {
    next(error)
  }
}

// create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } = req.body

    if (!name || !bio || !address || !opening_hours || !website || !category || !sellerId) {
      return next(new validationError("All fields are required!"))
    }

    const shopData: any = { name, bio, address, opening_hours, category, sellerId }

    if (website && website.trim() !== "") {
      shopData.website = website
    }

    const shop = await prisma.shops.create({
      data: shopData
    })

    res
      .status(201)
      .json({
        success: true,
        shop,
      })
  } catch (error) {
    next(error)
  }
}

//create stripe connect account link
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body

    if (!sellerId) {
      return next(new validationError("Seller ID are required!"))
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } })

    if (!seller) {
      return next(new validationError("Seller is not available with this id!"))
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    })

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id
      }
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding"
    })

    res.json({ url: accountLink.url })
  } catch (error) {
    next(error)
  }
}

// login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return next(new validationError("Email and password are required!"))
    }

    const seller = await prisma.sellers.findUnique({ where: { email: email } })

    if (!seller) {
      return next(new validationError("User doesn't exists!"))
    }

    // verify password
    const isMatch = await bcrypt.compare(password, seller.password!)
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"))
    }

    res.clearCookie("seller-access-token")
    res.clearCookie("seller-refresh-token")

    //Generate access and refresh token
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m"
      }
    )

    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d"
      }
    )

    // store the refresh and access token in an httOnly secure cookie 
    setCookie(res, "seller-refresh-token", refreshToken)
    setCookie(res, "seller-access-token", accessToken)

    res.status(201).json({
      message: "Login successfull!",
      seller: { id: seller.id, email: seller.email, name: seller.name }
    })
  } catch (error) {
    return next(error)
  }
}

// get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction) => {
  try {
    const seller = req.seller

    return res.status(201).json({ success: true, seller })
  } catch (error) {
    return next(error)
  }
}

// log out admin
export const logOutAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  res.clearCookie("access_token")
  res.clearCookie("refresh_token")

  return res.status(201).json({ success: true })
}

// add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction) => {
  try {
    const userId = req.user?.id
    const {label, name, street, city, zip, country, isDefault} = req.body

    if(!label || !name || !street || !city || !zip || !country ){
      return next(new validationError("All fields are required"))
    }

    if(isDefault){
      await prisma.address.updateMany({
        where:{
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false
        }
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault
      }
    })

    return res.status(201).json({ success: true, address: newAddress })

  } catch (error) {
    return next(error)    
  }
}

// delete new address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction) => {
  try {
    const userId = req.user?.id
    const {addressId} = req.params

    if(!addressId){
      return next(new validationError("Address ID are required"))
    }
    
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      }
    })

    if(!existingAddress){
      return next(new NotFoundError("Address not found or unauthorized"))

    }

    await prisma.address.delete({
      where: {
        id: addressId,
      }
    })

    return res.status(200).json({ success: true, message: "Address deleted successfully" })

  } catch (error) {
    return next(error)    
  }
}

// get new address
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction) => {
  try {
    const userId = req.user?.id
    
    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return res.status(200).json({ success: true, addresses})

  } catch (error) {
    return next(error)    
  }
}

// update user password
export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction) => {
  try {
    const userId = req.user?.id
    const {currentPassword, newPassword, confirmPassword} = req.body

    if(!currentPassword || !newPassword || !confirmPassword){
      return next(new validationError("all fields are required"))
    }
    
    if(newPassword !== confirmPassword){
      return next(new validationError("new passwords do not match"))
    }

    if(newPassword === confirmPassword){
      return next(new validationError("New password cannot be the same as the current password"))
    }

    const user = await prisma.users.findUnique({
      where: {id: userId}
    })

    if(!user || !user.password){
      return next(new AuthError("user not found or password not set"))
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.users.update({
      where: {id: userId},
      data: {password: hashedPassword}
    })

    return res.status(200).json({ message: "password updated successfully" })

  } catch (error) {
    return next(error)    
  }
}

// login admin
export const loginAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new validationError("Email and password are required!"))
        }

        const user = await prisma.users.findUnique({ where: { email } })

        if (!user) return next(new AuthError("User doesn't exist!"))

        // verify password
        const isMatch = await bcrypt.compare(password, user.password!)
        if (!isMatch) {
            return next(new AuthError("Invalid email or password"))
        }

        const isAdmin = user.role === "admin"
        if (!isAdmin) {
            sendLog({
                type: "error",
                message: `Admin login failed for ${email} - not an admin`,
                source: "auth-service"
            })
            return next(new AuthError("Invalid access!"))
        }

        sendLog({
            type: "success",
            message: `Admin login successful: ${email}`,
            source: "auth-service"
        })

        res.clearCookie("seller-access-token")
        res.clearCookie("seller-refresh-token")

        // Generate access and refresh token
        const accessToken = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        )

        // store the refresh and access token in an httpOnly secure cookie
        setCookie(res, "refresh_token", refreshToken)
        setCookie(res, "access_token", accessToken)

        res.status(200).json({  
            message: "Login successful!",
            user: { id: user.id, email: user.email, name: user.name }
        })

    } catch (error) {
        return next(error)
    }
}

// get logged in admin
export const getLoggedInAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true }
        })

        if (!user || user.role !== "admin") {
            return next(new AuthError("Unauthorized"))
        }

        res.status(200).json({ success: true, admin: user })

    } catch (error) {
        return next(error)
    }
}

// fetch layout data
export const getLayoutData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const layout = await prisma.site_config.findFirst()
        
        res.status(200).json({ success: true, layout })

    } catch (error) {
        return next(error)
    }
}

