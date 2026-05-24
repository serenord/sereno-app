"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmisorActionsClient({ emisorId, currentPlan }: { emisorId: string, currentPlan: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [selectedPlanType, setSelectedPlanType] = useState(currentPlan && currentPlan !== 'none' ? currentPlan : "esencial");

  const handleActivatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      // Mapear los valores de la UI a los permitidos por la BD
      let dbPlanTier = "basico";
      if (selectedPlanType === "vital") dbPlanTier = "estandar";
      if (selectedPlanType === "concierge") dbPlanTier = "premium";

      // Intentar actualizar la suscripción existente
      const { data: existingSub, error: checkError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("emisor_id", emisorId)
        .maybeSingle();

      if (checkError) throw checkError;

      let error;
      if (existingSub) {
        // Actualizar
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({ status: "activo", plan_tier: dbPlanTier })
          .eq("emisor_id", emisorId);
        error = updateError;
      } else {
        // Insertar si no tiene
        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert([{ 
            emisor_id: emisorId, 
            status: "activo", 
            plan_tier: dbPlanTier,
            plan_price: selectedPlanType === 'esencial' ? 19.99 : selectedPlanType === 'vital' ? 39.99 : 64.99 
          }]);
        error = insertError;
      }
      
      if (error) throw error;
      setFeedback({ type: "success", msg: "Plan activado correctamente." });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#2563eb", marginBottom: "1rem" }}>
        <Shield size={18} /> Gestión de Suscripción (Admin Override)
      </h3>
      <form onSubmit={handleActivatePlan} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Nivel de Plan Concierge</label>
          <select 
            required 
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", marginTop: "0.5rem" }} 
            value={selectedPlanType} 
            onChange={e => setSelectedPlanType(e.target.value)}
          >
            <option value="esencial">Esencial ($19.99/mo)</option>
            <option value="vital">Vital ($39.99/mo)</option>
            <option value="concierge">Concierge ($64.99/mo)</option>
          </select>
        </div>
        
        <button disabled={loading} type="submit" style={{ background: "#2563eb", color: "white", padding: "0.75rem", borderRadius: "0.5rem", border: "none", fontWeight: "bold", cursor: "pointer" }}>
          Forzar Activación de Plan
        </button>

        {feedback && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2', color: feedback.type === 'success' ? '#15803d' : '#b91c1c', fontSize: '0.85rem' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.msg}
          </div>
        )}
      </form>
    </div>
  );
}
