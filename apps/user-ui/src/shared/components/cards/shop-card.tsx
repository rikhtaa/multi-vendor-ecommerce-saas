import { MapPin, Star } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface ShopCardProps {
  shop: {
    id: string
    name: string
    description?: string
    avatar: string
    coverBanner?: string
    address?: string
    followers?: string
    rating?: number
    category?: string
  }
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className='w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition'>
      {/* Cover */}
      <div className="h-[120px] w-full relative">
        <Image
          src={
            shop?.coverBanner ||
            "https://images.unsplash.com/photo-1590845947670-c009801ffa74?q=80&w=1159&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt="Cover"
          fill
          className="object-cover w-full h-full"
        />
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-8">
        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
          <Image
            src={
              shop?.avatar ||
              "https://plus.unsplash.com/premium_vector-1719858611039-66c134efa74d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt={shop.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800">{shop?.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} Followers
        </p>

        {/* Address + Rating */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}

          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {shop.rating ?? "N/A"}
          </span>
        </div>


        {/* Category */}
        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {shop.category}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopCard