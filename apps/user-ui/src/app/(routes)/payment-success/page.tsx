"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useStore } from "apps/user-ui/src/shared/store";

const Page = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const router = useRouter();

  // Clear cart and trigger confetti
  useEffect(() => {
    useStore.setState({ cart: [] });

    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  }, []);

  return (
     <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white border border-gray-100 rounded-xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-medium text-gray-900 mb-2">Payment successful</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Your order has been placed. You'll receive a confirmation email shortly.
        </p>
        <button
          onClick={() => router.push(`/profile?active=My+Orders`)}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
          </svg>
          Track order
        </button>
        {sessionId && (
          <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400">Session ID</span>
            <span className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
              {sessionId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;