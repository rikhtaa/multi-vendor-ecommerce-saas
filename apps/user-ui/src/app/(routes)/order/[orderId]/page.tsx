"use client"

import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Page = () => {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`
      );
      setOrder(res.data.order);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch order details", err);
    } finally {
      setLoading(false)
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await axiosInstance.put(`/order/api/update-status/${order.id}`, {
        deliveryStatus: newStatus,
      });
      setOrder((prev: any) => ({ ...prev, deliveryStatus: newStatus }));
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-red-500">Order not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Order #{order.id.slice(-6)}
      </h1>

      {/* Delivery Progress */}
      <div className="my-4">
        <div className="flex items-center justify-between text-xs font-medium text-g...">
          {statuses.map((step, idx) => {
            const current = step === order.deliveryStatus;
            const passed = statuses.indexOf(order.deliveryStatus) >= idx;
            return (
              <div
                key={step}
                className={`flex-1 text-left ${current
                    ? "text-blue-600"
                    : passed
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
              >
                {step}
              </div>
            );
          })}
        </div>
        <div className="flex items-center">
          {statuses.map((step, idx) => {
            const reached = idx <= statuses.indexOf(order.deliveryStatus);
            return (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`w-4 h-4 rounded-full ${reached ? "bg-blue-600" : "bg-gray-300"
                    }`}
                />
                {idx !== statuses.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${reached ? "bg-blue-500" : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Info */}
      <div className="mb-6 space-y-1 text-sm text-gray-800">
        <p>
          <span className="font-semibold text-gray-800">Payment Status:</span>{" "}
          <span className="text-green-600 font-medium">{order.status}</span>
        </p>
        <p>
          <span className="font-semibold text-gray-800">Total Paid:</span>{" "}
          <span className="font-medium">${order.total.toFixed(2)}</span>
        </p>

        {order.discountAmount > 0 && (
          <p>
            <span className="font-semibold text-gray-800">Discount Applied:</span>{" "}
            <span className="text-green-400">
              {order.couponCode?.discountType === "percentage"
                ? `${order.couponCode.discountValue}%`
                : `$${order.couponCode.discountValue}`}{" "}
              off
            </span>
          </p>
        )}

        {order.couponCode && (
          <p>
            <span className="font-semibold text-gray-800">Coupon Used:</span>{" "}
            <span className="text-blue-400">
              {order.couponCode.public_name}
            </span>
          </p>
        )}

        <p>
          <span className="font-semibold text-gray-800">Date:</span>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="mb-6 text-sm text-gray-800">
          <h2 className="text-md font-semibold text-gray-800 mb-2">Shipping Address</h2>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city}{" "}
            {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      )}

      {/* Order Items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="border border-gray-200 rounded-md p-4 flex items-center gap-4"
            >
              <img
                src={item.product?.images[0]?.url || "/placeholder.png"}
                alt={item.product?.title || "Product image"}
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {item.product?.title || "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm text-gray-500">
                  Size: {item.selectedOptions?.size || ""}
                </p>
              </div>
              <div className="font-semibold text-gray-800">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page