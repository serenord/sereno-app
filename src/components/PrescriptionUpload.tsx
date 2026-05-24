import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import styles from './PrescriptionUpload.module.css';

export const PrescriptionUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const processOCR = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(preview, 'spa');
      
      // Simulated data extraction from text
      const extractedData = {
        medication: text.includes('Lantus') ? 'Insulina Lantus' : 'Medicamento detectado',
        dosage: '1 vial cada 24h',
        patient: 'María Pérez',
        doctor: 'Dr. Santos',
        confidence: 0.92
      };
      
      setResult(extractedData);
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [result] }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment Error:', error);
    }
  };

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <FileText className={styles.icon} />
        <h3>Sube tu Receta Médica</h3>
        <p>Procesaremos la imagen para identificar los medicamentos automáticamente.</p>
      </div>

      {!file ? (
        <label className={styles.dropzone}>
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
          <Upload size={40} />
          <span>Haz clic o arrastra una foto de la receta</span>
          <small>Formatos: JPG, PNG. Máx 5MB</small>
        </label>
      ) : (
        <div className={styles.previewSection}>
          <div className={styles.previewImage}>
            <img src={preview!} alt="Receta" />
            <button className={styles.remove} onClick={() => setFile(null)}>
              <X size={16} />
            </button>
          </div>
          
          <div className={styles.actions}>
            {!result && !loading && (
              <button className="btn-primary" onClick={processOCR}>
                Procesar Receta
              </button>
            )}
            
            {loading && (
              <div className={styles.loader}>
                <Loader2 className={styles.spin} />
                <span>Analizando con OCR...</span>
              </div>
            )}
            
            {result && (
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <CheckCircle size={20} color="#10b981" />
                  <strong>Datos Extraídos</strong>
                </div>
                <div className={styles.resultBody}>
                  <div className={styles.dataField}>
                    <span>Medicamento:</span>
                    <strong>{result.medication}</strong>
                  </div>
                  <div className={styles.dataField}>
                    <span>Paciente:</span>
                    <strong>{result.patient}</strong>
                  </div>
                </div>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={handlePayment}>
                  Confirmar y Pagar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
