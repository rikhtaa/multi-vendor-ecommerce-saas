"use client"
import Link from "next/link";
import React from "react";
import { Mail, MapPin, ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname()
  if(pathname === "/inbox") return null
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-white border-t border-t-[#99999933]">
      <div className="w-[80%] m-auto py-12">
        <div className="grid grid-cols-4 gap-8">

          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/">
              <span className="text-3xl font-[500]">Eshop</span>
            </Link>
            <p className="text-sm text-[#555] font-Poppins leading-relaxed">
              Perfect ecommerce platform to start your business from scratch
            </p>
            <div className="flex items-center gap-3 mt-1">
              {/* Facebook */}
              <a href="#" className="w-9 h-9 border border-[#010f1c1a] rounded flex items-center justify-center hover:border-[#3489FF] hover:text-[#3489FF] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" className="w-9 h-9 border border-[#010f1c1a] rounded flex items-center justify-center hover:border-[#3489FF] hover:text-[#3489FF] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="w-9 h-9 border border-[#010f1c1a] rounded flex items-center justify-center hover:border-[#3489FF] hover:text-[#3489FF] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* My Account Column */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#010f1c] text-base mb-1">My Account</h3>
            {[
              { label: "Track Orders", href: "/track-orders" },
              { label: "Shipping", href: "/shipping" },
              { label: "Wishlist", href: "/wishlist" },
              { label: "My Account", href: "/profile" },
              { label: "Order History", href: "/orders" },
              { label: "Returns", href: "/returns" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-[#555] font-Poppins hover:text-[#3489FF] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Information Column */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#010f1c] text-base mb-1">Information</h3>
            {[
              { label: "Our Story", href: "/about" },
              { label: "Careers", href: "/careers" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Latest News", href: "/news" },
              { label: "Contact Us", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-[#555] font-Poppins hover:text-[#3489FF] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Talk To Us Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-[#010f1c] text-base mb-1">Talk To Us</h3>
            <p className="text-sm text-[#555] font-Poppins">Got Questions? Call us</p>
            <a
              href="tel:+6704139076"
              className="text-2xl font-bold text-[#010f1c] hover:text-[#3489FF] transition-colors"
            >
              +670 413 90 762
            </a>
            <div className="flex flex-col gap-3 mt-1">
              <a
                href="mailto:support@eshop.com"
                className="flex items-center gap-2 text-sm text-[#555] font-Poppins hover:text-[#3489FF] transition-colors"
              >
                <Mail size={15} className="text-[#3489FF] shrink-0" />
                support@eshop.com
              </a>
              <div className="flex items-start gap-2 text-sm text-[#555] font-Poppins">
                <MapPin size={15} className="text-[#3489FF] shrink-0 mt-0.5" />
                <span>79 Sleepy Hollow St. Jamaica, New York 1432</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-t-[#99999933]">
        <div className="w-[80%] m-auto py-5 flex items-center justify-between">
          <span className="text-sm text-[#555] font-Poppins">
            © 2025 All Rights Reserved | Becodemy Private Ltd
          </span>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-[#010f1c] rounded-full flex items-center justify-center hover:bg-[#3489FF] transition-colors"
          >
            <ArrowUp size={18} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
