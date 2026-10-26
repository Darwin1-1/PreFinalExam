import type { Burger } from '../types'
import { addedOn, isLow, money } from '../format'
import Stars from './Stars'

type ProductPageProps = {
  burger: Burger
  onAdd: (burger: Burger) => void
}

export default function ProductPage({ burger, onAdd }: ProductPageProps) {
  return (
    <div className="burger-app">
      <header className="header">
        <div className="header-content">
          <span className="logo">
            <span className="logo-icon">TB</span>
            <span className="logo-name">
              TASTY <strong>BURGER</strong>
            </span>
          </span>
          <a className="back-link" href="#">
            Back to menu
          </a>
        </div>
      </header>

      <div className="product-main">
        <div className="product-shell">
          <img src={burger.image} alt={burger.name} />
          <div className="product-detail">
            <p className="eyebrow">Added {addedOn(burger.dateAdded)}</p>
            <h1>{burger.name}</h1>
            <Stars rating={burger.rating} />
            <p className="modal-description">{burger.description}</p>
            <span className="price">{money(burger.price)}</span>
            <span className={isLow(burger.stock) ? 'modal-stock low-stock' : 'modal-stock'}>
              {isLow(burger.stock) ? 'Low stock' : 'In stock'} &#183; {burger.stock} left
            </span>
            <div className="product-actions">
              <button className="add-to-cart-btn" onClick={() => onAdd(burger)}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
