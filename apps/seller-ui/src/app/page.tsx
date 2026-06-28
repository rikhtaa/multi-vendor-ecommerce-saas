"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Star, Users, Clock, MapPin, Globe, Calendar } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import useSeller from '../hooks/useSeller';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';

interface UploadImage {
    fileId: string
    file_url: string
}

const TABS = ["Products", "Offers", "Reviews"];

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res.data.products?.filter((i: any) => !i.starting_date) ?? [];
};

const fetchEvents = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res.data.products?.filter((i: any) => i.starting_date) ?? [];
};

const SellerProfile = () => {
  const { seller, isLoading } = useSeller();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("Products");
  const router = useRouter();
  const queryClient = useQueryClient()



  const { data: products = [] } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["shop-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });

  const activeItems = activeTab === "Products" ? products : activeTab === "Offers" ? events : [];


      const convertFileToBase64 = (file: File) => {
          return new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = () => resolve(reader.result)
              reader.onerror = (error) => reject(error)
          })
      }

      const { mutate: updateCoverImage } = useMutation({
      mutationFn: async (imageUrl: string) => {  
        return await axiosInstance.put("/seller/api/update-image", {
            editType: "cover",
            imageUrl,
        })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["seller"] })
    },
    onError: (err) => {
        console.error("Image update failed", err)
    }
})

const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return
    try {
        const fileName = await convertFileToBase64(file)
        
        const response = await axiosInstance.post("/seller/api/upload-image", { fileName })
        const imageUrl = response.data.url
        
        updateCoverImage(imageUrl) 
    } catch (error) {
        console.log(error)
    }
}
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 min-h-screen pb-12">

      {/* Back Button */}
      <div className="w-full px-4 pt-3 pb-1">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Cover Photo */}
      <div className="relative w-full h-[260px] bg-gray-800">
        <Image
          src={seller?.shop?.coverBanner || "https://ik.imagekit.io/fzoxzwtey/cover/1200%20x%20300.svg?updatedAt=1"}
          alt="Cover"
          fill
          className="object-cover"
        />
        {seller?.id && (
        <>
        <label
        htmlFor="imagePicker"
        className="absolute top-3 right-3 bg-gray-800/80 hover:bg-gray-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm border border-gray-600 transition-all cursor-pointer"
        >
          <Pencil size={14} /> Edit Cover
        </label>
        <input
          id="imagePicker"
          type="file"
          className="hidden"
          onChange={(e) =>{
            const file = e.target.files?.[0] 
           handleImageChange(file, 1)
          }}
        />
       </>
      )}
      </div>

      {/* Main Content */}
      <div className="w-[90%] lg:w-[80%] mx-auto mt-[-40px] relative z-10 flex flex-col lg:flex-row gap-4">

        {/* Left: Seller Info Card */}
        <div className="flex-1 bg-gray-800 rounded-lg shadow-lg p-6">

          {/* Avatar + Name Row */}
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* Avatar */}
            <div className="relative w-[90px] h-[90px] rounded-full border-4 border-gray-700 overflow-hidden bg-gray-900 flex-shrink-0">
              <Image
                src={seller?.shop?.avatar_image || "https://ik.imagekit.io/rikhtamenahil/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.avif"}
                alt="Avatar"
                fill
                className="object-cover"
              />
              {seller?.id && (
                <label className="absolute bottom-0 right-0 bg-gray-700 p-1.5 rounded-full cursor-pointer hover:bg-gray-600 transition-colors">
                  <Pencil size={13} className="text-white" />
                </label>
              )}
            </div>

            {/* Name, bio, meta */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-white">{seller?.shop?.name || "Shop Name"}</h1>
                  <p className="text-gray-400 text-sm mt-1">{seller?.shop?.bio || "No bio available."}</p>
                </div>
                {seller?.id ? (
                  <button
                    onClick={() => router.push("/dashboard/edit-profile")}
                    className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm whitespace-nowrap"
                  >
                    <Pencil size={15} /> Edit Profile
                  </button>
                ) : (
                  <button
                    className={`px-5 py-2 rounded-lg font-semibold text-white text-sm transition-all ${isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center text-yellow-400 gap-1 text-sm">
                  <Star fill="#facc15" size={16} />
                  <span>{seller?.shop?.ratings || "N/A"}</span>
                </div>
                <div className="flex items-center text-gray-300 gap-1 text-sm">
                  <Users size={16} />
                  <span>{seller?.followersCount || 0} Followers</span>
                </div>
              </div>

              {/* Hours & Address */}
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock size={15} />
                  <span>{seller?.shop?.opening_hours || "Mon - Sat: 9 AM - 6 PM"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin size={15} />
                  <span>{seller?.shop?.address || "No address provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shop Details Card */}
        <div className="w-full lg:w-[280px] bg-gray-800 rounded-lg shadow-lg p-5 flex-shrink-0 h-fit">
          <h3 className="text-white font-semibold text-base mb-4">Shop Details</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar size={15} className="text-gray-500" />
              <span>
                Joined At:{" "}
                {seller?.shop?.createdAt
                  ? new Date(seller.shop.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "N/A"}
              </span>
            </div>
            {seller?.shop?.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe size={15} className="text-gray-500" />
                <a
                  href={seller.shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline truncate"
                >
                  {seller.shop.website}
                </a>
              </div>
            )}
            {/* Social Links */}
            {seller?.shop?.socialLinks?.length > 0 && (
              <div className="mt-1">
                <p className="text-gray-400 text-sm mb-2">Follow Us:</p>
                <div className="flex items-center gap-3">
                  {seller.shop.socialLinks.map((link: any, i: number) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      <Image src={link.icon} alt={link.name} width={22} height={22} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs + Product Grid */}
      <div className="w-[90%] lg:w-[80%] mx-auto mt-6">
        {/* Tab Bar */}
        <div className="flex items-center border-b border-gray-700 gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {activeItems.length === 0 ? (
            <p className="text-gray-500 text-sm col-span-full py-10 text-center">
              No {activeTab.toLowerCase()} yet.
            </p>
          ) : (
            activeItems.map((item: any) => (
              <Link
                href={`/product/${item.slug}`}
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group"
              >
                <div className="relative w-full h-[180px] bg-gray-700">
                  {item.images?.[0]?.url && (
                    <Image
                      src={item.images[0].url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-green-400 text-sm font-semibold">${item.sale_price}</span>
                    {item.regular_price > item.sale_price && (
                      <span className="text-gray-500 text-xs line-through">${item.regular_price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
