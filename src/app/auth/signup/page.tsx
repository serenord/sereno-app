"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./signup.module.css";
import { signUpAction } from "@/actions/authActions";
import { ChevronRight, Check } from "lucide-react";

const PLANS = [
  {
    id: "esencial",
    name: "Esencial",
    price: "$29",
    period: "/mes",
    desc: "Seguimiento básico de salud y coordinación de medicamentos.",
    badge: null,
  },
  {
    id: "vital",
    name: "Vital",
    price: "$59",
    period: "/mes",
    desc: "Visitas al hogar, signos vitales mensuales y gestión completa.",
    badge: "Popular",
  },
  {
    id: "concierge",
    name: "Concierge",
    price: "$99",
    period: "/mes",
    desc: "Atención personalizada, médico asignado y soporte 24/7.",
    badge: null,
  },
];

const DIAGNOSES = [
  "Presión alta",
  "Azúcar / Diabetes",
  "Artritis",
  "Problemas renales",
  "Problemas del corazón",
  "Colesterol alto",
  "Asma / EPOC",
];

function SignupContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [step, setStep] = useState(1); // 1=Plan, 2=Emisor, 3=Beneficiario
  const [cooldown, setCooldown] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [selectedPlan, setSelectedPlan] = useState("vital");

  useEffect(() => {
    const urlPlan = searchParams.get("plan");
    if (urlPlan && ["esencial", "vital", "concierge"].includes(urlPlan.toLowerCase())) {
      setSelectedPlan(urlPlan.toLowerCase());
    }
  }, [searchParams]);

  const [emisorData, setEmisorData] = useState({
    email: "", password: "", full_name: "", phone: "", country: "USA",
  });

  const [beneficiaryData, setBeneficiaryData] = useState({
    full_name: "", government_id: "", birth_date: "", gender: "Femenino",
    relationship_to_emisor: "Madre",
    weight_lbs: "", height_ft: "", height_in: "",
    blood_type: "O+", city: "", phone: "",
    selected_diagnoses: [] as string[],
    other_diagnoses: "",
    medications: "",
    allergies: "",
    ars_provider: "",
    ars_card_number: "",
    trusted_doctor_info: "",
    emergency_contact: "",
    daily_limitations: "",
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const toggleDiagnosis = (d: string) => {
    setBeneficiaryData(prev => ({
      ...prev,
      selected_diagnoses: prev.selected_diagnoses.includes(d)
        ? prev.selected_diagnoses.filter(x => x !== d)
        : [...prev.selected_diagnoses, d],
    }));
  };

  const handleGoogleSignup = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);

    const allDiagnoses = [
      ...beneficiaryData.selected_diagnoses,
      beneficiaryData.other_diagnoses,
    ].filter(Boolean).join(", ");

    try {
      const response = await signUpAction(emisorData, {
        ...beneficiaryData,
        current_diagnoses: allDiagnoses,
        plan: selectedPlan,
      });

      if (response.needsEmailVerification) {
        // Try to auto-login anyway
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emisorData.email,
          password: emisorData.password,
        });
        if (!signInError) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/login?message=Verifica tu email antes de iniciar sesión");
        }
      }
    } catch (err: any) {
      if (err.message === "RATE_LIMIT_EXCEEDED") {
        setError("Demasiados intentos. Espera 60 segundos.");
        setCooldown(60);
      } else {
        setError(err.message || "Error en el registro. Verifica tus datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Plan", "Tu Cuenta", "Beneficiario"];

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>SERENO</div>
          <p>Tu portal de gestión de salud familiar</p>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const isDone = step > n;
            const isActive = step === n;
            return (
              <React.Fragment key={n}>
                {i > 0 && <div className={`${styles.stepConnector} ${step > n ? styles.done : ""}`} />}
                <div className={styles.stepItem}>
                  <div className={`${styles.stepCircle} ${isDone ? styles.done : ""} ${isActive ? styles.active : ""}`}>
                    {isDone ? <Check size={14} /> : n}
                  </div>
                  <span className={`${styles.stepLabel} ${isActive ? styles.active : ""}`}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* -------- PASO 1: SELECCIÓN DE PLAN -------- */}
        {step === 1 && (
          <div className={styles.form}>
            <h2>Elige tu Plan</h2>
            <p className="subtitle">Selecciona el plan que mejor se adapta a las necesidades de tu familiar.</p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.planGrid}>
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`${styles.planCard} ${selectedPlan === plan.id ? styles.selected : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className={`${styles.planRadio} ${selectedPlan === plan.id ? styles.selected : ""}`} />
                  <div className={styles.planInfo}>
                    <div className={styles.planName}>
                      {plan.name}
                      {plan.badge && <span className={styles.planBadge} style={{ marginLeft: 8 }}>{plan.badge}</span>}
                    </div>
                    <div className={styles.planDesc}>{plan.desc}</div>
                  </div>
                  <div>
                    <div className={styles.planPrice}>{plan.price}</div>
                    <span className={styles.planPriceSub}>{plan.period}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => setStep(2)}
            >
              Continuar <ChevronRight size={18} />
            </button>

            <div className={styles.forgotPassword}>
              <a href="/login">¿Ya tienes cuenta? <span style={{ color: "#0E2A47", fontWeight: 600 }}>Inicia sesión</span></a>
            </div>
          </div>
        )}

        {/* -------- PASO 2: DATOS DEL EMISOR -------- */}
        {step === 2 && (
          <form className={styles.form} onSubmit={e => { e.preventDefault(); setStep(3); }}>
            <h2>Tu Cuenta</h2>
            <p className="subtitle">Datos del gestor (tú, en el exterior).</p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="full_name">Nombre completo</label>
              <input
                id="full_name" type="text" placeholder="Ej. Juan Pérez"
                value={emisorData.full_name}
                onChange={e => setEmisorData({ ...emisorData, full_name: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email" type="email" placeholder="tu@correo.com"
                value={emisorData.email}
                onChange={e => setEmisorData({ ...emisorData, email: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password" type="password" placeholder="Mínimo 6 caracteres" minLength={6}
                value={emisorData.password}
                onChange={e => setEmisorData({ ...emisorData, password: e.target.value })}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="phone">Teléfono (WhatsApp)</label>
                <input
                  id="phone" type="tel" placeholder="+1 (555) 000-0000"
                  value={emisorData.phone}
                  onChange={e => setEmisorData({ ...emisorData, phone: e.target.value })}
                  required
                />
              </div>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="country">País de residencia</label>
                <select id="country" value={emisorData.country} onChange={e => setEmisorData({ ...emisorData, country: e.target.value })}>
                  <option value="USA">Estados Unidos</option>
                  <option value="ESP">España</option>
                  <option value="CAN">Canadá</option>
                  <option value="ITA">Italia</option>
                  <option value="OTR">Otro</option>
                </select>
              </div>
            </div>

            <div className={styles.divider}>o</div>

            <button type="button" className={styles.googleBtn} onClick={handleGoogleSignup} disabled={loading || cooldown > 0}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {cooldown > 0 ? `Espera ${cooldown}s` : "Registrarse con Google"}
            </button>

            <div className={styles.row}>
              <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>← Atrás</button>
              <button type="submit" className={styles.submitBtn} style={{ flex: 2 }}>
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* -------- PASO 3: FICHA DEL BENEFICIARIO -------- */}
        {step === 3 && (
          <form className={styles.form} onSubmit={handleFinalSubmit} style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
            <h2>Datos del Familiar</h2>
            <p className="subtitle">Información de la persona en República Dominicana.</p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="ben_name">Nombre completo del paciente</label>
              <input
                id="ben_name" type="text" placeholder="Ej. María Gómez"
                value={beneficiaryData.full_name}
                onChange={e => setBeneficiaryData({ ...beneficiaryData, full_name: e.target.value })}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="birth_date">Fecha de Nacimiento</label>
                <input
                  id="birth_date" type="date"
                  value={beneficiaryData.birth_date}
                  onChange={e => setBeneficiaryData({ ...beneficiaryData, birth_date: e.target.value })}
                  required
                />
              </div>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="gender">Sexo</label>
                <select id="gender" value={beneficiaryData.gender} onChange={e => setBeneficiaryData({ ...beneficiaryData, gender: e.target.value })}>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="gov_id">Cédula de Identidad (Opcional)</label>
                <input
                  id="gov_id" type="text" placeholder="Ej. 000-0000000-0"
                  value={beneficiaryData.government_id}
                  onChange={e => setBeneficiaryData({ ...beneficiaryData, government_id: e.target.value })}
                />
              </div>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="city">Ciudad en RD</label>
                <input
                  id="city" type="text" placeholder="Ej. Santo Domingo"
                  value={beneficiaryData.city}
                  onChange={e => setBeneficiaryData({ ...beneficiaryData, city: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.col}`}>
                <label>Parentesco (Obligatorio)</label>
                <select value={beneficiaryData.relationship_to_emisor} onChange={e => setBeneficiaryData({ ...beneficiaryData, relationship_to_emisor: e.target.value })}>
                  <option value="Madre">Madre</option>
                  <option value="Padre">Padre</option>
                  <option value="Abuelo(a)">Abuelo(a)</option>
                  <option value="Hijo(a)">Hijo(a)</option>
                  <option value="Cónyuge">Cónyuge</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="ben_phone">Teléfono del paciente</label>
                <input
                  id="ben_phone" type="tel" placeholder="809-555-0000"
                  value={beneficiaryData.phone}
                  onChange={e => setBeneficiaryData({ ...beneficiaryData, phone: e.target.value })}
                  required
                />
              </div>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="blood_type">Tipo de Sangre</label>
                <select id="blood_type" value={beneficiaryData.blood_type} onChange={e => setBeneficiaryData({ ...beneficiaryData, blood_type: e.target.value })}>
                  {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="weight">Peso (lbs)</label>
                <input
                  id="weight" type="number" step="0.1" placeholder="Ej. 150"
                  value={beneficiaryData.weight_lbs}
                  onChange={e => setBeneficiaryData({ ...beneficiaryData, weight_lbs: e.target.value })}
                />
              </div>
              <div className={`${styles.field} ${styles.col}`}>
                <label>Estatura</label>
                <div className={styles.row}>
                  <input type="number" min="3" max="8" placeholder="Pies"
                    value={beneficiaryData.height_ft}
                    onChange={e => setBeneficiaryData({ ...beneficiaryData, height_ft: e.target.value })}
                  />
                  <input type="number" min="0" max="11" placeholder="Pulg."
                    value={beneficiaryData.height_in}
                    onChange={e => setBeneficiaryData({ ...beneficiaryData, height_in: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Diagnósticos */}
            <div className={styles.field}>
              <label>¿Cuáles enfermedades le diagnosticó su médico? (Selecciona las que apliquen)</label>
              <div className={styles.checkGroup}>
                {DIAGNOSES.map(d => (
                  <label
                    key={d}
                    className={`${styles.checkItem} ${beneficiaryData.selected_diagnoses.includes(d) ? styles.checked : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={beneficiaryData.selected_diagnoses.includes(d)}
                      onChange={() => toggleDiagnosis(d)}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="other_diagnoses">Otros diagnósticos (opcional)</label>
              <input
                id="other_diagnoses" type="text" placeholder="Ej. Hipotiroidismo"
                value={beneficiaryData.other_diagnoses}
                onChange={e => setBeneficiaryData({ ...beneficiaryData, other_diagnoses: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="medications">¿Cuáles medicamentos toma todos los días y a qué hora?</label>
              <textarea
                id="medications"
                placeholder="Ej. Losartán 50mg en la mañana, Metformina con la cena"
                value={beneficiaryData.medications}
                onChange={e => setBeneficiaryData({ ...beneficiaryData, medications: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="allergies">¿Tiene alergia comprobada a algún medicamento o alimento?</label>
              <input
                id="allergies" type="text" placeholder="Ej. Penicilina, mariscos. O 'Ninguna conocida'."
                value={beneficiaryData.allergies}
                onChange={e => setBeneficiaryData({ ...beneficiaryData, allergies: e.target.value })}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="ars">Seguro Médico (ARS)</label>
                <input
                  id="ars" type="text" placeholder="Ej. ARS Humano"
                  value={beneficiaryData.ars_provider}
                  onChange={e => setBeneficiaryData({ ...beneficiaryData, ars_provider: e.target.value })}
                  required
                />
              </div>
              <div className={`${styles.field} ${styles.col}`}>
                <label htmlFor="ars_number">Número de Carnet ARS</label>
                <input
                  id="ars_number" type="text" placeholder="Ej. 123456789"
                  value={beneficiaryData.ars_card_number}
                  onChange={e => setBeneficiaryData({ ...beneficiaryData, ars_card_number: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="trusted_doctor">¿Quién es su médico o clínica de confianza en RD en caso de emergencia?</label>
              <input
                id="trusted_doctor" type="text" placeholder="Ej. Dr. Pérez en Clínica Abreu, Santiago"
                value={beneficiaryData.trusted_doctor_info}
                onChange={e => setBeneficiaryData({ ...beneficiaryData, trusted_doctor_info: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="emergency_contact">Contacto de emergencia en RD (nombre y teléfono)</label>
              <input
                id="emergency_contact" type="text" placeholder="Ej. Ana Gómez — 829-555-0001"
                value={beneficiaryData.emergency_contact}
                onChange={e => setBeneficiaryData({ ...beneficiaryData, emergency_contact: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="limitations">¿Qué es lo que más le cuesta hacer solo en su rutina diaria?</label>
              <input
                id="limitations" type="text" placeholder="Ej. Pararse de la cama, recordar las pastillas, cocinar"
                value={beneficiaryData.daily_limitations}
                onChange={e => setBeneficiaryData({ ...beneficiaryData, daily_limitations: e.target.value })}
                required
              />
            </div>

            <div className={styles.row}>
              <button type="button" className={styles.backBtn} onClick={() => setStep(2)} disabled={loading}>← Atrás</button>
              <button type="submit" className={styles.submitBtn} style={{ flex: 2 }} disabled={loading || cooldown > 0}>
                {loading ? "Registrando..." : cooldown > 0 ? `Espera ${cooldown}s` : "Crear Cuenta"}
              </button>
            </div>
          </form>
        )}

        <div className={styles.footer}>
          <p>¿Necesitas ayuda? <a href="https://wa.me/18292847990" target="_blank" rel="noopener noreferrer">Contáctanos por WhatsApp</a></p>
        </div>
      </div>

      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <h1>La tranquilidad no tiene fronteras</h1>
          <p>Gestiona la salud de tu familia en República Dominicana desde cualquier parte del mundo.</p>
          <ul className={styles.brandFeatures}>
            <li>✅ Reporte verificable en menos de 24h</li>
            <li>✅ Foto de evidencia de cada entrega</li>
            <li>✅ Factura de costo real, siempre</li>
            <li>✅ Coordinación con farmacias y médicos</li>
            <li>✅ Planes desde $29/mes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#10b981' }}>Cargando formulario...</div>}>
      <SignupContent />
    </Suspense>
  );
}
