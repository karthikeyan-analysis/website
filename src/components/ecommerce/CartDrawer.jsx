import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersService, paymentsService } from '../../services/firebaseService'

function formatMoney(value) {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, subtotal, updateQty, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState('cart') // cart | checkout | success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    addressLine1: '',
    addressLine2: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  })

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

  const formatAddressForStorage = () => {
    const parts = [
      customer.addressLine1,
      customer.addressLine2,
      customer.area,
      customer.city,
      customer.state,
      customer.pincode ? `Pincode: ${customer.pincode}` : '',
      customer.landmark ? `Landmark: ${customer.landmark}` : '',
      customer.altPhone ? `Alt phone: ${customer.altPhone}` : '',
    ]
      .map((s) => String(s || '').trim())
      .filter(Boolean)
    return parts.join(', ')
  }

  const validateCheckout = () => {
    if (!customer.name.trim()) return 'Full name is required.'
    if (!customer.email.trim()) return 'Email is required.'
    if (!customer.phone.trim()) return 'Phone number is required.'
    if (!customer.addressLine1.trim()) return 'Address line 1 is required.'
    if (!customer.area.trim()) return 'Area / Locality is required.'
    if (!customer.city.trim()) return 'City is required.'
    if (!customer.state.trim()) return 'State is required.'
    if (!customer.pincode.trim()) return 'Pincode is required.'
    return ''
  }

  const openPayment = async () => {
    setError('')
    setLoading(true)

    try {
      const validationError = validateCheckout()
      if (validationError) throw new Error(validationError)

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
          address: formatAddressForStorage(),
        },
        handler: async (response) => {
          try {
            setLoading(true)

            const orderId = `KA-${Date.now()}`
            const orderRecord = await ordersService.createOrder({
              id: orderId,
              provider: 'razorpay',
              razorpay_order_id: response?.razorpay_order_id || orderRes?.order?.id || '',
              razorpay_payment_id: response?.razorpay_payment_id || '',
              razorpay_signature: response?.razorpay_signature || '',
              customerName: customer.name.trim(),
              customerEmail: customer.email.trim().toLowerCase(),
              customerPhone: customer.phone.trim(),
              customerAltPhone: customer.altPhone.trim(),
              items: items.map((i) => ({
                id: i.id,
                name: i.name,
                image: i.image || '',
                qty: Number(i.qty || 0),
                price: Number(i.price || 0),
              })),
              total: Number(amount),
              address: formatAddressForStorage(),
              shippingAddress: {
                addressLine1: customer.addressLine1.trim(),
                addressLine2: customer.addressLine2.trim(),
                area: customer.area.trim(),
                city: customer.city.trim(),
                state: customer.state.trim(),
                pincode: customer.pincode.trim(),
                landmark: customer.landmark.trim(),
                altPhone: customer.altPhone.trim(),
              },
              status: 'Paid',
              paymentStatus: 'Success',
            })

            clearCart()
            setIsOpen(false)
            setStep('cart')
            navigate(`/order-placed/${orderRecord.id}`)
          } catch (e) {
            setError(e?.message || 'Payment completed, but order save failed. Please contact support.')
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
                  <article key={item.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[10px] font-semibold text-brand-black/40">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-navy">{item.name}</p>
                        <p className="mt-1 text-xs text-brand-black/60">
                          Rs. {formatMoney(item.price)} • Qty {item.qty}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, -1)}
                              className="inline-flex size-9 touch-manipulation items-center justify-center rounded-lg border border-black/10 bg-white text-brand-navy shadow-sm transition hover:bg-black/[0.03]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-7 text-center text-sm font-bold text-brand-navy">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, 1)}
                              className="inline-flex size-9 touch-manipulation items-center justify-center rounded-lg border border-black/10 bg-white text-brand-navy shadow-sm transition hover:bg-black/[0.03]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="text-sm font-bold text-brand-navy">
                            Rs. {formatMoney(Number(item.price) * Number(item.qty || 0))}
                          </p>
                        </div>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-black/70">Phone</label>
                  <input value={customer.phone} onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="Primary number" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-black/70">Alternate phone (optional)</label>
                  <input value={customer.altPhone} onChange={(e) => setCustomer((p) => ({ ...p, altPhone: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="Alternate number" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-black/70">Address line 1</label>
                <input value={customer.addressLine1} onChange={(e) => setCustomer((p) => ({ ...p, addressLine1: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="House/Flat No, Street" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-black/70">Address line 2 (optional)</label>
                <input value={customer.addressLine2} onChange={(e) => setCustomer((p) => ({ ...p, addressLine2: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="Apartment, Floor, etc." />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-black/70">Area / Locality</label>
                  <input value={customer.area} onChange={(e) => setCustomer((p) => ({ ...p, area: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="Area / Locality" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-black/70">Landmark (optional)</label>
                  <input value={customer.landmark} onChange={(e) => setCustomer((p) => ({ ...p, landmark: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="Near..." />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-black/70">City</label>
                  <input value={customer.city} onChange={(e) => setCustomer((p) => ({ ...p, city: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="City" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-black/70">State</label>
                  <input value={customer.state} onChange={(e) => setCustomer((p) => ({ ...p, state: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="State" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-black/70">Pincode</label>
                  <input inputMode="numeric" value={customer.pincode} onChange={(e) => setCustomer((p) => ({ ...p, pincode: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" placeholder="600034" />
                </div>
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
            <span className="font-semibold text-brand-navy">Rs. {formatMoney(subtotal)}</span>
          </div>
          {step === 'cart' ? (
            <button
              type="button"
              disabled={!canCheckout}
              onClick={() => setStep('checkout')}
              className="mt-3 flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-bold text-white shadow-card ring-1 ring-brand-navy/10 hover:bg-brand-navy-light disabled:opacity-50 sm:mt-4"
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
                disabled={loading || !canCheckout}
                onClick={openPayment}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-bold text-white hover:bg-brand-navy-light disabled:opacity-50"
              >
                {loading ? 'Starting…' : `Pay Rs. ${formatMoney(subtotal)}`}
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
