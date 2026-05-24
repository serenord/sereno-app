'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Registra un nuevo Emisor en el sistema.
 * Crea el usuario en Auth y luego inserta el registro en la tabla pública `users`.
 */
export async function registerUser(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  // Usaremos una contraseña generada o una por defecto si no la proveen
  const password = (formData.get('password') as string) || Math.random().toString(36).slice(-10) + 'A1!'

  if (!fullName || !email) throw new Error('Nombre y correo son requeridos.')

  // 1. Crear en Supabase Auth
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr || !authData.user) {
    throw new Error('Error creando credenciales: ' + (authErr?.message || 'Error desconocido'))
  }

  // 2. Insertar en tabla public.users
  const { error: dbErr } = await supabaseAdmin
    .from('users')
    .insert([{
      id: authData.user.id,
      full_name: fullName,
      role: 'emisor',
      phone: phone || null
    }])

  if (dbErr) {
    // Rollback manual si falla la DB
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error('Error registrando usuario en la base de datos: ' + dbErr.message)
  }

  revalidatePath('/admin')
  return { success: true, userId: authData.user.id }
}

/**
 * Crea un beneficiario y lo vincula a un emisor.
 */
export async function createBeneficiary(data: {
  emisorId: string,
  fullName: string,
  dateOfBirth: string,
  gender: 'masculino' | 'femenino' | 'otro',
  cedula?: string,
  relationship: string,
  city: string,
  address: string,
  medicalConditions?: string[]
}) {
  if (!data.emisorId || !data.fullName || !data.relationship || !data.dateOfBirth) {
    throw new Error('Faltan campos obligatorios para el beneficiario.')
  }

  // Asumimos que el admin es quien lo registra, por ende user_id podría ser del admin, 
  // pero según el esquema, user_id es el id del usuario que "lo posee" operativamente, o sea el emisor.
  const { data: newBen, error } = await supabaseAdmin
    .from('beneficiaries')
    .insert([{
      emisor_id: data.emisorId,
      user_id: data.emisorId, // Para simplificar asumiendo que el emisor lo maneja
      full_name: data.fullName,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      cedula: data.cedula || null,
      relationship: data.relationship,
      city: data.city,
      address: data.address,
      medical_conditions: data.medicalConditions || [],
      account_status: 'activo'
    }])
    .select()
    .single()

  if (error) {
    throw new Error('Error creando beneficiario: ' + error.message)
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true, data: newBen }
}

/**
 * Crea una solicitud de servicio (Ticket Kanban)
 */
export async function createServiceRequest(data: {
  emisorId: string,
  beneficiaryId: string,
  serviceType: string,
  description: string,
  priority?: 'baja' | 'media' | 'alta' | 'emergencia'
}) {
  if (!data.emisorId || !data.beneficiaryId || !data.serviceType) {
    throw new Error('Información incompleta para el ticket.')
  }

  const { error } = await supabaseAdmin
    .from('service_requests')
    .insert([{
      emisor_id: data.emisorId,
      beneficiary_id: data.beneficiaryId,
      service_type: data.serviceType,
      description: data.description,
      priority: data.priority || 'media',
      status: 'pendiente'
    }])

  if (error) {
    throw new Error('Error creando solicitud: ' + error.message)
  }

  revalidatePath('/admin/services')
  revalidatePath('/dashboard')
  return { success: true }
}
