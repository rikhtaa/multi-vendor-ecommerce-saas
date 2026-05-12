"use client";
import React from 'react'

const GoogleButton = () => {
    return (
        <div className='w-full flex justify-center'>
            <div className='h-[46px] cursor-pointer border border-blue-100 flex items-center gap-2 px-3 rounded-[4px] my-2 bg-[rgba(210,227,252,0.3)]'>
                <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 32 32" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g>
                        <path fill="none" d="M8.9,16c0,0.6,0.1,1.2,0.2,1.8L11,16l-1.8-1.8C9,14.8,8.9,15.4,8.9,16z" />
                        <path fill="#34A853" d="M16,23.1c-3.3,0-6-2.2-6.8-5.2l-6.7,6.7C5.3,29,10.3,32,16,32c3.1,0,6-0.9,8.5-2.5l-6.7-6.7C17.2,23,16.6,23.1,16,23.1z"/>
                        <path fill="#4285F4" d="M32,13.8c-0.1-0.5-0.5-0.8-1-0.8H16c-0.6,0-1,0.4-1,1v5c0,0.6,0.4,1,1,1h5.3c-0.9,1.4-2.2,2.3-3.5,2.8l6.7,6.7C29,26.7,32,21.7,32,16c0-0.3,0-0.5,0-0.7C32.1,14.9,32.1,14.4,32,13.8z"/>
                        <path fill="#FBBC05" d="M8.9,16c0-0.6,0.1-1.2,0.2-1.8L2.5,7.5C0.9,10,0,12.9,0,16s0.9,6,2.5,8.5l6.7-6.7C9,17.2,8.9,16.6,8.9,16z" />
                        <path fill="#EA4335" d="M28.5,6c-1.1-1.4-2.5-2.6-4-3.6C22,0.9,19.1,0,16,0C10.3,0,5.3,3,2.5,7.5l6.7,6.7c0.8-3,3.6-5.2,6.8-5.2c0.6,0,1.2,0.1,1.8,0.3c0.9,0.3,1.7,0.8,2.6,1.5c0.3,0.3,0.7,0.3,1.1,0.1l6.7-3.3c0.3-0.1,0.5-0.4,0.5-0.7C28.8,6.6,28.7,6.3,28.5,6z"/>
                    </g>
                </svg>
                <span className="text-[16px] opacity-[.8] font-Poppins">
                    Sign In with Google
                </span>
            </div>
        </div>
    )
}

export default GoogleButton