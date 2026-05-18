import { useMutation } from '@tanstack/react-query'
import { shopCategories } from 'apps/seller-ui/src/app/utils/categories'
import StripeLogo from 'apps/seller-ui/src/assets/svgs/stripe-logo'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'

const CreateShop = ({
    sellerId,
    setActiveStep,
}: {
    sellerId: string
    setActiveStep: (step: number) => void
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
                data
            )
            return response.data
        },
        onSuccess: (_, formData) => {
            setActiveStep(3)
        }
    })

    const onSubmit = async (data: any) => {
        const shopData = { ...data, sellerId }
        shopCreateMutation.mutate(shopData)
    }

    const countWords = (text: string) => text.trim().split(/\s+/).length

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className='text-2xl font-semibold text-center mb-4'>Setup new shop</h3>
                <label className='block text-gray-700 mb-1'>Name *</label>
                <input
                    type="text"
                    placeholder="shop name"
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

                <label className='block text-gray-700 mb-1'>Bio (Max 100 words) *</label>
                <textarea
                    cols={10}
                    rows={4}
                    placeholder='shop bio'
                    className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                    {...register("bio", {
                        required: "Bio is required",
                        validate: (value) =>
                            countWords(value) <= 100 || "Bio can't exceed 100 words"
                    })}
                />
                {errors.bio && (
                    <p className="text-red-500 text-sm">
                        {String(errors.bio.message)}
                    </p>
                )}

                <label className='block text-gray-700 mb-1'>Address *</label>
                <input
                    type="text"
                    placeholder="shop location"
                    className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                    {...register("address", {
                        required: "Shop Address is required"
                    })}
                />
                {errors.address && (
                    <p className="text-red-500 text-sm">
                        {String(errors.address.message)}
                    </p>
                )}

                <label className='block text-gray-700 mb-1'>Opening Hours *</label>
                <input
                    type="text"
                    placeholder="e.g., Mon-Fri 9AM - 6PM"
                    className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                    {...register("opening_hours", {
                        required: "Opening hours is required"
                    })}
                />
                {errors.opening_hours && (
                    <p className="text-red-500 text-sm">
                        {String(errors.opening_hours.message)}
                    </p>
                )}

                <label className='block text-gray-700 mb-1'>Website *</label>
                <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                    {...register("website", {
                        pattern: {
                            value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
                            message: "Enter a valid URL",
                        },
                    })}
                />
                {errors.website && (
                    <p className="text-red-500 text-sm">
                        {String(errors.website.message)}
                    </p>
                )}

                <label htmlFor="block text-gray-700 mb-1">Category *</label>
                <select
                    className='w-full p-2 border border-gray-300 outline-0 rounded-[4px]'
                    {...register("category", { required: "Category is required" })}
                >
                    <option value="">Select your category</option>
                    {shopCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>

                {errors.category && (
                    <p className="text-red-500 text-sm">
                        {String(errors.category.message)}
                    </p>
                )}

                <button
                    type='submit'
                    // disabled={signupMutation.isPending}
                    className='w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg'
                >
                    {/* {signupMutation.isPending ? "Signing up..." : "Signup"} */}
                    Create 
                    <StripeLogo/>
                </button>

            </form>
        </div>
    )
}

export default CreateShop