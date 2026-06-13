/**
 * PaymentRecovery — mounts once inside BrowserRouter.
 *
 * On every page load it checks localStorage for an incomplete payment
 * (saved the instant Razorpay's handler fires, before the verify call).
 * If found it retries the verify API up to 3 times, then shows a banner:
 *
 *   ✅ Recovered → green bar + "View Order" button
 *   ❌ Still failing → amber bar with Payment ID + support email
 *
 * The banner is dismissed by clicking ✕ or (for success) automatically
 * cleared from localStorage when the user visits /order-placed.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react'
import { getPendingPayment, clearPendingPayment } from '../utils/paymentRecovery'
import { paymentsService } from '../services/firebaseService'

export default function PaymentRecovery() {
  const location = useLocation()
  const navigate = useNavigate()
  // null | 'recovering' | { type:'success', orderId } | { type:'failed', paymentId }
  const [state, setState] = useState(null)

  // Clear localStorage when the customer lands on the success page
  // (e.g. after a successful recovery navigates them there)
  useEffect(() => {
    if (location.pathname.startsWith('/order-placed')) {
      clearPendingPayment()
    }
  }, [location.pathname])

  // On first mount, check for a pending payment and try to recover it
  useEffect(() => {
    // Don't run on /order-placed — the payment was already handled
    if (location.pathname.startsWith('/order-placed')) return

    const pending = getPendingPayment()
    if (!pending) return

    let cancelled = false
    setState('recovering')

    const tryRecover = async () => {
      const MAX_ATTEMPTS = 3
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (cancelled) return
        if (attempt > 0) await new Promise((r) => setTimeout(r, 2000 * attempt))
        try {
          const result = await paymentsService.verifyRazorpayPayment(pending)
          if (cancelled) return
          clearPendingPayment()
          setState({ type: 'success', orderId: result.orderId })
          return
        } catch (err) {
          console.warn(`PaymentRecovery attempt ${attempt + 1}/${MAX_ATTEMPTS}:`, err?.message)
        }
      }
      if (!cancelled) {
        setState({ type: 'failed', paymentId: pending.razorpay_payment_id })
      }
    }

    void tryRecover()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  const dismiss = () => {
    clearPendingPayment()
    setState(null)
  }

  if (!state) return null

  // ── Recovering ────────────────────────────────────────────────────────────
  if (state === 'recovering') {
    return (
      <div className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-2 bg-brand-navy px-4 py-2.5 text-sm text-white shadow-lg">
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        Recovering your previous payment — please wait…
      </div>
    )
  }

  // ── Recovered successfully ────────────────────────────────────────────────
  if (state.type === 'success') {
    return (
      <div className="fixed inset-x-0 top-0 z-[200] flex items-center justify-between gap-3 bg-green-600 px-4 py-2.5 text-sm text-white shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Your order was recovered and confirmed successfully!</span>
        </div>
        <button
          onClick={() => navigate(`/order-placed/${state.orderId}`)}
          className="shrink-0 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30"
        >
          View Order
        </button>
      </div>
    )
  }

  // ── Recovery failed — show support message with payment ID ────────────────
  if (state.type === 'failed') {
    return (
      <div className="fixed inset-x-0 top-0 z-[200] flex items-start justify-between gap-3 bg-amber-600 px-4 py-3 text-sm text-white shadow-lg">
        <div className="flex min-w-0 items-start gap-2 leading-relaxed">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            We detected an incomplete payment (ID:{' '}
            <span className="font-mono font-bold">{state.paymentId}</span>
            ). Please{' '}
            <a
              href="mailto:karthikeyananalysisstudycircle@gmail.com"
              className="font-bold underline"
            >
              email us
            </a>{' '}
            with this Payment ID — we will confirm your order within 24 hours.
          </span>
        </div>
        <button
          onClick={dismiss}
          className="mt-0.5 shrink-0 rounded-lg p-1 hover:bg-white/20"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return null
}
