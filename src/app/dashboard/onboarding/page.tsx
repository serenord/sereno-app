import { completeOnboardingAction } from './actions'
import { HeartPulse } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <HeartPulse size={32} className="text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Completar Perfil del Familiar</h1>
        <p className="text-center text-gray-500 mb-8">
          Crea la ficha de la persona que recibirá los cuidados médicos y selecciona un plan.
        </p>

        <form action={completeOnboardingAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo del Familiar</label>
              <input 
                type="text" 
                name="fullName" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. María González"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parentesco</label>
              <select name="relationship" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="madre">Madre</option>
                <option value="padre">Padre</option>
                <option value="abuelo">Abuelo/a</option>
                <option value="hijo">Hijo/a</option>
                <option value="tio">Tío/a</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
              <input 
                type="date" 
                name="dob" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select name="gender" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Seleccionar Plan Inicial</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Basico */}
              <label className="cursor-pointer">
                <input type="radio" name="planTier" value="basico" className="peer sr-only" required />
                <div className="p-4 border-2 border-gray-200 rounded-xl peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50 transition">
                  <div className="font-bold text-gray-900">Básico</div>
                  <div className="text-blue-600 font-semibold mt-1">$19.99/mes</div>
                </div>
              </label>

              {/* Estandar */}
              <label className="cursor-pointer">
                <input type="radio" name="planTier" value="estandar" className="peer sr-only" />
                <div className="p-4 border-2 border-gray-200 rounded-xl peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50 transition">
                  <div className="font-bold text-gray-900">Estándar</div>
                  <div className="text-blue-600 font-semibold mt-1">$39.99/mes</div>
                </div>
              </label>

              {/* Premium */}
              <label className="cursor-pointer">
                <input type="radio" name="planTier" value="premium" className="peer sr-only" />
                <div className="p-4 border-2 border-gray-200 rounded-xl peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50 transition">
                  <div className="font-bold text-gray-900">Premium</div>
                  <div className="text-blue-600 font-semibold mt-1">$64.99/mes</div>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Guardar Ficha y Continuar
          </button>
        </form>
      </div>
    </div>
  )
}
