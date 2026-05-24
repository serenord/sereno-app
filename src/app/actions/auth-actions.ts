'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'

export async function registerUserAction(prevState: any, formData: FormData) {
  const emisor_name = formData.get('emisor_name') as string;
  const email = formData.get('email') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const pais = formData.get('pais') as string;
  
  const ben_name = formData.get('ben_name') as string;
  const ben_age = formData.get('ben_age') as string;
  const ben_gender = formData.get('ben_gender') as string;
  const has_ars = formData.get('has_ars') === 'on';
  const ars_provider = formData.get('ars_provider') as string;
  const toma_medicacion = formData.get('toma_medicacion') === 'on';
  const condiciones_cronicas = formData.getAll('condiciones_cronicas') as string[];
  const relacion_parentesco = formData.get('relacion_parentesco') as string;

  if (!email || !emisor_name || !ben_name) {
    return { error: 'Faltan campos requeridos.' };
  }

  try {
    // 1. Crear el usuario Emisor en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'TemporalPassword123!', // En producción usaríamos un flujo sin contraseña o pediríamos contraseña
      email_confirm: true,
      user_metadata: { full_name: emisor_name, phone: whatsapp, pais }
    });

    if (authError || !authData.user) {
      if (authError?.message.includes('already registered')) {
        return { error: 'El email ya está registrado en el sistema.' };
      }
      return { error: 'Error creando usuario Auth: ' + (authError?.message || 'Desconocido') };
    }

    const emisorId = authData.user.id;

    // 2. Insertar en tabla users (rol 'emisor')
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: emisorId,
        email,
        phone: whatsapp,
        full_name: emisor_name,
        role: 'emisor'
      });

    if (userError) {
      // Intentar limpiar si falla
      await supabaseAdmin.auth.admin.deleteUser(emisorId);
      return { error: 'Error creando perfil de emisor: ' + userError.message };
    }

    // Crear un usuario base para el beneficiario
    const { data: benUser, error: benUserError } = await supabaseAdmin
      .from('users')
      .insert([{
        email: `ben_${Date.now()}@temp.sereno.com`,
        full_name: ben_name,
        role: 'beneficiario'
      }])
      .select('id')
      .single();

    if (benUserError) {
      return { error: 'Error creando perfil base de beneficiario: ' + benUserError.message };
    }

    // Calcular fecha de nacimiento aproximada (se pedirá exacta después o ajustar en UI)
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - parseInt(ben_age || '0'));

    // 3. Insertar beneficiario
    const { data: newBen, error: benError } = await supabaseAdmin
      .from('beneficiaries')
      .insert([{
        user_id: benUser.id,
        emisor_id: emisorId,
        full_name: ben_name,
        date_of_birth: dob.toISOString().split('T')[0],
        gender: ben_gender,
        relationship: relacion_parentesco || 'Familiar',
        has_ars,
        ars_provider: has_ars ? ars_provider : null,
        account_status: 'esperando_informacion'
      }])
      .select('id')
      .single();

    if (benError) {
      return { error: 'Error creando registro de beneficiario: ' + benError.message };
    }

    // 4. Crear suscripción (estado esperando_informacion)
    await supabaseAdmin.from('subscriptions').insert([{
      emisor_id: emisorId,
      plan_tier: 'estandar', 
      plan_price: 39.99,
      status: 'esperando_informacion'
    }]);

    // Opcional: Insertar ficha médica inicial si hay condiciones
    if (condiciones_cronicas.length > 0 || toma_medicacion) {
      await supabaseAdmin.from('medical_records').insert([{
        beneficiary_id: newBen.id,
        chronic_conditions: condiciones_cronicas
      }]);
    }

    // 5. Log al canal de Admin
    console.log(`[ADMIN ALERT] Nuevo cliente registrado, pendiente contacto inicial: ${emisor_name} (${email}) - WhatsApp: ${whatsapp}`);

    return { success: true };
  } catch (err: any) {
    return { error: 'Ocurrió un error inesperado: ' + err.message };
  }
}
