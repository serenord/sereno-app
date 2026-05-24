'use client'

import React from 'react'
import { Printer } from 'lucide-react'
import styles from './Dashboard.module.css'

export default function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <button onClick={handlePrint} className={styles.printButton}>
      <Printer size={16} />
      Exportar a PDF
    </button>
  )
}
