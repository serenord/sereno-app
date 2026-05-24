'use client'

import { useActionState } from 'react'
import { registerUserAction } from '@/app/actions/auth-actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
    >
      {pending ? 'Enviando...' : 'Completar Registro'}
    </button>
  )
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerUserAction, null)

  return (
    <form action={formAction} className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8 border border-gray-100">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">1. Datos del Emisor (Quien paga y gestiona)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
            <input type="text" name="emisor_name" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Ej. Juan Pérez" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" name="email" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="juan@ejemplo.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
            <input type="tel" name="whatsapp" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="+1 809 555 1234" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">País de Residencia</label>
            <input type="text" name="pais" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Ej. Estados Unidos" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6 mt-4">2. Datos del Beneficiario (Paciente)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Beneficiario</label>
            <input type="text" name="ben_name" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Ej. María González" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Relación / Parentesco</label>
            <select name="relacion_parentesco" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
              <option value="">Seleccione...</option>
              <option value="Madre">Madre</option>
              <option value="Padre">Padre</option>
              <option value="Abuelo/a">Abuelo/a</option>
              <option value="Tío/a">Tío/a</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Edad Aprox. (Años)</label>
            <input type="number" name="ben_age" required min="0" max="120" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Ej. 65" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sexo</label>
            <select name="ben_gender" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
              <option value="">Seleccione...</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <input type="checkbox" name="has_ars" id="has_ars" className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="has_ars" className="ml-2 block text-md font-medium text-gray-900">
                ¿Tiene Seguro Médico (ARS)?
              </label>
            </div>
            
            <div className="flex-1">
              <select name="ars_provider" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
                <option value="">Seleccione Proveedor (Opcional)</option>
                <option value="Senasa">Senasa</option>
                <option value="Humano">Humano</option>
                <option value="Palic">Mapfre Salud ARS</option>
                <option value="Universal">ARS Universal</option>
                <option value="Monumental">ARS Monumental</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" name="toma_medicacion" id="toma_medicacion" className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="toma_medicacion" className="ml-2 block text-md font-medium text-gray-900">
              ¿Toma medicación regular?
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-md font-medium text-gray-900 mb-3">Condiciones Crónicas</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Diabetes', 'Hipertensión', 'Asma', 'Artritis', 'Colesterol Alto', 'Enfermedad Cardíaca'].map((cond) => (
                <label key={cond} className="inline-flex items-center bg-white p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition">
                  <input type="checkbox" name="condiciones_cronicas" value={cond} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">{cond}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {state.error}
        </div>
      )}

      {state?.success ? (
        <div className="bg-green-50 text-green-800 p-6 rounded-lg border border-green-200 text-center shadow-sm">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-bold text-xl mb-2">¡Registro completado con éxito!</h3>
          <p className="text-green-700">Hemos recibido sus datos de forma segura. Un administrador de Sereno se pondrá en contacto con usted por WhatsApp en breve para validar la información y activar su cuenta.</p>
        </div>
      ) : (
        <div className="pt-2">
          <SubmitButton />
        </div>
      )}
    </form>
  )
}
