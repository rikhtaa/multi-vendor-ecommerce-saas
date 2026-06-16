"use client"
import { AlignLeft, ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { NavItemsTypes } from '../../configs/global'
import { navItems } from '../../configs/constants'
import Link from 'next/link'

const HeaderBottom = () => {
    const [show, setShow] = useState(false)
    const [isSticky, setIsSticky] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
            <div className="max-w-[1200px] mx-auto px-4 relative flex items-center justify-between py-3">
                {/* All Departments + dropdown wrapper */}
                <div className="relative">
                    <div className="w-[260px] cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]"
                        onClick={() => setShow(!show)}
                    >
                        <div className="flex items-center gap-2">
                            <AlignLeft color="white" />
                            <span className='text-white font-medium'>All Departments</span>
                        </div>
                        <ChevronDown color='white' />
                    </div>

                    {show && (
                        <div className="absolute left-0 top-[50px] w-[260px] h-[400px] bg-[#f5f5f5] shadow-lg z-[101]">
                        </div>
                    )}
                </div>

                {/* Nav links - centered */}
                <div className="flex-1 flex items-center justify-center">
                    {navItems.map((i: NavItemsTypes, index: number) => (
                        <Link
                            className="px-5 font-medium text-lg h-[50px] flex items-center"
                            href={i.href}
                            key={index}
                        >
                            {i.title}
                        </Link>
                    ))}
                </div>

                {/* Spacer */}
                <div className="w-[260px]" />
            </div>
        </div>
    )
}

export default HeaderBottom