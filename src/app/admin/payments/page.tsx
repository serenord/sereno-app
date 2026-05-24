import { supabaseAdmin } from '@/utils/supabase/admin'
import { ValidatePaymentButton } from './ValidatePaymentButton'
import { CreditCard, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
  // Fetch pending payments joined with the user (emisor)
  const { data: payments, error } = await supabaseAdmin
    .from('payments')
    .select(`
      *,
      users!payments_emisor_id_fkey (
        full_name,
        email,
        phone
      )
    `)
    .eq('status', 'pendiente_validacion')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagos Pendientes</h1>
        <p className="text-gray-500 mt-1">Valida las transferencias manuales para activar las cuentas de los emisores.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {(!payments || payments.length === 0) ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No hay pagos pendientes de validación en este momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Emisor</th>
                  <th className="p-4">Monto & Método</th>
                  <th className="p-4">Referencia / Comprobante</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleDateString('es-DO', { 
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{payment.users?.full_name}</div>
                      <div className="text-xs text-gray-500">{payment.users?.email}</div>
                      <div className="text-xs text-gray-500">{payment.users?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">${payment.amount.toFixed(2)} {payment.currency}</div>
                      <div className="text-xs text-gray-500 capitalize bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-1">
                        {payment.payment_method}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {payment.transaction_reference && (
                          <span className="text-sm text-gray-700 font-mono bg-slate-100 px-2 py-1 rounded border">
                            {payment.transaction_reference}
                          </span>
                        )}
                        {payment.proof_of_payment_url && (
                          <a 
                            href={payment.proof_of_payment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <FileText size={16} className="mr-1" /> Ver Recibo
                          </a>
                        )}
                        {!payment.transaction_reference && !payment.proof_of_payment_url && (
                          <span className="text-sm text-gray-400 italic">Sin comprobante adjunto</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <ValidatePaymentButton paymentId={payment.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
