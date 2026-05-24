import React from 'react'
import Link from 'next/link'
import { LogOut, Home, Bell, Settings, User } from 'lucide-react'

export const revalidate = 0;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <span className="font-bold text-xl text-blue-900 tracking-tight">SERENO</span>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-900 font-medium hover:text-blue-600 transition">
                  Inicio
                </Link>
                <Link href="/dashboard/telemetry" className="text-gray-500 hover:text-gray-900 transition">
                  Hábitos y Salud
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                <User size={16} />
              </div>
              
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-gray-400 hover:text-red-500 transition">
                  <LogOut size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
