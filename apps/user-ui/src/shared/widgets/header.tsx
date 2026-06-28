"use client"
import Link from "next/link";
import React from "react";
import { HeartIcon, Search, UserRound, ShoppingCart, MapPin } from "lucide-react"
import HeaderBottom from "../../assets/svgs/header-bottom";
import useUser from "../../hooks/useUser";
import { useStore } from "../store";
import useLayout from "../../hooks/useLayout";
import Image from "next/image";

const Header = () => {
  const { user, isLoading } = useUser()
  const wishlist = useStore((state: any) => state.wishlist)
  const cart = useStore((state: any) => state.cart)
  const { layout } = useLayout()
  
  return (
    <div className="w-full bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-5 flex items-center justify-between">

        {/* Logo */}
        <div>
          <Link href={"/"}>
           <Image
              src={
                layout?.logo ||
                "https://ik.imagekit.io/rikhtamenahil/logo.png?updatedAt=1781511542896"
              }
              width={200}
              height={100}
              alt=""
              className="h-[70px] ml-[50px] mb-[-30px] object-cover"
            />
          </Link>
        </div>

        {/* Search */}
        <div className="w-[50%] relative">
          <input type="text" placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Link href={"/profile"}
                  className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                >
                  <UserRound />
                </Link>
                <Link href={"/profile"}>
                  <span className="block font-medium">Hello</span>
                  <span className="font-semibold">{user?.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href={"/login"}
                  className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                >
                  <UserRound />
                </Link>
                <Link href={"/login"}>
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">{isLoading ? "..." : "Sign In"}</span>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Link href={"/wishlist"} className="relative">
              <HeartIcon />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">
                  {wishlist?.length}
                </span>
              </div>
            </Link>
            <Link href={"/cart"} className="relative">
              <ShoppingCart />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">
                  {cart?.length}
                </span>
              </div>
            </Link>
          </div>
        </div>

      </div>
      <div className="border-b border-b-[#99999938]" />
      <HeaderBottom />
    </div>
  );
};

export default Header;