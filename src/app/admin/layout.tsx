import React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, Users, CreditCard, UserPlus,
  Settings, LogOut, ShieldCheck, ClipboardList
} from 'lucide-react'

export const revalidate = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 text-white font-bold text-lg tracking-wider border-b border-slate-800">
          <ShieldCheck className="mr-2" size={24} />
          SERENO ADMIN
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <Link href="/admin" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard size={20} className="mr-3 text-slate-400" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Users size={20} className="mr-3 text-slate-400" />
            <span>Gestión de Emisores</span>
          </Link>
          <Link href="/admin/patients" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <UserPlus size={20} className="mr-3 text-slate-400" />
            <span>Pacientes (RD)</span>
          </Link>
          <Link href="/admin/services" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <ClipboardList size={20} className="mr-3 text-slate-400" />
            <span>Gestión de Servicios</span>
          </Link>
          <Link href="/admin/payments" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <CreditCard size={20} className="mr-3 text-slate-400" />
            <span>Pagos Pendientes</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/admin/settings" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Settings size={20} className="mr-3 text-slate-400" />
            <span>Configuración</span>
          </Link>
          <form action="/api/auth/logout" method="POST" className="mt-2">
            <button type="submit" className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-red-900/50 hover:text-red-400 text-slate-400 transition-colors">
              <LogOut size={20} className="mr-3" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Panel Operativo Central</h1>
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">Modo Administrador</span>
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
