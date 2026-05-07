import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useMemo, useState } from 'react'
import { paymentsService } from '../../services/firebaseService'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, subtotal, updateQty, clearCart } = useCart()
  const [step, setStep] = useState('cart') // cart | checkout | success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' })

  const amount = useMemo(() => Number(subtotal || 0), [subtotal])

  async function loadRazorpayScript() {
    if (window.Razorpay) return true
    return await new Promise((resolve) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })
  }

  const onClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep('cart')
      setError('')
      setLoading(false)
    }, 150)
  }

  const canCheckout = items.length > 0 && amount > 0

  const openPayment = async () => {
    setError('')
    setLoading(true)

    try {
      const ok = await loadRazorpayScript()
      if (!ok) throw new Error('Failed to load payment gateway. Please try again.')

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID
      if (!keyId) throw new Error('Payment is not configured (missing key).')

      const orderRes = await paymentsService.createRazorpayOrder({
        amount,
        currency: 'INR',
      })

      const options = {
        key: orderRes.keyId || keyId,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: 'Karthikeyan Analysis',
        description: 'Book Store Order',
        order_id: orderRes.order.id,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        notes: {
          address: customer.address,
        },
        handler: async (response) => {
          try {
            setLoading(true)
            await paymentsService.verifyRazorpayPayment({
              ...response,
              customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
              },
              address: customer.address,
              cart: items.map((i) => ({ name: i.name, quantity: i.qty, price: i.price })),
              total: amount,
            })
            clearCart()
            setStep('success')
          } catch (e) {
            setError(e?.message || 'Payment verification failed. Please contact support.')
            setStep('checkout')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        theme: {
          color: '#10197E',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      setError(e?.message || 'Payment failed to start. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[95]">
      <DialogBackdrop transition={false} className="fixed inset-0 z-[94] bg-brand-black/60 backdrop-blur-[1px]" />
      <DialogPanel transition={false} className="fixed right-0 top-0 z-[95] flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white p-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-[max(env(safe-area-inset-top),1.25rem)] shadow-2xl outline-none sm:p-6">
        <div className="flex shrink-0 items-center justify-between border-b border-black/10 pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 font-bold text-xl text-brand-navy sm:text-2xl">
            <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden /> Your Cart
          </DialogTitle>
          <button type="button" onClick={onClose} className="inline-flex size-11 touch-manipulation items-center justify-center rounded-xl hover:bg-black/[0.05]" aria-label="Close cart">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {step === 'cart' ? (
            <div className="mt-4 space-y-3 sm:mt-5">
              {items.length === 0 ? (
                <p className="rounded-xl bg-black/[0.02] p-4 text-sm text-brand-black/70">Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <article key={item.id} className="rounded-xl border border-black/10 p-4">
                    <p className="text-sm font-semibold text-brand-navy">{item.name}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-brand-black/70">Rs. {item.price} x {item.qty}</p>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(item.id, -1)} className="inline-flex min-h-9 min-w-9 touch-manipulation items-center justify-center rounded-md border border-black/15 hover:bg-black/[0.03]" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                        <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, 1)} className="inline-flex min-h-9 min-w-9 touch-manipulation items-center justify-center rounded-md border border-black/15 hover:bg-black/[0.03]" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : step === 'checkout' ? (
            <div className="mt-4 space-y-4">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
              ) : null}

              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-black/70">Full name</label>
                <input value={customer.name} onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-black/70">Email</label>
                <input type="email" value={customer.email} onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-black/70">Phone</label>
                <input value={customer.phone} onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-black/70">Delivery address</label>
                <textarea rows={3} value={customer.address} onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-green-50 p-5 ring-1 ring-green-200">
              <p className="text-base font-bold text-green-800">Payment successful.</p>
              <p className="mt-1 text-sm text-green-700">Order confirmation has been sent to your email.</p>
            </div>
          )}
        </div>

        <div className="mt-4 shrink-0 rounded-xl bg-black/[0.02] p-4 pt-3 sm:mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-black/70">Subtotal</span>
            <span className="font-semibold text-brand-navy">Rs. {subtotal}</span>
          </div>
          {step === 'cart' ? (
            <button
              type="button"
              disabled={!canCheckout}
              onClick={() => setStep('checkout')}
              className="mt-3 flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-bold text-white hover:bg-brand-navy-light disabled:opacity-50 sm:mt-4"
            >
              Proceed to Checkout
            </button>
          ) : step === 'checkout' ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
              <button type="button" onClick={() => setStep('cart')} className="flex min-h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-brand-navy hover:bg-black/[0.03]">
                Back
              </button>
              <button
                type="button"
                disabled={loading || !canCheckout || !customer.name || !customer.email || !customer.phone}
                onClick={openPayment}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-bold text-white hover:bg-brand-navy-light disabled:opacity-50"
              >
                {loading ? 'Starting…' : `Pay Rs. ${subtotal}`}
              </button>
            </div>
          ) : (
            <button type="button" onClick={onClose} className="mt-3 flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-bold text-white hover:bg-brand-navy-light sm:mt-4">
              Close
            </button>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  )
}
