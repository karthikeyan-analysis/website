import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUserAuth } from "../contexts/UserAuthContext";
import { userService } from "../services/userService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useUserAuth();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const prevUidRef = useRef(null);

  // Load cart from Firestore when user logs in; merge with any guest items
  useEffect(() => {
    if (!user) {
      prevUidRef.current = null;
      setCartLoaded(true);
      return;
    }
    if (prevUidRef.current === user.uid) return;
    prevUidRef.current = user.uid;

    userService
      .getCart(user.uid)
      .then((savedItems) => {
        if (savedItems.length > 0) {
          setItems((guestItems) => {
            const merged = [...savedItems];
            for (const g of guestItems) {
              const idx = merged.findIndex((s) => s.id === g.id);
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], qty: g.qty };
              } else {
                merged.push(g);
              }
            }
            return merged;
          });
        }
        setCartLoaded(true);
      })
      .catch(() => setCartLoaded(true));
  }, [user]);

  // Persist cart to Firestore (debounced 600ms) whenever items change
  const syncTimerRef = useRef(null);
  useEffect(() => {
    if (!user || !cartLoaded) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      userService.saveCart(user.uid, items).catch(console.error);
    }, 600);
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [items, user, cartLoaded]);

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(item.qty + delta, 0) } : item,
        )
        .filter((item) => item.qty > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) userService.clearCart(user.uid).catch(console.error);
  }, [user]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );

  const value = {
    items,
    isOpen,
    setIsOpen,
    addToCart,
    updateQty,
    clearCart,
    itemCount,
    subtotal,
    cartLoaded,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
