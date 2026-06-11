"use client"

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Input from 'packages/components/input'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import axios, { AxiosError } from "axios"

type FormData = {
  email: string
  password: string
}

const Page = () => {
  const { register, handleSubmit } = useForm<FormData>()
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-admin`,
        data,
        { withCredentials: true}
      )
      return response.data
    },
    onSuccess: (data) =>{
      setServerError(null)
      router.push("/dashboard")
    },
    onError: (error: AxiosError) => {
      const errorMessage =
       (error.message?.data as {message?: string})
       "Invalid credentials!"
       setServerError(errorMessage) 
    }
  })

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data)
  }

  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <div className="md:w-[450px] pb-8 bg-slate-800 rounded-md shadow">
        <form className='p-5' onSubmit={handleSubmit(onSubmit)}>
          <h1 className='text-3xl pb-3 pt-4 font-semibold text-center text-white font-[poppins]'>
            Admin
          </h1>
          <Input
            label="Email"
            placeholder="rekhtamenahil@ray.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address"
              }
            })}
          />
          <div className="mt-3">
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
          />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {loginMutation.isPending ? (
              <div className='h-6 w-6 border-gray-100 border-t-transparent rounded-full animate-spin'></div>
            ) : (
              <>Login</>
            )}
          </button>

           {serverError && (
            <p className='text-red-500 text-xs mt-2'>{serverError}</p>
          )}

        </form>
      </div>
    </div>
  )
}

export default Page