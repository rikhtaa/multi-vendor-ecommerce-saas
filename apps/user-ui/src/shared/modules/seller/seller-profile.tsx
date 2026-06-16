"use client"

import { shops } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendKafkaEvent } from "apps/user-ui/src/actions/track-user";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Star, Users, Clock, MapPin, Globe, Calendar, Heart} from "lucide-react";
import ProductCard from "../../components/cards/product-card";

const TABS = ["Products", "Offers", "Reviews"];

const SellerProfile = ({
  shop,
  followersCount,
}: {
  shop: shops;
  followersCount: number;
}) => {
  const [activeTab, setActiveTab] = useState("Products");
  const [followers, setFollowers] = useState(followersCount);
  const [isFollowing, setIsFollowing] = useState(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-seller-products/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shop?.id) return;
      try {
        const res = await axiosInstance.get(
          `/seller/api/is-following/${shop?.id}`
        );
        setIsFollowing(res.data.isFollowing !== null);
      } catch (error) {
        console.error("Failed to fetch follow status", error);
      }
    };

    fetchFollowStatus();
  }, [shop?.id]);

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["seller-events"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-seller-events/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await axiosInstance.post("/seller/api/unfollow-shop", {
          shopId: shop?.id,
        });
      } else {
        await axiosInstance.post("/seller/api/follow-shop", {
          shopId: shop?.id,
        });
      }
    },
    onSuccess: () => {
      if (isFollowing) {
        setFollowers(followers - 1);
      } else {
        setFollowers(followers + 1);
      }
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey: ["is-following", shop?.id],
      });
    },
    onError: () => {
      console.error("Failed to follow/unfollow the shop.");
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (!location || !deviceInfo || !user?.id) return;
      sendKafkaEvent({
        userId: user?.id,
        shopId: shop?.id,
        action: "shop_visit",
        country: location?.country || "Unknown",
        city: location?.city || "Unknown",
        device: deviceInfo || "Unknown Device",
      });
    }
  }, [location, deviceInfo, isLoading]);

  // build small gallery thumbnails from first products (fallback)
  const galleryImages: string[] =
    products?.slice(0, 3).map((p: any) => p?.images?.[0]?.url).filter(Boolean) || [];



  return (
    <div className="w-full bg-gray-100 min-h-screen">
      {/* Dark Cover/Hero Section */}
      <div className="relative w-full bg-black pb-32">
        <div className="max-w-6xl mx-auto px-8 lg:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cover Image + Gallery */}
            <div className="lg:col-span-2">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={
                    shop?.coverBanner ||
                    "https://ik.imagekit.io/fzoxzwtey/cover/1200%20x%20300.svg?updatedAt=17420"
                  }
                  alt="Shop cover"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {(galleryImages.length ? galleryImages : ["/placeholder.png", "/placeholder.png", "/placeholder.png"]).map(
                  (img: string, idx: number) => (
                    <div key={idx} className="relative w-full h-24 rounded-lg overflow-hidden">
                      <Image src={img} alt={`gallery-${idx}`} fill style={{ objectFit: "cover" }} />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Bio + Tags + Buy Now */}
            <div className="text-gray-300 flex flex-col h-full pt-2">
              <p className="text-sm leading-relaxed">
                {shop?.bio ||
                  "In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relyingIn publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relyins"}
              </p>

              <div className="mt-6">
                <h3 className="text-white text-xl font-semibold mb-3">Tags</h3>
                <div className="flex gap-2 flex-wrap">
                  {(shop?.category ? [shop.category, "Photo", "Arts"] : ["AI", "Photo", "Arts"]).map(
                    (tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-gray-800 text-gray-200 text-sm px-4 py-1.5 rounded-md"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              {products?.[0]?.sale_price && (
                <button className="mt-6 bg-green-500 hover:bg-green-600 text-black font-semibold px-5 py-2.5 rounded-md w-fit">
                  Buy now ${products[0].sale_price}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shop Info Cards - overlapping hero */}
      <div className="max-w-6xl mx-auto px-8 lg:px-10 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Shop Card */}
          <div className="lg:col-span-2 bg-gray-100 rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border flex-shrink-0">
                <Image
                  src={
                    shop?.avatar ||
                    "https://ik.imagekit.io/fzoxzwtey/avatar/amazon.jpeg"
                  }
                  alt="Shop avatar"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {shop?.name || "Shop Name"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {shop?.bio || "You will get anything related to programming."}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-blue-500" />
                    {shop?.ratings ?? "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {followers} Followers
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                  <Clock size={14} />
                  {shop?.opening_hours || "Mon - Fri 9 am to 10pm"}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin size={14} />
                  {shop?.address || "Address not provided"}
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleFollowMutation.mutate()}
              disabled={toggleFollowMutation.isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition self-start ${isFollowing
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              <Heart size={16} fill={isFollowing ? "currentColor" : "none"} />
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>

          {/* Shop Details */}
          <div className="bg-gray-100 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Shop Details</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                Joined At:{" "}
                {shop?.createdAt
                  ? new Date(shop.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
              {shop?.website && (
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {shop.website}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                Follow Us:
              </h4>
              <div className="flex gap-3">
                <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold hover:opacity-80">
                  YT
                </a>
                <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm font-bold hover:opacity-80">
                  X
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-300">
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-base font-semibold transition ${activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "Products" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {isLoading && (
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[250px] bg-gray-200 animate-pulse rounded-md"
                    />
                  ))}
                </>
              )}
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products?.length === 0 && (
                <p className="text-sm text-gray-500 col-span-full">
                  No products available yet!
                </p>
              )}
            </div>
          )}

          {activeTab === "Offers" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {isEventsLoading && (
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[250px] bg-gray-200 animate-pulse rounded-md"
                    />
                  ))}
                </>
              )}
              {events?.map((product: any) => (
                <ProductCard isEvent={true} key={product.id} product={product} />
              ))}
              {events?.length === 0 && (
                <p className="text-sm text-gray-500 col-span-full">
                  No offers available yet!
                </p>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <p className="text-sm text-gray-500 text-center py-5">
              No Reviews available yet!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;