"use client"
import Sidebar from './components/Sidebar'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'

import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<null | boolean>(null)
  useEffect(() => {
    const check = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoggedIn(false)
        router.replace('/login')
      } else {
        setIsLoggedIn(true)
      }
    }
    check()
  }, [router])
  if (isLoggedIn === null) return null
  if (!isLoggedIn) return null
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute top-0 left-0 w-full h-75 bg-linear-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        <main className="flex-1 relative z-10 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
