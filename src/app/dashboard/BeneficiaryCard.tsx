'use client'

import { useState } from 'react'
import { CreateServiceModal } from './CreateServiceModal'
import { Plus } from 'lucide-react'

interface BeneficiaryCardProps {
  beneficiaryId: string
  fullName: string
  relationship: string
  status: string
  planName: string
}

export function BeneficiaryCard({ beneficiaryId, fullName, relationship, status, planName }: BeneficiaryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xl font-bold">
            {fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500 capitalize">{relationship}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800`}>
                Suscripción Activa
              </span>
              <span className="text-xs text-gray-400 font-medium">| {planName}</span>
            </div>
          </div>
        </div>
        
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Solicitar Servicio
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CreateServiceModal
          beneficiaryId={beneficiaryId}
          beneficiaryName={fullName}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
