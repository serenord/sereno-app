"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserPlus, CheckCircle, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { linkBeneficiaryByShortId } from "@/app/actions/linkBeneficiary";

export default function BeneficiaryRegistrationForm({ emisorId }: { emisorId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"new" | "link">("link");
  const [shortId, setShortId] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    relationship_to_emisor: "Madre",
    address: "",
    city: "Santo Domingo",
    government_id: "",
    current_diagnoses: "",
  });

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await linkBeneficiaryByShortId(emisorId, shortId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al vincular el ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("beneficiaries").insert([
        {
          emisor_id: emisorId,
          full_name: form.full_name,
          relationship_to_emisor: form.relationship_to_emisor,
          address: form.address,
          city: form.city,
          government_id: form.government_id,
          current_diagnoses: form.current_diagnoses,
          takes_medication: true,
          current_plan_tier: "Vital",
        },
      ]);

      if (insertError) throw insertError;
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Hubo un error al registrar a tu familiar.");
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem', maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => { setMode("link"); setError(null); }}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', border: '1px solid #38bdf8', background: mode === 'link' ? '#38bdf8' : 'transparent', color: mode === 'link' ? '#0f172a' : '#38bdf8', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Tengo un ID Corto
          </button>
          <button 
            onClick={() => { setMode("new"); setError(null); }}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', border: '1px solid #10b981', background: mode === 'new' ? '#10b981' : 'transparent', color: mode === 'new' ? '#0f172a' : '#10b981', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Registrar Nuevo
          </button>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
          {mode === "link" ? "Vincular Familiar Existente" : "Registrar Nuevo Familiar"}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          {mode === "link" ? "Ingresa el ID Corto (Ej. PAC-A1B2C3D4) que te proporcionó el equipo de SERENO." : "Completa los datos básicos de tu ser querido en RD para comenzar."}
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(159, 18, 57, 0.2)', border: '1px solid rgba(159, 18, 57, 0.5)', color: '#fda4af', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {mode === "link" ? (
        <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>ID Corto del Paciente</label>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                required
                type="text"
                placeholder="PAC-A1B2C3D4"
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #38bdf8', borderRadius: '0.5rem', padding: '0.75rem 1rem 0.75rem 2.5rem', color: 'white', outline: 'none', fontSize: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                value={shortId}
                onChange={(e) => setShortId(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !shortId}
            style={{ width: '100%', backgroundColor: '#38bdf8', color: '#020617', fontWeight: 'bold', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: loading || !shortId ? 'not-allowed' : 'pointer', opacity: loading || !shortId ? 0.7 : 1 }}
          >
            {loading ? "Buscando y Vinculando..." : "Vincular a mi Perfil"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nombre Completo</label>
            <input
              required
              type="text"
              placeholder="Ej. María Pérez"
              style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Parentesco</label>
              <input
                required
                type="text"
                placeholder="Ej. Madre, Padre, Abuelo"
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
                value={form.relationship_to_emisor}
                onChange={(e) => setForm({ ...form, relationship_to_emisor: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cédula</label>
              <input
                type="text"
                placeholder="001-0000000-1"
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
                value={form.government_id}
                onChange={(e) => setForm({ ...form, government_id: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Dirección de Entrega (RD)</label>
              <input
                required
                type="text"
                placeholder="Calle Principal #123, Ensanche..."
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ciudad</label>
              <input
                required
                type="text"
                style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Notas Clínicas Previas (Opcional)</label>
            <textarea
              placeholder="Sufre de hipertensión y diabetes leve. Alérgico a la penicilina."
              style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none', height: '80px', resize: 'none' }}
              value={form.current_diagnoses}
              onChange={(e) => setForm({ ...form, current_diagnoses: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#10b981', color: '#020617', fontWeight: 'bold', padding: '1rem', borderRadius: '0.5rem', border: 'none', marginTop: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Registrando..." : "Registrar Familiar"}
          </button>
        </form>
      )}
    </div>
  );
}
