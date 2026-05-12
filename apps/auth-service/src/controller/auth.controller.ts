import { NextFunction, Request, Response } from "express";
import { checkOtpRegstrictions, handleForgetPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgetPasswordOtp, verifyOtp } from "../utils/auth.helper";
import { AuthError, validationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";

// Register a new user
export const userRegistration = async (req: Request, res: Response, next:NextFunction) => {
   try {
     validateRegistrationData(req.body, "user")
    const {name, email} = req.body

    const existingUser = await prisma.users.findUnique({ where: {email: email} })

    if(existingUser){
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
  next:NextFunction) => {
   try {
    const {email,otp,password,name} = req.body
    if(!email || !otp || !password  || !name){
      return next(new validationError("All fields are required!"))
    }
    
    const existingUser = await prisma.users.findUnique({ where: {email: email} })

    if(existingUser){
      return next(new validationError("User already exists with this email!"))
    }

    await verifyOtp(email,otp,next)
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.users.create({
      data: {name, email, password: hashedPassword}
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
  next:NextFunction) => {
   try {
    const {email, password} = req.body
    if(!email || !password){
      return next(new validationError("Email and password are required!"))
    }
    
    const user = await prisma.users.findUnique({ where: {email: email} })

    if(!user){
      return next(new validationError("User doesn't exists!"))
    }
    
    // verify password
    const isMatch = await bcrypt.compare(password, user.password!)
    if(!isMatch){
      return next(new AuthError("Invalid email or password"))
    }

    //Generate access and refresh token
    const accessToken = jwt.sign(
      {id: user.id, role: "user"},
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m"
    }
    )

    const refreshToken = jwt.sign(
      {id: user.id, role: "user"},
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
      user: { id: user.id, email: user.email, name: user.name}
    })
   } catch (error) {
     return next(error)
   }
}

// login user
export const userForgetPassword = async (
  req: Request, 
  res: Response, 
  next:NextFunction) => {
   try {
    await handleForgetPassword(req,res,next, 'user')
   } catch (error) {
     return next(error)
    }
  }
  
// login user
export const resetUserPassword = async (
    req: Request, 
    res: Response, 
    next:NextFunction) => {
     try {
      const {email, newPassword} = req.body
      if(!email || !newPassword){
        return next(new validationError("Email and password are required!"))
      }
      
      const user = await prisma.users.findUnique({ where: {email: email} })
  
      if(!user){
        return next(new validationError("User not found!"))
      }
      
      // compare new password with the existing one
      const isSamePassword = await bcrypt.compare(newPassword, user.password!)
      
      if(isSamePassword){
        return next(new validationError("New password cannot be the same as the old password!"))
      }
      
      // hash  the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await prisma.users.update({
        where: {email},
        data: { password: hashedPassword}
      })
      
      res.status(201).json({
        message: "password reset successfully!"})
     } catch (error) {
       return next(error)
     }
}

// login user
export const verifyForgetPassword = async (
    req: Request, 
    res: Response, 
    next:NextFunction) => {

    await verifyForgetPasswordOtp(req, res, next)  
}

