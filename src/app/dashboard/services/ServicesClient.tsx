"use client";

import React, { useState } from "react";
import { PlusCircle, ShieldAlert, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { manageServiceAction } from "@/app/actions/services";
import { requestServiceAction } from "@/actions/serviceActions";

const C = {
  bg: '#020617', surface: '#0f172a', border: '#1e293b', muted: '#334155',
  gray: '#94a3b8', text: '#f1f5f9', white: '#ffffff',
  green: '#10b981', greenDim: 'rgba(16,185,129,0.12)', greenBorder: 'rgba(16,185,129,0.25)',
  blue: '#38bdf8', blueDim: 'rgba(56,189,248,0.1)',
  amber: '#f59e0b', amberDim: 'rgba(245,158,11,0.12)',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.1)', redBorder: 'rgba(239,68,68,0.3)',
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  activo:    { bg: C.greenDim, color: C.green, label: 'Activo' },
  suspendido:{ bg: C.amberDim, color: C.amber, label: 'Suspendido' },
  eliminado: { bg: C.redDim,   color: C.red,   label: 'Eliminado' },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  medicamento: 'Medicamento',
  insumo:      'Insumo Médico',
  cita:        'Coordinación de Cita',
  estudio:     'Estudio de Laboratorio',
  consulta_virtual: 'Consulta Virtual',
};

