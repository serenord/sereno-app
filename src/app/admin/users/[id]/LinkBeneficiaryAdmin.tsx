"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LinkBeneficiaryAdmin({ emisorId, unlinkedBeneficiaries }: { emisorId: string, unlinkedBeneficiaries: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiaryId) return;

    setLoading(true);
    setFeedback(null);

    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({ emisor_id: emisorId })
        .eq("id", selectedBeneficiaryId);

      if (error) throw error;
      
      setFeedback({ type: "success", msg: "Paciente vinculado con éxito." });
      setSelectedBeneficiaryId("");
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
        <LinkIcon size={18} color="#3b82f6" /> Vincular Paciente Existente
      </h3>

      {unlinkedBeneficiaries && unlinkedBeneficiaries.length > 0 ? (
        <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: '#475569' }}>Seleccionar Paciente (Sin Emisor)</label>
            <select 
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", marginTop: '0.5rem' }} 
              value={selectedBeneficiaryId} 
              onChange={e => setSelectedBeneficiaryId(e.target.value)}
            >
              <option value="">-- Seleccione un paciente --</option>
              {unlinkedBeneficiaries.map((b) => (
                <option key={b.id} value={b.id}>{b.full_name} (Céd: {b.government_id || 'N/A'})</option>
              ))}
            </select>
          </div>
          <button disabled={loading || !selectedBeneficiaryId} type="submit" style={{ background: "#3b82f6", color: "white", padding: "0.75rem", borderRadius: "0.5rem", border: "none", fontWeight: "bold", cursor: "pointer", opacity: (!selectedBeneficiaryId || loading) ? 0.5 : 1 }}>
            {loading ? "Vinculando..." : "Vincular a este Emisor"}
          </button>
        </form>
      ) : (
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No hay pacientes "huérfanos" (sin emisor) disponibles en el sistema para vincular.</p>
      )}

      {feedback && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2', color: feedback.type === 'success' ? '#15803d' : '#b91c1c', fontSize: '0.85rem' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {feedback.msg}
        </div>
      )}
    </div>
  );
}
