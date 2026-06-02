import ProductDetails from 'apps/user-ui/src/shared/modules/product/product-details'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { Metadata } from 'next'
import React from 'react'

async function fetchProductDetails(slug: string) {
    const response = await axiosInstance.get(`/product/api/get-product/${slug}`)
    return response.data.product
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const product = await fetchProductDetails(slug)

    return {
        title: `${product?.title} | Becodemy Marketplace`,
        description:
            product?.short_description ||
            "Discover high-quality products on Becodemy Marketplace",
        openGraph: {
            title: product?.title,
            description: product?.short_description || "",
            images: [product?.images?.[0]?.url || "/default-image.jpg"],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: product?.title,
            description: product?.short_description || "",
            images: [product?.images?.[0]?.url || "/default-image.jpg"],
        }
    }
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params
    const productDetails = await fetchProductDetails(slug)
    console.log(productDetails)
    return <ProductDetails productDetails={productDetails}/>
}

export default Page