'use client'

import { useTransition } from 'react'
import { validateManualPayment } from '@/app/admin/actions'
import { CheckCircle2, Loader2 } from 'lucide-react'

export function ValidatePaymentButton({ paymentId }: { paymentId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleValidate = () => {
    if (confirm("¿Estás seguro de que deseas validar este pago? Esto activará la suscripción del emisor.")) {
      startTransition(async () => {
        try {
          // As required by the prompt, passing adminId and notes. For now, empty or generic.
          await validateManualPayment(paymentId, "", "Validado manualmente desde UI");
          alert("¡Pago validado y cuenta activada exitosamente!")
        } catch (error: any) {
          alert("Error: " + error.message)
        }
      })
    }
  }

  return (
    <button
      onClick={handleValidate}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <CheckCircle2 size={16} />
      )}
      {isPending ? 'Validando...' : 'Validar Pago'}
    </button>
  )
}
