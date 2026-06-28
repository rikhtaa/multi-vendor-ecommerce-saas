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
                    url: data?.shop?.avatar || "https://plus.unsplash.com/premium_vector-1682269284255-8209b981c625?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
            images: [data?.shop?.avatar || "https://plus.unsplash.com/premium_vector-1682269284255-8209b981c625?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
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