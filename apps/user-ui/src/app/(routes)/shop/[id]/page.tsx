import SellerProfile from 'apps/user-ui/src/shared/modules/seller/seller-profile'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { Metadata } from 'next'
import React from 'react'

async function fetchSellerDetails(id: string) {
    const response = await axiosInstance.get(`/seller/api/get-seller/${id}`)
    return response.data
}

// Dynamic metadata generator
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    const data = await fetchSellerDetails(id)

    return {
        title: `${data?.shop?.name} | Eshop Marketplace`,
        description: data?.shop?.bio ||
            "Explore products and services from trusted sellers on Eshop.",
        openGraph: {
            title: `${data?.shop?.name} | Eshop Marketplace`,
            description:
                data?.shop?.bio ||
                "Explore products and services from trusted sellers on Eshop.",
            type: "website",
            images: [
                {
                    url: data?.shop?.avatar || "/default-shop.png",
                    width: 800,
                    height: 600,
                    alt: data?.shop?.name || "Shop Logo",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${data?.shop?.name} | Eshop Marketplace`,
            description:
                data?.shop?.bio ||
                "Explore products and services from trusted sellers on Eshop.",
            images: [data?.shop?.avatar || "/default-shop.png"],
        }
    }
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const data = await fetchSellerDetails(id)
    return <div>
        <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
}

export default Page