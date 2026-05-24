'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient()

  // 1. Validar autenticación
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    throw new Error("No estás autenticado")
  }

  const userId = authData.user.id

  // 2. Extraer datos del formulario
  const fullName = formData.get('fullName') as string
  const relationship = formData.get('relationship') as string
  const dob = formData.get('dob') as string
  const gender = formData.get('gender') as string
  const planTier = formData.get('planTier') as string

  if (!fullName || !relationship || !dob || !planTier) {
    throw new Error("Faltan campos requeridos")
  }

  // Precios según plan
  let planPrice = 19.99
  if (planTier === 'estandar') planPrice = 39.99
  if (planTier === 'premium') planPrice = 64.99

  // 3. Crear Beneficiario Base (Se asume que en V1 el beneficiary.user_id es el mismo Emisor por simplicidad, o se le crea un ghost user, pero según nuestro esquema, requiere un user_id y emisor_id. Para V1, si el familiar no tiene app propia, el user_id puede ser el del emisor temporalmente, o podemos crear un registro de usuario ghost).
  // Mejor: nuestro esquema exige user_id. Vamos a usar el mismo ID del emisor como user_id para no complicar la V1.
  
  const { data: beneficiary, error: benError } = await supabase.from('beneficiaries').insert([{
    user_id: userId, // Temporalmente el mismo hasta que tengan su propia app
    emisor_id: userId,
    full_name: fullName,
    date_of_birth: dob,
    gender: gender || 'otro',
    relationship: relationship,
    account_status: 'esperando_informacion'
  }]).select().single()

  if (benError) throw new Error("Error creando familiar: " + benError.message)

  // 4. Crear Suscripción
  const { error: subError } = await supabase.from('subscriptions').insert([{
    emisor_id: userId,
    plan_tier: planTier,
    plan_price: planPrice,
    status: 'esperando_informacion'
  }])

  if (subError) {
    // Nota: Deberíamos hacer rollback del beneficiario en un escenario real
    throw new Error("Error creando suscripción: " + subError.message)
  }

  // 5. Redirigir al dashboard para que vea el fallback o la tarjeta
  redirect('/dashboard')
}
