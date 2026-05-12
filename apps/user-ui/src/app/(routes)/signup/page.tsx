"use client"

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import Link from 'next/link'
import GoogleButton from 'apps/user-ui/src/shared/components/google-button'
import { Eye, EyeOff } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from "axios"

type FormData = {
    name: string
    password: string
}

const signup = () => {
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [canResend, setCanResend] = useState(true)
    const [timer, setTimer] = useState(60)
    const [otp, setOtp] = useState(["","","",""])
    const [userData, setUserData] = useState<FormData | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>()

    const startResendTimer = () =>  {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if(prev <= 1){
                    clearInterval(interval)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const signupMutation = useMutation({
      mutationFn: async (data:FormData) => {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
            data
        )
        return response.data
      },
      onSuccess: (_, formData) => {
        setUserData(formData)
        setShowOtp(true)
        setCanResend(false)
        setTimer(60)
        startResendTimer()
      }
    })

    const verifyOtpMutation = useMutation({
      mutationFn: async () => {
        if(!userData) return
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
            {
              ...userData,

            }
        )
        return response.data
      },
      onSuccess: () => {
        router.push("/login")
      }
    })

    const onSubmit = (data: FormData) => { 
        signupMutation.mutate(data)
    }
    
    const handleOtpChange = (index: number, value: string) => {
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if(value && index < inputRefs.current.length - 1){
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (
        index: number, 
        e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Backspace" && !otp[index] && index > 0){
            inputRefs.current[index - 1]?.focus()
        }
    }

    const resendOtp = () => {

    }
    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className="text-4xl font-poppins font-semibold text-black text-center">
                signup
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home . signup
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
                    <h3 className='text-3xl font-semibold text-center mb-2'>
                        signup to Eshop
                    </h3>
                    <p className="text-center text-gray-500 mb-4">
                        Already have an account?{" "}
                        <Link href={"/login"} className="text-blue-500">
                            Login
                        </Link>
                    </p>
                    <GoogleButton />
                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3">Sign in with</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {!showOtp ? (
                        <form onSubmit={handleSubmit(onSubmit)}>
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            placeholder="Rekhta"
                            className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                            {...register("name", {
                                required: "Name is required"
                            })}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {String(errors.name.message)}
                            </p>
                        )}
                        <label className="block text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Min. 6 characters"
                                className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    },
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className='absolute inset-y-0 right-3 flex items-center text-gray-400'
                            >
                                {passwordVisible ? <Eye /> : <EyeOff />}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-sm">
                                    {String(errors.password.message)}
                                </p>
                            )}
                        </div>
                        <button
                            type='submit'
                            disabled={signupMutation.isPending}
                            className='w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg'
                        >
                            {signupMutation.isPending ? "Signing up..." : "Signup"}
                        </button>
                        {serverError && (
                            <p className="text-red-500 text-sm mt-2">{serverError}</p>
                        )}
                    </form>
                    ): (
                      <div>
                        <h3 className='text-xl font-semibold text-center mb-4'>
                            Enter OTP
                        </h3>
                        <div className="flex justify-center gap-6">
                            {otp?.map((digit,index) => (
                                <input 
                                key={index} 
                                type="text" 
                                ref={(el) =>{
                                    if(el) inputRefs.current[index] = el
                                }}
                                maxLength={1}
                                className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                                value={digit}
                                onChange={(e) => handleOtpChange(index,e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index,e)}
                                />
                            ))}
                        </div>
                        <button className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                        disabled={verifyOtpMutation.isPaused}
                        onClick={()=> verifyOtpMutation.mutate()}
                        >
                            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                        </button>
                        <p className="text-center text-sm mt-4">
                            {canResend ? (
                                <button
                                 onClick={resendOtp}
                                 className='text-blue-500 cursor-pointer'
                                >
                                  Resend OTP
                                </button>
                            ) : (
                              `Resend OTP in ${timer}s`
                            )}
                        </p>
                        {verifyOtpMutation.isError && 
                          verifyOtpMutation.error instanceof AxiosError && (
                            <p className='text-red-500 text-sm mt-2'>
                              {verifyOtpMutation.error.response?.data?.message ||
                               verifyOtpMutation.error.message
                              }
                            </p>
                          )}
                      </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default signup

