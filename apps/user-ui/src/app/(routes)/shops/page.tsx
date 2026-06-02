"use client"
import { categories } from "apps/user-ui/src/configs/categories";
import { countries } from "apps/user-ui/src/configs/countires";
import ShopCard from "apps/user-ui/src/shared/components/cards/shop-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
    const router = useRouter()
    const [isShopLoading, setIsShopLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [shops, setShops] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const updateURL = () => {
        const params = new URLSearchParams()
        if (selectedCategories.length > 0)
            params.set("categories", selectedCategories.join(","))
        if (selectedCountries.length > 0)
            params.set("countries", selectedCountries.join(","))
        params.set("page", page.toString())
        router.replace(`/shops?${decodeURIComponent(params.toString())}`)
    }

    const fetchFilteredShops = async () => {
        setIsShopLoading(true)
        try {
            const query = new URLSearchParams()
            if (selectedCategories.length > 0)
                query.set("categories", selectedCategories.join(","))
            if (selectedCountries.length > 0)
                query.set("countries", selectedCountries.join(","))
            query.set("page", page.toString())
            query.set("limit", "12")

            const res = await axiosInstance.get(`/product/api/get-filtered-shops?${query.toString()}`)
            setShops(res.data.shops)
            setTotalPages(res.data.pagination.totalPages)

        } catch (error) {
            console.error("Error fetching filtered shops:", error)
        } finally {
            setIsShopLoading(false)
        }
    }

    useEffect(() => {
        updateURL()
        fetchFilteredShops()
    }, [selectedCategories, page])

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        )
    }

    const toggleCountry = (country: string) => {
        setSelectedCountries((prev) =>
            prev.includes(country)
                ? prev.filter((c) => c !== country)
                : [...prev, country]
        )
    }

    return (
        <div className="w-full bg-[#f5f5f5] pb-10">
            <div className="w-[90%] lg:w-[80%] m-auto">
                <div className="pb-[50px]">
                    <h1 className="md:pt-[40px] font-medium text-[44px] leading-1 mb-[14px] font-jost">
                        All Shops
                    </h1>
                    <Link href="/" className="text-[#55585b] hover:underline">
                        Home
                    </Link>
                    <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
                    <span className="text-[#55585b]">All Shops</span>
                </div>

                <div className="w-full flex flex-col lg:flex-row gap-8">
                    {/* sidebar */}
                    <aside className="w-full lg:w-[270px] !rounded bg-white p-4 space-y-6">
                        <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">Categories</h3>
                        <ul className="space-y-3 !mt-3">
                            {categories?.map((category: { value: string; label: string }) => (
                                <li key={category.value} className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.value)}
                                            onChange={() => toggleCategory(category.value)}
                                            className="accent-blue-600"
                                        />
                                        {category.label}
                                    </label>
                                </li>
                            ))}
                        </ul>

                        {/* Countries */}
                        <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">Countries</h3>
                        <ul className="space-y-3 !mt-3">
                            {countries?.map((country: { code: string; name: string }) => (
                                <li key={country.code} className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={selectedCountries.includes(country.name)}
                                            onChange={() => toggleCountry(country.name)}
                                            className="accent-blue-600"
                                        />
                                        {country.name}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Shop grid */}
                    <div className="flex-1 px-2 lg:px-3">
                        {isShopLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                                    />
                                ))}
                            </div>
                        ) : shops.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {shops.map((shop) => (
                                    <ShopCard key={shop.id} shop={shop} />
                                ))}
                            </div>
                        ) : (
                            <p>No Shops found!</p>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`px-3 py-1 !rounded border border-gray-200 text-sm ${page === i + 1
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-black"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page