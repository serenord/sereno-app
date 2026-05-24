"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FichaAMatrizForm({ beneficiary }: { beneficiary: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState({
    full_name: beneficiary.full_name || "",
    government_id: beneficiary.government_id || "",
    birth_date: beneficiary.birth_date || "",
    blood_type: beneficiary.blood_type || "",
    toxic_habits: beneficiary.toxic_habits || "",
    current_diagnoses: beneficiary.current_diagnoses || "",
    trusted_doctor_info: beneficiary.trusted_doctor_info || "",
    daily_limitations: beneficiary.daily_limitations || "",
  });

  const initLbs = beneficiary.weight_kg ? (beneficiary.weight_kg * 2.20462).toFixed(1) : "";
  const initTargetLbs = beneficiary.target_weight_kg ? (beneficiary.target_weight_kg * 2.20462).toFixed(1) : "";
  const totalInches = beneficiary.height_cm ? beneficiary.height_cm * 0.393701 : 0;
  const initFt = beneficiary.height_cm ? Math.floor(totalInches / 12).toString() : "";
  const initIn = beneficiary.height_cm ? Math.round(totalInches % 12).toString() : "";

  const [imperialData, setImperialData] = useState({
    weight_lbs: initLbs,
    target_weight_lbs: initTargetLbs,
    height_ft: initFt,
    height_in: initIn,
  });

  const [bmi, setBmi] = useState<number>(0);

  useEffect(() => {
    const lbs = parseFloat(imperialData.weight_lbs) || 0;
    const ft = parseFloat(imperialData.height_ft) || 0;
    const inches = parseFloat(imperialData.height_in) || 0;

    const weightKg = lbs / 2.20462;
    const heightMeters = ((ft * 12) + inches) / 39.37;
    
    if (heightMeters > 0 && weightKg > 0) {
      const calculatedBmi = weightKg / (heightMeters * heightMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(2)));
    } else {
      setBmi(0);
    }
  }, [imperialData.height_ft, imperialData.height_in, imperialData.weight_lbs]);

  const getBmiBadge = (val: number) => {
    if (val === 0) return { label: "No calculado", color: "#64748b", bg: "#f1f5f9" };
    if (val < 18.5) return { label: "Bajo Peso", color: "#b91c1c", bg: "#fee2e2" };
    if (val >= 18.5 && val <= 24.9) return { label: "Normal", color: "#15803d", bg: "#dcfce7" };
    if (val >= 25.0 && val <= 29.9) return { label: "Sobrepeso", color: "#b45309", bg: "#fef3c7" };
    return { label: "Obesidad (Alerta)", color: "#b91c1c", bg: "#fee2e2" };
  };

  const bmiStatus = getBmiBadge(bmi);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const lbs = parseFloat(imperialData.weight_lbs) || 0;
      const ft = parseFloat(imperialData.height_ft) || 0;
      const inches = parseFloat(imperialData.height_in) || 0;
      const targetLbs = parseFloat(imperialData.target_weight_lbs) || 0;

      const weightKg = lbs > 0 ? lbs / 2.20462 : null;
      const heightMeters = (ft > 0 || inches > 0) ? ((ft * 12) + inches) / 39.37 : 0;
      const heightCm = heightMeters > 0 ? Math.round(heightMeters * 100) : null;
      const targetWeightKg = targetLbs > 0 ? targetLbs / 2.20462 : null;

      const { error } = await supabase
        .from("beneficiaries")
        .update({
          full_name: form.full_name,
          government_id: form.government_id,
          birth_date: form.birth_date,
          height_cm: heightCm,
          weight_kg: weightKg,
          target_weight_kg: targetWeightKg,
          blood_type: form.blood_type,
          toxic_habits: form.toxic_habits,
          current_diagnoses: form.current_diagnoses,
          trusted_doctor_info: form.trusted_doctor_info,
          daily_limitations: form.daily_limitations,
        })
        .eq("id", beneficiary.id);

      if (error) throw error;
      setFeedback({ type: "success", msg: "Ficha A actualizada correctamente." });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Ficha A (Matriz Base)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', margin: 0 }}>
            Configura y actualiza la información esencial de tu familiar. Nuestro equipo en RD usa estos datos.
          </p>
        </div>
        
        {bmi > 0 && (
          <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>IMC Calculado</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{bmi}</span>
              <span style={{ backgroundColor: bmiStatus.bg, color: bmiStatus.color, fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
                {bmiStatus.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div style={{ backgroundColor: feedback.type === 'success' ? 'rgba(21, 128, 61, 0.2)' : 'rgba(159, 18, 57, 0.2)', border: `1px solid ${feedback.type === 'success' ? 'rgba(21, 128, 61, 0.5)' : 'rgba(159, 18, 57, 0.5)'}`, color: feedback.type === 'success' ? '#86efac' : '#fda4af', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Datos Personales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nombre Completo</label>
            <input required type="text" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cédula</label>
            <input type="text" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }} value={form.government_id} onChange={(e) => setForm({ ...form, government_id: e.target.value })} />
          </div>
        </div>

        {/* Antropometría */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>F. Nacimiento</label>
            <input required type="date" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', outline: 'none', colorScheme: 'dark' }} value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Estatura (Ft/In)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input required type="number" min="3" max="8" placeholder="Ft" style={{ width: '50%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', outline: 'none' }} value={imperialData.height_ft} onChange={(e) => setImperialData({ ...imperialData, height_ft: e.target.value })} />
              <input required type="number" min="0" max="11" placeholder="In" style={{ width: '50%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', outline: 'none' }} value={imperialData.height_in} onChange={(e) => setImperialData({ ...imperialData, height_in: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Peso (Lbs)</label>
            <input required type="number" step="0.1" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', outline: 'none' }} value={imperialData.weight_lbs} onChange={(e) => setImperialData({ ...imperialData, weight_lbs: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Peso Meta (Lbs)</label>
            <input type="number" step="0.1" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', outline: 'none' }} value={imperialData.target_weight_lbs} onChange={(e) => setImperialData({ ...imperialData, target_weight_lbs: e.target.value })} />
          </div>
        </div>

        {/* Clínica Básica */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tipo de Sangre</label>
            <select style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', outline: 'none' }} value={form.blood_type} onChange={(e) => setForm({ ...form, blood_type: e.target.value })}>
              <option value="">Desconocido</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Hábitos Tóxicos (Alcohol, Tabaco, etc.)</label>
            <input type="text" placeholder="Ej. Fumador ocasional" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none' }} value={form.toxic_habits} onChange={(e) => setForm({ ...form, toxic_habits: e.target.value })} />
          </div>
        </div>

        {/* Textareas */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Diagnósticos Actuales Confirmados</label>
          <textarea required placeholder="Ej. Hipertensión y Diabetes Tipo II" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none', resize: 'none', height: '60px' }} value={form.current_diagnoses} onChange={(e) => setForm({ ...form, current_diagnoses: e.target.value })} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Médico de Cabecera (Nombre y Contacto)</label>
          <textarea placeholder="Dr. Pérez (Cardiólogo) - 809-555-5555" style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none', resize: 'none', height: '60px' }} value={form.trusted_doctor_info} onChange={(e) => setForm({ ...form, trusted_doctor_info: e.target.value })} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Limitaciones Diarias de Movilidad o Cuidado</label>
          <textarea placeholder="Usa bastón. No puede subir escaleras de forma independiente." style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'white', outline: 'none', resize: 'none', height: '60px' }} value={form.daily_limitations} onChange={(e) => setForm({ ...form, daily_limitations: e.target.value })} />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s' }}
        >
          {loading ? "Guardando Ficha..." : "Guardar Ficha A"}
        </button>
      </form>
    </div>
  );
}
