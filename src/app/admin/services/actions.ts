'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function quoteServiceRequest(
  serviceId: string,
  estimatedCost: number,
  arsCoverage: number,
  copayAmount: number
) {
  if (!serviceId) throw new Error("ID de servicio requerido")

  // 1. Obtener datos del ticket para la notificación
  const { data: serviceReq, error: fetchErr } = await supabaseAdmin
    .from('service_requests')
    .select('emisor_id, service_type, beneficiaries(full_name)')
    .eq('id', serviceId)
    .single()

  if (fetchErr || !serviceReq) {
    throw new Error("No se encontró el servicio")
  }

  // 2. Actualizar el ticket a estado "cotizado"
  const { error: updateErr } = await supabaseAdmin
    .from('service_requests')
    .update({
      estimated_cost: estimatedCost,
      ars_coverage: arsCoverage,
      copay_amount: copayAmount,
      status: 'cotizado',
      quoted_at: new Date().toISOString()
    })
    .eq('id', serviceId)

  if (updateErr) {
    throw new Error("Error actualizando cotización: " + updateErr.message)
  }

  // 3. Crear notificación para el Emisor
  const beneficiaryName = (serviceReq.beneficiaries as any)?.full_name || 'tu beneficiario'
  
  await supabaseAdmin.from('notifications').insert([{
    user_id: serviceReq.emisor_id,
    notification_type: 'servicio_cotizado',
    title: 'Cotización Disponible',
    message: `El servicio (${serviceReq.service_type}) para ${beneficiaryName} ha sido cotizado. Revisa tu panel para aprobar el copago de $${copayAmount}.`,
    metadata: { service_id: serviceId, copay_amount: copayAmount }
  }])

  // Invalidar caché
  revalidatePath('/admin/services')
  return { success: true }
}

export async function completeServiceAction(formData: FormData) {
  const serviceId = formData.get('serviceId') as string;
  const notes = formData.get('notes') as string;
  const gpsStr = formData.get('gpsLocation') as string;
  const gpsLocation = gpsStr ? JSON.parse(gpsStr) : null;
  const files = formData.getAll('files') as File[];
  if (!serviceId) throw new Error("ID de servicio requerido")

  // 1. Obtener datos del ticket para notificación
  const { data: serviceReq, error: fetchErr } = await supabaseAdmin
    .from('service_requests')
    .select('emisor_id, service_type, beneficiaries(full_name)')
    .eq('id', serviceId)
    .single()

  if (fetchErr || !serviceReq) {
    throw new Error("No se encontró el servicio")
  }

  // 1.5 Upload files to storage bypassing RLS
  const photosUrls: string[] = [];
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${serviceId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('evidence-photos')
      .upload(fileName, buffer, { contentType: file.type });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      throw new Error("Error subiendo evidencia. ¿Está creado el bucket 'evidence-photos'?: " + uploadErr.message);
    }
    
    const { data: urlData } = supabaseAdmin.storage.from('evidence-photos').getPublicUrl(fileName);
    photosUrls.push(urlData.publicUrl);
  }

  // 2. Actualizar el ticket a verificado
  const { error: updateErr } = await supabaseAdmin
    .from('service_requests')
    .update({
      status: 'verificado',
      evidence_photos: photosUrls,
      evidence_gps_location: gpsLocation,
      evidence_notes: notes,
      evidence_timestamp: new Date().toISOString(),
      executed_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
    })
    .eq('id', serviceId)

  if (updateErr) {
    throw new Error("Error finalizando servicio: " + updateErr.message)
  }

  // 3. Notificar al emisor
  const beneficiaryName = (serviceReq.beneficiaries as any)?.full_name || 'tu beneficiario'
  
  await supabaseAdmin.from('notifications').insert([{
    user_id: serviceReq.emisor_id,
    notification_type: 'servicio_completado',
    title: 'Servicio Completado y Verificado',
    message: `El servicio (${serviceReq.service_type}) para ${beneficiaryName} ha sido completado. Puedes ver las evidencias (fotos y ubicación) en tu panel.`,
    metadata: { service_id: serviceId }
  }])

  // Invalidar caché
  revalidatePath('/admin/services')
  return { success: true }
}
