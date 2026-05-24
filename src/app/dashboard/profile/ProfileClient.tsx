"use client";

import React, { useState } from 'react';
import styles from './Profile.module.css';
import { updateProfileAction } from './actions';
import { createClient } from '@/utils/supabase/client';
import { Camera } from 'lucide-react';

export default function ProfileClient({ profile, email }: { profile: any, email: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
    address: profile?.address || '',
    avatar_url: profile?.avatar_url || '',
  });

  const initials = form.full_name ? form.full_name.substring(0, 2).toUpperCase() : 'US';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Error subiendo imagen: Asegúrate de tener el bucket 'avatars' creado en Supabase y que sea público.`);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    setForm({ ...form, avatar_url: data.publicUrl });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfileAction(form);
    if (res.success) {
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } else {
      alert(res.error || 'Ocurrió un error al actualizar el perfil.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Mi Perfil</h1>
        <p>Administra tu información personal y datos de contacto.</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar} style={{ overflow: 'hidden', position: 'relative' }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
            {isEditing && (
              <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', justifyContent: 'center', padding: '0.2rem', cursor: 'pointer' }}>
                <Camera size={14} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={loading} />
              </label>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h2>{form.full_name || 'Usuario SERENO'}</h2>
            <p>{email}</p>
            <span className={styles.badge}>Suscripción: {profile?.plan_type || 'Esencial'}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsEditing(!isEditing)}
            style={{ marginLeft: 'auto', padding: '0.5rem 1rem', background: isEditing ? '#475569' : '#10b981', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nombre Completo</label>
            <input 
              type="text" 
              className={`${styles.input} ${!isEditing ? styles.readOnly : ''}`} 
              value={form.full_name} 
              onChange={e => setForm({...form, full_name: e.target.value})}
              readOnly={!isEditing} 
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Correo Electrónico (Solo Lectura)</label>
            <input type="email" className={`${styles.input} ${styles.readOnly}`} value={email} readOnly />
          </div>

          <div className={styles.formGroup}>
            <label>Teléfono (WhatsApp)</label>
            <input 
              type="tel" 
              className={`${styles.input} ${!isEditing ? styles.readOnly : ''}`} 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})}
              readOnly={!isEditing} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>País de Residencia</label>
            <input 
              type="text" 
              className={`${styles.input} ${!isEditing ? styles.readOnly : ''}`} 
              value={form.country} 
              onChange={e => setForm({...form, country: e.target.value})}
              readOnly={!isEditing} 
            />
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Dirección Física / Envío</label>
            <input 
              type="text" 
              className={`${styles.input} ${!isEditing ? styles.readOnly : ''}`} 
              value={form.address} 
              onChange={e => setForm({...form, address: e.target.value})}
              readOnly={!isEditing} 
              placeholder="Ej. Av. Winston Churchill #43, Ensanche Piantini..."
            />
          </div>

          {isEditing && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '0.75rem 2rem', background: '#38bdf8', color: '#0f172a', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
              Para cambiar de plan de suscripción o correo, comunícate con soporte en WhatsApp.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
