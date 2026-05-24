'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import styles from './HealthCharts.module.css';

const MOCK_HISTORY = [
  { time: '08:00', systolic: 120, diastolic: 80, oxygen: 98 },
  { time: '10:00', systolic: 125, diastolic: 82, oxygen: 97 },
  { time: '12:00', systolic: 118, diastolic: 79, oxygen: 99 },
  { time: '14:00', systolic: 122, diastolic: 81, oxygen: 98 },
  { time: '16:00', systolic: 130, diastolic: 85, oxygen: 96 },
  { time: '18:00', systolic: 124, diastolic: 82, oxygen: 98 },
  { time: '20:00', systolic: 121, diastolic: 80, oxygen: 99 },
];

export const HealthCharts = ({ liveData }: { liveData: any[] }) => {
  const chartData = [...MOCK_HISTORY, ...liveData].slice(-10);

  return (
    <div className={styles.container}>
      <div className={`glass-card ${styles.chartBox}`}>
        <div className={styles.chartHeader}>
          <h3>Tendencia de Presión Arterial</h3>
          <div className={styles.legend}>
            <span className={styles.systolic}>Sistólica</span>
            <span className={styles.diastolic}>Diastólica</span>
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                domain={[60, 160]}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="systolic" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSys)" 
              />
              <Area 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={0} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`glass-card ${styles.chartBox}`}>
        <div className={styles.chartHeader}>
          <h3>Saturación de Oxígeno (SpO2)</h3>
          <span className={styles.unit}>%</span>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                domain={[90, 100]}
              />
              <Tooltip />
              <Line 
                type="stepAfter" 
                dataKey="oxygen" 
                stroke="#ef4444" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
