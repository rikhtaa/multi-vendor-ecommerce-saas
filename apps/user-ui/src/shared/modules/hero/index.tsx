"use client"
import useLayout from "apps/user-ui/src/hooks/useLayout"
import { MoveRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"


const Hero = () => {
  const router = useRouter()
  const {layout} = useLayout()
  return (
    <div className='h-[85vh] bg-[#115061] flex flex-col justify-center w-full'>
       <div className="md:w-[80%] w-[90%] mx-auto md:flex h-full items-center">
         <div className="md:w-1/2">
         <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
         </p>
         <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best watch <br/>
            Collection 2025
         </h1>
         <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> off
            this week
         </p>
         <br/>
         <button 
         onClick={() => router.push('/products')}
         className="flex items-center gap-2 bg-white text-black font-semibold px-5 py-2 rounded-md hover:bg-yellow-400 transition-colors duration-200"
         >
            Shop Now <MoveRight size={18}/>
         </button>
         </div> 
         <div className="md:w-1/2 flex justify-center">
          <Image
           src={
              layout?.banner ||
              "https://ik.imagekit.io/rikhtamenahil/bright-background-modern-yellow-smart-watch-with-blank-black-screen-is-isolated-generative-ai_1219132-53556.avif?updatedAt=1781514684891"
            }
           alt="Banner"
           width={450}
           height={450}
           />
         </div>
       </div>
    </div>  
  )
}

export default Hero