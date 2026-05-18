import crypto from "crypto"
import { validationError } from "../../../../packages/error-handler"
import redis from "../../../../packages/libs/redis"
import { sendEmail } from "./sendMail"
import { Response, Request,NextFunction } from "express"
import prisma from "@packages/libs/prisma"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateRegistrationData = (data: any, userType: "user" | "seller") =>{
    const { name, email, password, phone_number, country } = data

    if(
        !name ||
        !email ||
        !password || (userType === "seller" && (!phone_number || !country))
    ){
        throw new validationError(`Missing required fields!`)
    }

    if(!emailRegex.test(email)){
        throw new validationError("Invalid email format!")
    }
}

export const checkOtpRegstrictions = async (email:string,next:NextFunction)=> {
  if(await redis.get(`otp_lock:${email}`)){
    return next(
        new validationError(
            "Account locked due to multiple failed attempts! Try again after 30 minutes"
        )
    )
  }
  if(await redis.get(`otp_spam_lock:${email}`)){
    return next(
        new validationError(
            "Too many OTP requests! Please wait 1hour before requesting again."
        )
    )
  }
  if(await redis.get(`otp_cooldown:${email}`)){
    return next(
        new validationError(
            "Please wait 1minute before requesting a new OTP!"
        )
    )
  }
}

export const trackOtpRequests = async (email:string,next:NextFunction)=> {
   const otpRequestKey = `otp_request_count:${email}`
   let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0")

   if(otpRequests >= 2){
     await redis.set(`otp_spam_lock:${email}`, "locked", {ex: 3600}) // Lock for 1hr
     return next(new validationError("Too many OTP requests. Please wait 1 hour before requesting again."))
   }
}

export const sendOtp = async (name:string,email:string,template:string)=> {
   const otp = crypto.randomInt(1000, 9999).toString()
   await sendEmail(email, "Verify Your Email", template, {name, otp})
   await redis.set(`otp:${email}`, otp, {ex: 300})
   await redis.set(`otp_cooldown:${email}`, "true", {ex: 60})
}

export const verifyOtp = async (email:string, otp:string, next:NextFunction) => {
   const storedOtp = await redis.get(`otp:${email}`)

   if(!storedOtp){
    throw new validationError("Invalid or expired OTP!")
   }

  const failedAttemptKey = `otp_attempts:${email}`
  const failedAttempts = parseInt((await redis.get(failedAttemptKey)) || "0")

  if(storedOtp.toString() !== otp.toString()){  
    if(failedAttempts >= 2){
        await redis.set(`otp_lock:${email}`, "locked", {ex: 1800})
        await redis.del(`otp:${email}`, failedAttemptKey)
        throw new validationError("Too many failed attempts. Your account is locked for 30 minutes!")
    }
    await redis.set(failedAttemptKey, failedAttempts + 1, {ex: 300})
    throw new validationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`)
  }
  await redis.del(`otp:${email}`, failedAttemptKey)
}

export const handleForgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
    userType: "user" | "seller"
) => {
    try {
      const {email} = req.body

      if(!email)  throw new validationError("Email is required!")

     const user = userType === "user" ? 
     (await prisma.users.findUnique({where: {email}})) : await prisma.sellers.findUnique({where: {email}})

     if(!user)  throw new validationError(`${userType} not found!`)

     // Check otp restrictions
     await checkOtpRegstrictions(email,next)
     await trackOtpRequests(email,next)

     // Generate OTP and send Email
     await sendOtp(user.name, email, userType === "user" ?  "forgot-password-user-mail" : "forgot-password-seller-mail")
     
     res
      .status(200)
      .json({message: "OTP sent to email. Please verify your account."})
    } catch (error) {
        next(error)
    }
}
 
export const verifyForgetPasswordOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
      const {email, otp} = req.body
      if(!email || !otp){
        return next(new validationError("Email and OTP are required!"))
      }

      await verifyOtp(email, otp, next)
      
      res.status(200).json({
        message: "OTP verified. You can now reset your password."})
    } catch (error) {
      next(error)
    }
}
