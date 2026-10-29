import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { won } from './Shop.jsx'

export default function Cart() {
  const { items, total, error, setQuantity, removeItem } = useCart()

  return (
    <main className="cart">
      <h1>🛒 장바구니</h1>
      {error && <p className="error">⚠️ {error}</p>}
      {items.length === 0 ? (
        <p className="center">비어 있어요 😢 <Link to="/shop">🛍️ 쇼핑하러 가기</Link></p>
      ) : (
        <>
          {items.map((i) => (
            <div key={i.id} className="cart-row">
              <div className="cart-name">
                <b>{i.product.name}</b>
                <small>{won(i.product.price)}</small>
              </div>
              <div className="qty">
                <button onClick={() => setQuantity(i.id, i.quantity - 1)}>−</button>
                <span>{i.quantity}</span>
                <button onClick={() => setQuantity(i.id, i.quantity + 1)}>＋</button>
              </div>
              <b className="line">{won(i.product.price * i.quantity)}</b>
              <button className="x" onClick={() => removeItem(i.id)} aria-label="삭제">🗑️</button>
            </div>
          ))}
          <div className="cart-total">💰 합계 <b>{won(total)}</b></div>
          <button className="btn big" onClick={() => alert('결제 기능은 준비 중이에요 🚧')}>✨ 주문하기</button>
        </>
      )}
    </main>
  )
}
