"use client"
import { useQuery } from '@tanstack/react-query'
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking'
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking'
import useUser from 'apps/user-ui/src/hooks/useUser'
import { useStore } from 'apps/user-ui/src/shared/store'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const CartPage = () => {
    const router = useRouter()
    const { user } = useUser()
    const location = useLocationTracking()
    const deviceInfo = useDeviceTracking()
    const removeFromCart = useStore((state: any) => state.removeFromCart)
    const [loading, setLoading] = useState(false)
    const [discountedProductId, setDiscountedProductId] = useState("")
    const [discountPercent, setDiscountPercent] = useState(0)
    const cart = useStore((state: any) => state.cart)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [couponCode, setCouponCode] = useState("")
    const [selectedAddressId, setSelectedAddressId] = useState("")

    const decreasedQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state?.cart?.map((item: any) => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
            )
        }))
    }

    const increaseQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state?.cart?.map((item: any) => item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item)
        }))
    }

    const removeItem = (id: string) => {
        removeFromCart(id, user, location, deviceInfo)
    }

    const subtotal = cart.reduce(
        (total: number, item: any) => total + item.quantity * item.sale_price,
        0
    )

    // Get addresses
    const { data: addresses = [], isLoading } = useQuery({
        queryKey: ["shipping-addresses"],
        queryFn: async () => {
            const res = await axiosInstance.get("/api/shipping-addresses");
            return res.data.addresses;
        },
    });

    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find((addr) => addr.isDefault)
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id)
            }
        }
    }, [addresses, selectedAddressId])

    return (
        <div className='w-full bg-white'>
            <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
                <div className="pb-[50px]">
                    <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
                        Shopping Cart
                    </h1>
                    <Link href={"/"} className="text-[#55585b] hover:underline">
                        Home
                    </Link>
                    <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
                    <span className="text-[#55585b]">Cart</span>
                </div>
                {cart.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg">

                    </div>
                ) : (
                    <div className="lg:flex items-start gap-10">
                        <table className='w-full lg:w-[70%] border-collapse'>
                            <thead className='bg-[#f1f3f4] rounded'>
                                <tr>
                                    <th className="py-3 text-left pl-6 align-middle">Product</th>
                                    <th className="py-3 text-center align-middle">Price</th>
                                    <th className="py-3 text-center align-middle">Quantity</th>
                                    <th className="py-3 text-center align-middle"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart?.map((item: any) => (
                                    <tr
                                        className="border-b border-b-[#000000e]"
                                        key={item.id}
                                    >
                                        <td className="flex items-center gap-4 p-4">
                                            <Image
                                                src={item?.images[0]?.url}
                                                alt={item.title}
                                                width={80}
                                                height={80}
                                                className='rounded'
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.title}</span>
                                                {item?.selectedOptions && (
                                                    <div className="text-sm text-gray-500">
                                                        {item?.selectedOptions?.color && (
                                                            <span>
                                                                Color:{ }
                                                                <span
                                                                    style={{
                                                                        backgroundColor:
                                                                            item?.selectedOptions?.color,
                                                                        width: "12px",
                                                                        height: "12px",
                                                                        borderRadius: "100%",
                                                                        display: "inline-block"
                                                                    }}
                                                                />
                                                            </span>
                                                        )}
                                                        {item?.selectedOptions.size && (
                                                            <span className="ml-2">
                                                                Size: {item?.selectedOptions?.size}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className='px-6 text-lg text-center'>
                                            {item?.id === discountedProductId ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="line-through text-gray-500 text-sm">
                                                        ${item.sale_price.toFixed(2)}
                                                    </span>{" "}
                                                    <span className='text-green-600 font-semibold'>
                                                        ${(
                                                            (item.sale_price * (100 - discountPercent)) /
                                                            100
                                                        ).toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-green-700 bg-white">
                                                        Discount Applied
                                                    </span>
                                                </div>
                                            ) : (
                                                <span>${item.sale_price.toFixed(2)}</span>
                                            )}
                                        </td>

                                        <td>
                                            <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
                                                <button className='text-black cursor-pointer text-xl'
                                                    onClick={() => decreasedQuantity(item.id)}
                                                >
                                                    -
                                                </button>
                                                <span className="px-4">{item?.quantity}</span>
                                                <button className='text-black cursor-pointer text-xl'
                                                    onClick={() => increaseQuantity(item?.id)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>

                                        <td className='text-center'>
                                            <button className="text-[#818487] cursor-pointer hover:text-[#ff1826] transition duration-200"
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                            >
                                                x Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))

                                }
                            </tbody>
                        </table>

                        <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9ff9] rounded-lg">
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-[#010f1c] text-base font-medium pb-1">
                                    <span className='font-jost'>
                                        Discount ({discountPercent}%)
                                    </span>
                                    <span className="text-green-600">
                                        - ${discountAmount.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3">
                                <span className="font-jost">Subtotal</span>
                                <span>${(subtotal - discountAmount).toFixed(2)}</span>
                            </div>
                            <hr className='my-4 text-slate-200' />

                            <div className="mb-4">
                                <h4 className='mb-[7px] font-[500] text-[15px]'>
                                    have a Coupon?
                                </h4>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e: any) => setCouponCode(e.target.value)}
                                        placeholder='Enter coupon code'
                                        className='w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500'
                                    />
                                    <button className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition">
                                        Apply
                                    </button>
                                    {/* {error && (
                                        <p className="text-sm pt-2 text-red-500">{error}</p>
                                    )} */}
                                </div>
                                <hr className='my-4 text-slate-200' />
                                <div className="mb-4">
                                    <h4 className='mb-[7px] font-medium text-[15px]'>
                                        Select Shipping Address
                                    </h4>
                                    {addresses?.length !== 0 && (
                                        <select className='w-full p-2 border border-gray-200 rounded-md focus:outline'
                                            value={selectedAddressId}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                        >
                                            {addresses?.map((address: any) => (
                                                <option key={address.id} value={address.id}>
                                                    {address.label} - {address.city}, {address.country}
                                                </option>
                                            ))}
                                            {addresses?.length === 0 && (
                                              <p className='text-sm text-slate-800'>
                                                Please add an address from profile to create an order!
                                              </p>
                                            )}
                                        </select>
                                    )}

                                </div>
                                <hr className='my-4 text-slate-200' />

                                <div className="mb-4">
                                    <h4 className="mb-[7px] font-[500] text-[15px]">
                                        Select Payment Method
                                    </h4>
                                    <select
                                        className='w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500'
                                        value={selectedAddressId}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                    >
                                        <option value="credit_card">
                                            Online Payment
                                        </option>
                                        <option value="cash_on_delivery">
                                            Cash on Delivery
                                        </option>
                                    </select>
                                </div>
                                <hr className='my-4 text-slate-200' />
                                <div className='flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3'>
                                    <span className="font-jost">Total</span>
                                    <span>${(subtotal - discountAmount).toFixed(2)}</span>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989FF] transition-all rounded-lg"
                                >
                                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                                    {loading ? "Redirecting..." : "Proceed to Checkout"}
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default CartPage