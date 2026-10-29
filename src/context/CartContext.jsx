import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return setItems([])
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, product:products(id, name, price, image_query)')
      .order('created_at')
    if (error) setError(error.message)
    else setItems(data)
  }, [user])

  useEffect(() => { load() }, [load])

  async function addToCart(productId) {
    setError('')
    const existing = items.find((i) => i.product.id === productId)
    const { error } = existing
      ? await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
      : await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: 1 })
    if (error) setError(error.message)
    await load()
  }

  async function setQuantity(id, quantity) {
    const { error } = quantity < 1
      ? await supabase.from('cart_items').delete().eq('id', id)
      : await supabase.from('cart_items').update({ quantity }).eq('id', id)
    if (error) setError(error.message)
    await load()
  }

  async function removeItem(id) {
    const { error } = await supabase.from('cart_items').delete().eq('id', id)
    if (error) setError(error.message)
    await load()
  }

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.quantity * i.product.price, 0)

  return (
    <CartContext.Provider value={{ items, count, total, error, addToCart, setQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
