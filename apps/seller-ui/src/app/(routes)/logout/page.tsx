'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const LogoutPage = () => {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/logout-seller`,
          {},
          { withCredentials: true }
        )
      } catch (error) {
        console.error("Logout failed:", error)
      } finally {
        router.push('/login')
      }
    }

    logout()
  }, [router])

  return (
    <div className="w-full h-screen flex items-center justify-center text-white">
      Logging you out...
    </div>
  )
}

export default LogoutPage