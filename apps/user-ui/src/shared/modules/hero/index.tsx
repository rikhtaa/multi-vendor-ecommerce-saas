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
              "https://images.unsplash.com/photo-1767903622395-5677faed2b7f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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