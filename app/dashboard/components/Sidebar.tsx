'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ChevronRight,
  Globe,
  X
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Data Visitor',
    href: '/dashboard/visitors',
    icon: Users
  },
  {
    title: 'Data URL',
    href: '/dashboard/urls',
    icon: Globe
  }
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        />
      )}
      <div className={cn(
        "flex h-screen w-72 flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out",
        "md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "fixed inset-y-0 left-0 z-50 md:z-auto"
      )}>
        <div className="flex h-20 items-center justify-between px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image 
              src="/assets/images/logo-essentials.gif" 
              alt="Logo Essentials" 
              width={96} 
              height={96} 
              className="w-24 h-24"
              unoptimized
            />
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 rounded-md hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6 px-4 gap-2">
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu Utama
            </p>
          </div>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.title}
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            )
          })}
        </div>

        <div className="p-4 mt-auto">
          <button
            onClick={() => { handleLogout(); closeSidebar(); }}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 text-red-500 transition-colors" />
            Keluar Sesi
          </button>
        </div>
      </div>
    </>
  )
}
