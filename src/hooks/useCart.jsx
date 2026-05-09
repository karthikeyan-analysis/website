import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setIsOpen(true)
  }

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: Math.max(item.qty + delta, 0) } : item))
        .filter((item) => item.qty > 0),
    )
  }

  const clearCart = () => setItems([])

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items])

  const value = { items, isOpen, setIsOpen, addToCart, updateQty, clearCart, itemCount, subtotal }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
