"use client"
import { useQuery } from '@tanstack/react-query'
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder'
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancements'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { ChevronRight, Wand, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ColorSelector from 'packages/components/color-selector'
import CustomProperties from 'packages/components/custom-properties'
import CustomSpecifications from 'packages/components/custom-specifications'
import Input from 'packages/components/input'
import RichTextEditor from 'packages/components/rich-text-editor'
import SizeSelector from 'packages/components/size-selector'
import React, { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

interface UploadImage {
    fileId: string
    file_url: string
}

const Page = () => {
    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm()
    const [openImageModal, setOpenImageModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState("")
    const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false)
    const [isChanged, setIsChanged] = useState(true)
    const [activeEffect, setActiveEffect] = useState<string | null>(null)
    const [images, setImages] = useState<(UploadImage | null)[]>([null])
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const router = useRouter()

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories")
                return res.data
            } catch (error) {
                console.log(error)
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    })

    const { data: discountCodes = [], isLoading: DiscountLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-discount-codes")
            return res?.data?.discount_codes || []

        }
    })

    const categories = data?.categories || []
    const subCategoriesData = data?.subCategories || []

    const selectedCategory = watch("category")
    const regularPrice = watch("regular_price")

    const subcategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : []
    }, [selectedCategory, subCategoriesData])


    const onSubmit = async (data: any) => {
        setLoading(true)
        try {
            await axiosInstance.post("/product/api/create-product", data)
            router.push("/dashboard/all-products")
        } catch (error: any) {
            toast.error(error?.data?.message)
        } finally {
            setLoading(false)
        }
    }

    const convertFileToBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }
    const handleImageChange = async (file: File | null, index: number) => {
        if (!file) return
        setPictureUploadingLoader(true)

        try {
            const fileName = await convertFileToBase64(file)
            const response = await axiosInstance.post(
                "/product/api/upload-product-image",
                { fileName }
            )
            const uploadedImage: UploadImage = {
                fileId: response.data.fileId,
                file_url: response.data.file_url,
            }

            const updatedImages = [...images]

            updatedImages[index] = uploadedImage

            if (index === images.length - 1 && updatedImages.length < 8) {
                updatedImages.push(null)
            }

            setImages(updatedImages)
            setValue("images", updatedImages)
        } catch (error) {
            console.log(error)
        } finally {
            setPictureUploadingLoader(false)
        }
    }

    const handleRemoveImage = async (index: number) => {
        try {
            const updatedImages = [...images]

            const imageToDelete = updatedImages[index]
            if (imageToDelete && typeof imageToDelete === "object") {
                await axiosInstance.delete("/product/api/delete-product-image", {
                    data: {
                        fileId: imageToDelete.fileId!
                    }
                })
            }

            updatedImages.splice(index, 1)

            //Add null placeholder

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null)
            }

            setImages(updatedImages)
            setValue("images", updatedImages)
        } catch (error) {
            console.log(error)

        }
    }

    const applyTransformation = async (transformation: string) => {
        if (!selectedImage || processing) return
        setProcessing(true)
        setActiveEffect(transformation)

        try {
            const transformedUrl = `${selectedImage}?tr=${transformation}`
            setSelectedImage(transformedUrl)
        } catch (error) {
            console.log(error)
        } finally {
            setProcessing(false)
        }
    }

    const handleSaveDraft = () => {

    }
    return (
        <form className='w-full mx-auto p-8 shadow-md rounded-lg text-white'
            onSubmit={handleSubmit(onSubmit)}
        >
            {/* Heading & Breadcrumbs */}
            <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
                Create Product
            </h2>
            <div className="flex items-center">
                <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
                <ChevronRight size={20} className="opacity-[.8]" />
                <span>Create Product</span>
            </div>

            {/* Content Layout */}
            <div className="py-4 w-full flex gap-6">
                {/* Left side - Image upload section */}
                <div className="md:w-[35%]">
                    {images?.length > 0 && (
                        <ImagePlaceHolder
                            setOpenImageModal={setOpenImageModal}
                            size="765 x 850"
                            small={false}
                            images={images}
                            pictureUploadingLoader={pictureUploadingLoader}
                            index={0}
                            onImageChange={handleImageChange}
                            setSelectedImage={setSelectedImage}
                            onRemove={handleRemoveImage}
                        />
                    )}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {images.slice(1).map((_, index) => (
                            <ImagePlaceHolder
                                setOpenImageModal={setOpenImageModal}
                                size="765 x 850"
                                key={index}
                                small
                                images={images}
                                pictureUploadingLoader={pictureUploadingLoader}
                                setSelectedImage={setSelectedImage}
                                index={index + 1}
                                onImageChange={handleImageChange}
                                onRemove={handleRemoveImage}
                            />
                        ))}
                    </div>
                </div>

                {/* Right side - form inputs */}
                <div className="md:w-[65%]">
                    <div className="w-full flex gap-6">
                        {/* Product Title Input */}
                        <div className="w-2/4">
                            <Input
                                label='Product Title'
                                placeholder='Enter product title'
                                {...register("title", { required: "Title is required" })}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">
                                    {String(errors.title.message as string)}
                                </p>
                            )}

                            <div className="mt-2">
                                <Input
                                    type="textarea"
                                    rows={7}
                                    cols={10}
                                    label='Short Description * (Max 150 words)'
                                    placeholder='Enter product description for quick view'
                                    {...register("short_description", {
                                        required: "Description is required",
                                        validate: (value) => {
                                            const wordCount = value.trim().split(/\s+/).length
                                            return (
                                                wordCount <= 150 ||
                                                `Description cannot exceed 150 words (Current: ${wordCount})`
                                            )
                                        }
                                    })}
                                />
                                {errors.short_description && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {String(errors.short_description.message as string)}
                                    </p>
                                )}

                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Tags *'
                                    placeholder='apple, flagship'
                                    {...register("tags", { required: "Seperate related products tags with a coma," })}
                                />
                                {errors.tags && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {String(errors.tags.message as string)}
                                    </p>
                                )}

                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Warranty *'
                                    placeholder='1 Year / No Warranty'
                                    {...register("warranty", { required: "Warranty is required!," })}
                                />
                                {errors.warranty && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {String(errors.warranty.message as string)}
                                    </p>
                                )}

                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Slug *'
                                    placeholder='product_slug'
                                    {...register("slug", {
                                        required: "Slug is required",
                                        pattern: {
                                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                            message:
                                                "Invalid slug format! Use only lowercase letters, numbers, and hyphens (e.g. my-product-name)."
                                        },
                                        minLength: {
                                            value: 3,
                                            message: "Slug must be at least 3 characters long.",
                                        },
                                        maxLength: {
                                            value: 50,
                                            message: "Slug cannot be longer than 50 characters.",
                                        },
                                    })}
                                />
                                {errors.slug && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {String(errors.slug.message as string)}
                                    </p>
                                )}

                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Brand'
                                    placeholder='Apple'
                                    {...register("brand")}
                                />
                                {errors.brand && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {String(errors.brand.message as string)}
                                    </p>
                                )}
                            </div>

                            <div className="mt-2">
                                <ColorSelector
                                    control={control}
                                    errors={errors}
                                />
                            </div>

                            <div className="mt-2">
                                <CustomSpecifications
                                    control={control}
                                    errors={errors}
                                />
                            </div>

                            <div className="mt-2">
                                <CustomProperties
                                    control={control}
                                    errors={errors}
                                />
                            </div>

                            <div className="mt-2">
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Cash On Delivery *
                                </label>
                                <select
                                    className='w-full p-2 border border-gray-800 outline-0 rounded-[4px] bg-gray-800'
                                    {...register("cash_on_delivery", {
                                        required: "Cash on Delivery is required",
                                    })}
                                >
                                    <option value="yes" className='bg-black'>
                                        Yes
                                    </option>
                                    <option value="no" className='bg-black'>
                                        No
                                    </option>
                                </select>
                                {errors.cash_on_delivery && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {(errors.cash_on_delivery.message as string)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="w-2/4">
                            <label className='block font-semibold text-gray-300 mb-1'>
                                Category *
                            </label>
                            {isLoading ? (
                                <p className="text-gray-400">Loading categories...</p>
                            ) : isError ? (
                                <p className="text-gray-400">Failed to load categories...</p>
                            ) : (
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: "Category is required" }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className='w-full border outline-none border-gray-700 bg-transparent '
                                        >
                                            <option value="" className="bg-black">
                                                Select Category
                                            </option>
                                            {categories?.map((category: string) => (
                                                <option value={category} key={category} className="bg-black">
                                                    {category}
                                                </option>

                                            ))}
                                        </select>
                                    )}
                                />
                            )}
                            {errors.category && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.category.message as string}
                                </p>
                            )}

                            <div className="mt-2">
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Subcategory *
                                </label>
                                {isLoading ? (
                                    <p className="text-gray-400">Loading Subcategories...</p>
                                ) : isError ? (
                                    <p className="text-gray-400">Failed to load Subcategories...</p>
                                ) : (
                                    <Controller
                                        name="Subcategory"
                                        control={control}
                                        rules={{ required: "Subcategory is required" }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className='w-full border outline-none border-gray-700 bg-transparent '
                                            >
                                                <option value="" className="bg-black">
                                                    Select Subcategory
                                                </option>
                                                {subcategories?.map((subcategory: string) => (
                                                    <option value={subcategory} key={subcategory} className="bg-black">
                                                        {subcategory}
                                                    </option>

                                                ))}
                                            </select>
                                        )}
                                    />
                                )}
                                {errors.Subcategory && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.Subcategory.message as string}
                                    </p>
                                )}


                            </div>

                            <div className="mt-2">
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Detailed Description * (Min 100 words)
                                </label>
                                <Controller
                                    name="detailed_description"
                                    control={control}
                                    rules={{
                                        required: "Detailed description is required",
                                        validate: (value) => {
                                            const text = value?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")
                                            const wordCount = text?.trim().split(/\s+/).filter((word: string) => word).length
                                            return (
                                                wordCount >= 100 ||
                                                "Description must be at least 100 words!"
                                            )
                                        }
                                    }}

                                    render={({ field }) => (
                                        <RichTextEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.detailed_description && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.detailed_description.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Video URL'
                                    placeholder="https://www.youtube.com/embed/xyz123"
                                    {...register("video_url", {
                                        validate: (value) => {
                                            if (!value) return true  // ← skip if empty
                                            return /^https:\/\/www\.youtube\.com\/embed\/[\w-]+$/.test(value) ||
                                                "Invalid youtube embed URL! Use format: https://www.youtube.com/embed/xyz123"
                                        }
                                    })}
                                />
                                {errors.video_url && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.video_url.message as string}
                                    </p>
                                )}


                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Regular Price'
                                    placeholder="20$"
                                    {...register("regular_price", {
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Price must be at least 1" },
                                        validate: (value) =>
                                            !isNaN(value) || "Only numbers are allowed",
                                    })}
                                />
                                {errors.regular_price && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.regular_price.message as string}
                                    </p>
                                )}


                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Sale Price'
                                    placeholder="15$"
                                    {...register("sale_price", {
                                        required: "Sale Price is required",
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Sale Price must be at least 1" },
                                        validate: (value) => {
                                            if (isNaN(value)) return "Only numbers are allowed"
                                            if (regularPrice && value >= regularPrice) {
                                                return "Sale Price must be less than Regualr Price"
                                            }
                                            return true
                                        }
                                    })}
                                />
                                {errors.sale_price && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.sale_price.message as string}
                                    </p>
                                )}


                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Stock *'
                                    placeholder="100"
                                    {...register("stock", {
                                        required: "Stock is required",
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Stock must be at least 1" },
                                        max: {
                                            value: 1000,
                                            message: "Stock cannot exceed 1,000"
                                        },
                                        validate: (value) => {
                                            if (isNaN(value)) return "Only numbers are allowed"
                                            if (!Number.isInteger(value)) {
                                                return "Stock must be a whole number!"
                                            }
                                            return true
                                        }
                                    })}
                                />
                                {errors.stock && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.stock.message as string}
                                    </p>
                                )}


                            </div>

                            <div className="mt-2">
                                <SizeSelector control={control} errors={errors} />
                            </div>

                            <div className="mt-3">
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Select Discount Codes (optional)
                                </label>
                                {DiscountLoading ? (
                                    <p className="text-gray-400">
                                        Loading discount codes...
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {discountCodes?.map((code: any) => (
                                            <button
                                                key={code.id}
                                                type="button"
                                                className={`px-3 py-1 rounded-md text-sm font-semibold border 
                                            ${watch("discountCodes")?.includes(code.id) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                                                    }`}
                                                onClick={() => {
                                                    const currentSelection = watch("discountCodes") || []
                                                    const updatedSelection = currentSelection?.includes(
                                                        code.id
                                                    ) ? currentSelection.filter(
                                                        (id: string) => id !== code.id
                                                    )
                                                        : [...currentSelection, code.id]
                                                    setValue("discountCodes", updatedSelection)
                                                }}
                                            >
                                                {code?.public_name} ({code.discountValue}
                                                {code.discountType === "percentage" ? "%" : "$"}
                                                )
                                            </button>
                                        ))

                                        }
                                    </div>
                                )

                                }
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {openImageModal && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
                        <div className="flex justify-between items-center pb-3 mb-4">
                            <h2 className="text-lg font-semibold">Enhance Product Image</h2>
                            <X
                                size={20}
                                className='cursor-pointer'
                                onClick={() => setOpenImageModal(!openImageModal)}
                            />
                        </div>

                        {selectedImage && (
                            <div className="relative w-full h-[300px]">
                                <Image
                                    src={selectedImage}
                                    alt="product-image"
                                    fill
                                    style={{ objectFit: "contain" }}
                                />
                            </div>
                        )}
                        {selectedImage && (
                            <div className="mt-4 space-y-2">
                                <h3 className="text-white text-sm font-semibold">
                                    AI Enhancements
                                </h3>
                                <div className="grid grid-cols-2 mx-h-[250px] overflow-y-auto">
                                    {enhancements?.map(({ label, effect }) => (
                                        <button
                                            type="button"
                                            key={effect}
                                            className={`p-2 rounded-md flex items-center gap-2 ${activeEffect === effect
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-700 hover:bg-gray-600"
                                                }`}
                                            onClick={() => applyTransformation(effect)}
                                            disabled={processing}
                                        >
                                            <Wand size={18} />
                                            {label}
                                        </button>
                                    ))

                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                {isChanged && (
                    <button
                        type='button'
                        onClick={handleSaveDraft}
                        className='px-4 py-2 bg-gray-700 text-white rounded-md'
                    >
                        Save Draft
                    </button>
                )}
                <button
                    type='submit'
                    disabled={loading}
                    className='px-4 py-2 bg-blue-700 text-white rounded-md'
                >
                    {loading ? "Creating" : "Create"}
                </button>
            </div>
        </form>
    )
}

export default Page



