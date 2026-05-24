'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * 1. Activar un Beneficiario manualmente
 */
export async function activateBeneficiary(beneficiaryId: string) {
  if (!beneficiaryId) throw new Error("ID requerido")
  
  const { error } = await supabaseAdmin
    .from('beneficiaries')
    .update({ account_status: 'activo' })
    .eq('id', beneficiaryId)
    
  if (error) throw new Error("Error activando beneficiario: " + error.message)
  
  revalidatePath(`/admin/patients/${beneficiaryId}`)
  revalidatePath('/admin')
  return { success: true }
}

/**
 * 2. Crear Ticket de Servicio
 */
export async function createServiceTicket(data: {
  beneficiaryId: string,
  serviceType: string,
  description: string,
  priority?: string
}) {
  if (!data.beneficiaryId || !data.serviceType) throw new Error("Faltan datos")

  const { data: ben } = await supabaseAdmin
    .from('beneficiaries')
    .select('emisor_id')
    .eq('id', data.beneficiaryId)
    .single()

  if (!ben) throw new Error("Beneficiario no encontrado")

  const { error } = await supabaseAdmin
    .from('service_requests')
    .insert([{
      beneficiary_id: data.beneficiaryId,
      emisor_id: ben.emisor_id,
      service_type: data.serviceType,
      description: data.description,
      priority: data.priority || 'media',
      status: 'pendiente'
    }])

  if (error) throw new Error("Error creando ticket: " + error.message)

  revalidatePath(`/admin/patients/${data.beneficiaryId}`)
  revalidatePath('/admin/services')
  return { success: true }
}

/**
 * 3. Actualizar estado del Kanban
 */
export async function updateServiceStatus(serviceId: string, newStatus: string) {
  if (!serviceId || !newStatus) throw new Error("Datos incompletos")

  const { error } = await supabaseAdmin
    .from('service_requests')
    .update({ status: newStatus })
    .eq('id', serviceId)

  if (error) throw new Error("Error moviendo ticket: " + error.message)

  revalidatePath('/admin/services')
  return { success: true }
}

/**
 * 4. Agregar Cargo Manual (Tabla 'payments')
 */
export async function addManualCharge(beneficiaryId: string, amount: number, concept: string) {
  if (!beneficiaryId || isNaN(amount) || !concept) {
    throw new Error('Faltan campos requeridos.')
  }

  const { error } = await supabaseAdmin
    .from('payments')
    .insert([{
      beneficiary_id: beneficiaryId,
      amount: amount,
      concept: concept,
      status: 'completado',
      type: 'cargo_manual'
    }])

  if (error) throw new Error('Error registrando el cargo: ' + error.message)

  revalidatePath(`/admin/patients/${beneficiaryId}`)
  return { success: true }
}

/**
 * 5. Crear un Emisor desde el Administrador (omitiendo validación)
 */
export async function createEmisorAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  if (!email || !password || !fullName) {
    throw new Error('Faltan campos requeridos.')
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError || !authData.user) {
    throw new Error('Error creando usuario Auth: ' + (authError?.message || 'Desconocido'))
  }

  // Creamos el perfil del emisor
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: authData.user.id,
      full_name: fullName,
      phone: phone || null,
      role: 'user'
    })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error('Error creando perfil: ' + profileError.message)
  }

  revalidatePath('/admin/users')
}

/**
 * 6. Validar manualmente un pago
 */
export async function validateManualPayment(paymentId: string, adminId: string, notes: string) {
  if (!paymentId) throw new Error("ID de pago requerido")

  const { data, error } = await supabaseAdmin.rpc('validate_payment_and_activate_subscription', {
    p_payment_id: paymentId,
    p_admin_id: adminId || null,
    p_validation_notes: notes || "Validado manualmente por Administrador"
  })

  if (error) {
    throw new Error("Error en la validación: " + error.message)
  }

  const result = data as any
  if (result && result.success === false) {
    throw new Error(result.error || "No se pudo validar el pago")
  }

  revalidatePath('/admin/payments')
  revalidatePath('/admin')
  return { success: true }
}

/**
 * 7. Registrar Signos Vitales manualmente
 */
export async function recordVitalSignAction(
  beneficiaryId: string,
  measurementType: 'blood_pressure' | 'blood_glucose' | 'heart_rate' | 'oxygen_saturation',
  value: any,
  notes?: string
) {
  if (!beneficiaryId || !measurementType || !value) {
    throw new Error('Faltan campos requeridos.')
  }

  // Determinar alertas con rangos típicos
  let isAlert = false
  let alertReason = ''

  if (measurementType === 'blood_pressure') {
    const systolic = Number(value.systolic)
    const diastolic = Number(value.diastolic)
    if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) {
      isAlert = true
      alertReason = `Presión arterial fuera de rango: ${systolic}/${diastolic} mmHg`
    }
  } else if (measurementType === 'blood_glucose') {
    const glucose = Number(value.value)
    const fasting = !!value.fasting
    if (fasting) {
      if (glucose > 126 || glucose < 70) {
        isAlert = true
        alertReason = `Glucosa en ayunas fuera de rango: ${glucose} mg/dL`
      }
    } else {
      if (glucose > 200 || glucose < 70) {
        isAlert = true
        alertReason = `Glucosa fuera de rango: ${glucose} mg/dL`
      }
    }
  } else if (measurementType === 'heart_rate') {
    const bpm = Number(value.bpm)
    if (bpm > 100 || bpm < 60) {
      isAlert = true
      alertReason = `Frecuencia cardíaca fuera de rango: ${bpm} bpm`
    }
  } else if (measurementType === 'oxygen_saturation') {
    const percentage = Number(value.percentage)
    if (percentage < 95) {
      isAlert = true
      alertReason = `Saturación de oxígeno baja: ${percentage}%`
    }
  }

  const { error } = await supabaseAdmin
    .from('vital_signs')
    .insert([{
      beneficiary_id: beneficiaryId,
      measurement_type: measurementType,
      value: value,
      notes: notes || null,
      source: 'manual_admin',
      is_alert: isAlert,
      alert_reason: isAlert ? alertReason : null,
      measured_at: new Date().toISOString()
    }])

  if (error) {
    throw new Error('Error registrando signos vitales: ' + error.message)
  }

  revalidatePath(`/admin/patients/${beneficiaryId}`)
  revalidatePath('/admin')
  return { success: true }
}
