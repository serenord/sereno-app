export type MeasurementType = 
  | 'blood_pressure' 
  | 'blood_glucose' 
  | 'heart_rate' 
  | 'oxygen_saturation';

export type VitalSignSource = 
  | 'manual_admin' 
  | 'manual_beneficiary' 
  | 'iot_device' 
  | 'medical_professional';

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
  unit: 'mmHg';
}

export interface BloodGlucoseValue {
  value: number;
  unit: 'mg/dL';
  fasting: boolean;
}

export interface HeartRateValue {
  bpm: number;
}

export interface OxygenSaturationValue {
  percentage: number;
}

export type VitalSignValue = 
  | BloodPressureValue 
  | BloodGlucoseValue 
  | HeartRateValue 
  | OxygenSaturationValue;

export interface VitalSign {
  id: string;
  beneficiary_id: string;
  measurement_type: MeasurementType;
  value: VitalSignValue;
  measured_at: string;
  notes?: string;
  source: VitalSignSource;
  recorded_by_user_id?: string;
  is_alert: boolean;
  alert_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface LatestVitalSign {
  id: string;
  beneficiary_id: string;
  measurement_type: MeasurementType;
  value: VitalSignValue;
  measured_at: string;
  notes?: string;
  source: VitalSignSource;
  is_alert: boolean;
  alert_reason?: string;
}
