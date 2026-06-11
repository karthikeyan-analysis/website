import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUserAuth } from "./UserAuthContext";
import { userService } from "../services/userService";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useUserAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      setWishlistItems([]);
      return;
    }
    userService
      .getWishlist(user.uid)
      .then((items) => {
        setWishlistItems(items);
        setWishlistIds(new Set(items.map((i) => String(i.id))));
      })
      .catch(console.error);
  }, [user]);

  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(String(productId)),
    [wishlistIds],
  );

  const addToWishlist = useCallback(
    async (product) => {
      if (!user) return false;
      await userService.addToWishlist(user.uid, product);
      const now = new Date().toISOString();
      setWishlistItems((prev) => [{ ...product, addedAt: now }, ...prev]);
      setWishlistIds((prev) => new Set([...prev, String(product.id)]));
      return true;
    },
    [user],
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!user) return;
      await userService.removeFromWishlist(user.uid, productId);
      setWishlistItems((prev) => prev.filter((i) => String(i.id) !== String(productId)));
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(String(productId));
        return next;
      });
    },
    [user],
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!user) return null; // null signals: not logged in
      if (isWishlisted(product.id)) {
        await removeFromWishlist(product.id);
        return false;
      } else {
        await addToWishlist(product);
        return true;
      }
    },
    [user, isWishlisted, addToWishlist, removeFromWishlist],
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, wishlistItems, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