function Badge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.activo;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}40`,
      borderRadius: '99px', padding: '0.2rem 0.7rem',
      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {s.label}
    </span>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 50, padding: '1rem',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}

function inputStyle(focused = false): React.CSSProperties {
  return {
    width: '100%', padding: '0.75rem 1rem', background: C.bg,
    border: `1.5px solid ${focused ? C.blue : C.border}`,
    borderRadius: '0.5rem', color: C.text, fontSize: '0.9rem',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  };
}

export default function ServicesClient({
  services, beneficiaries, emisorId,
}: { services: any[]; beneficiaries: any[]; emisorId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [penaltyModal, setPenaltyModal] = useState<{ serviceId: string; action: "suspendido" | "eliminado" } | null>(null);
  const [form, setForm] = useState({
    beneficiary_id: beneficiaries[0]?.id || "",
    service_type: "medicamento",
    service_name: "",
    scheduled_for: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestServiceAction({
        beneficiaryId: form.beneficiary_id,
        serviceType: form.service_type,
        scheduledDate: form.scheduled_for || new Date().toISOString(),
        notes: form.service_name,
      });
      if (res.success) {
        window.open(res.whatsappUrl, "_blank");
        setIsModalOpen(false);
        setForm({ ...form, service_name: "", scheduled_for: "" });
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || "Hubo un error al crear el servicio.");
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (serviceId: string, action: "suspendido" | "eliminado") => {
    setLoading(true);
    const res = await manageServiceAction(serviceId, action);
    if (res.success) {
      setPenaltyModal(null);
      window.location.reload();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleActionRequest = (service: any, action: "suspendido" | "eliminado") => {
    const scheduledDate = new Date(service.scheduled_for || service.created_at);
    const diffHours = (scheduledDate.getTime() - Date.now()) / 3_600_000;
    if (diffHours < 48) {
      setPenaltyModal({ serviceId: service.id, action });
    } else {
      if (confirm(`¿Estás seguro de marcar este servicio como "${action}"?`)) {
        executeAction(service.id, action);
      }
    }
  };

  const active  = services.filter(s => s.status === 'activo');
  const history = services.filter(s => s.status !== 'activo');

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', borderBottom: `1px solid ${C.border}`, paddingBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: C.amber, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Logística y Cuidado</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.white, margin: '0.25rem 0 0' }}>Mis Servicios</h1>
            <p style={{ color: C.gray, fontSize: '0.875rem', marginTop: '0.25rem' }}>Gestiona medicamentos, insumos y citas médicas de tu familiar.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: C.green, color: C.bg,
              border: 'none', borderRadius: '0.6rem', padding: '0.65rem 1.25rem',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            <PlusCircle size={18} /> Nuevo Servicio
          </button>
        </div>

        {/* Active services */}
        <div>
          <h3 style={{ color: C.gray, fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            Servicios Activos ({active.length})
          </h3>
          {active.length === 0 ? (
            <div style={{ border: `1px dashed ${C.border}`, borderRadius: '0.75rem', padding: '3rem', textAlign: 'center', color: C.gray, fontSize: '0.9rem' }}>
              No tienes servicios activos en este momento.<br />
              <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>Haz clic en &quot;Nuevo Servicio&quot; para solicitar uno.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {active.map(s => (
                <div key={s.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge status={s.status} />
                    <span style={{ fontSize: '0.72rem', color: C.gray }}>{new Date(s.created_at).toLocaleDateString('es-DO')}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.white, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.service_name || s.notes}</div>
                    <div style={{ fontSize: '0.78rem', color: C.gray }}>{SERVICE_TYPE_LABELS[s.service_type] || s.service_type}</div>
                  </div>
                  {s.scheduled_for && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.4rem', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: C.gray }}>
                      <Clock size={12} /> Programado: {new Date(s.scheduled_for).toLocaleDateString('es-DO')}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem' }}>
                    <button
                      onClick={() => handleActionRequest(s, 'suspendido')}
                      style={{ flex: 1, background: C.muted, border: 'none', borderRadius: '0.4rem', padding: '0.5rem', color: C.gray, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                      Suspender
                    </button>
                    <button
                      onClick={() => handleActionRequest(s, 'eliminado')}
                      style={{ flex: 1, background: C.redDim, border: `1px solid ${C.redBorder}`, borderRadius: '0.4rem', padding: '0.5rem', color: C.red, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h3 style={{ color: C.gray, fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Historial de Servicios ({history.length})
            </h3>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
              {history.map((s, i) => (
                <div key={s.id} style={{
                  padding: '1rem 1.25rem',
                  borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : 'none',
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge status={s.status} />
                    <div>
                      <div style={{ fontWeight: 600, color: C.white, fontSize: '0.875rem' }}>{s.service_name || s.notes}</div>
                      <div style={{ fontSize: '0.75rem', color: C.gray }}>{SERVICE_TYPE_LABELS[s.service_type] || s.service_type} · {new Date(s.created_at).toLocaleDateString('es-DO')}</div>
                    </div>
                  </div>
                  {s.penalty_applied && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: C.redDim, border: `1px solid ${C.redBorder}`, borderRadius: '0.4rem', padding: '0.3rem 0.7rem', fontSize: '0.72rem', color: C.red, fontWeight: 700 }}>
                      <ShieldAlert size={12} /> Penalidad Aplicada ($5 USD)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- MODAL: Nuevo Servicio ---- */}
      {isModalOpen && (
        <ModalOverlay onClose={() => setIsModalOpen(false)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1rem', maxWidth: 480, width: '100%', padding: '1.75rem', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: C.gray, cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ color: C.white, fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.25rem' }}>Solicitar Nuevo Servicio</h2>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: C.gray, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Beneficiario (Paciente)</label>
                <select required style={inputStyle()} value={form.beneficiary_id} onChange={e => setForm({ ...form, beneficiary_id: e.target.value })}>
                  {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.full_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: C.gray, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Tipo de Servicio</label>
                <select required style={inputStyle()} value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}>
                  <option value="medicamento">Medicamentos</option>
                  <option value="insumo">Insumos Médicos</option>
                  <option value="cita">Coordinación de Cita</option>
                  <option value="estudio">Estudio de Laboratorio</option>
                  <option value="consulta_virtual">Consulta Virtual</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: C.gray, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Descripción de la Solicitud</label>
                <textarea
                  required
                  placeholder="Ej: Caja de Losartán 50mg"
                  style={{ ...inputStyle(), resize: 'vertical', minHeight: '80px' }}
                  value={form.service_name}
                  onChange={e => setForm({ ...form, service_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: C.gray, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Fecha Programada (Opcional)</label>
                <input type="date" style={inputStyle()} value={form.scheduled_for} onChange={e => setForm({ ...form, scheduled_for: e.target.value })} />
              </div>
              <div style={{ background: C.blueDim, border: `1px solid ${C.blue}30`, borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.8rem', color: C.blue, lineHeight: 1.6 }}>
                Al confirmar, se abrirá WhatsApp con el detalle pre-llenado para coordinar con el equipo SERENO en RD.
              </div>
              <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: C.green, color: C.bg, border: 'none', borderRadius: '0.6rem', padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Procesando...' : <><CheckCircle size={18} /> Confirmar Solicitud</>}
              </button>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ---- MODAL: Penalidad 48h ---- */}
      {penaltyModal && (
        <ModalOverlay onClose={() => setPenaltyModal(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.red}50`, borderRadius: '1rem', maxWidth: 400, width: '100%', padding: '2rem', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <AlertTriangle size={48} color={C.red} style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h2 style={{ color: C.white, fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>Advertencia de Penalidad</h2>
            <p style={{ color: C.gray, fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Estás intentando modificar un servicio con <strong style={{ color: C.red }}>menos de 48 horas</strong> de anticipación a su fecha programada.<br /><br />
              Esta acción tiene una <strong style={{ color: C.amber }}>penalidad logística de $5.00 USD</strong> que se reflejará en tu próxima factura.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setPenaltyModal(null)}
                disabled={loading}
                style={{ flex: 1, background: C.muted, border: 'none', borderRadius: '0.6rem', padding: '0.75rem', color: C.text, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => executeAction(penaltyModal.serviceId, penaltyModal.action)}
                disabled={loading}
                style={{ flex: 1, background: C.red, border: 'none', borderRadius: '0.6rem', padding: '0.75rem', color: C.white, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Procesando...' : 'Aceptar Cargo'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
