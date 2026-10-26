import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AddBurgerSheet, { type NewBurger } from './components/AddBurgerSheet'
import ProductPage from './components/ProductPage'
import Stars from './components/Stars'
import { seedBurgers, sortBurgers, sortOptions } from './data'
import { addedOn, isLow, money } from './format'
import type { Burger, CartItem, SortKey } from './types'

const BURGER_KEY = 'acdal_pre_final_burgers'
const CART_KEY = 'acdal_pre_final_cart'

const loadBurgers = (): Burger[] => {
  try {
    const saved = localStorage.getItem(BURGER_KEY)
    if (!saved) return seedBurgers
    const parsed = JSON.parse(saved) as Burger[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedBurgers
  } catch {
    return seedBurgers
  }
}

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const routeBurger = () => {
  const match = window.location.hash.match(/^#\/burger\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function App() {
  const [burgers, setBurgers] = useState<Burger[]>(loadBurgers)
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [showAll, setShowAll] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [selected, setSelected] = useState<Burger | null>(null)
  const [qty, setQty] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [highlight, setHighlight] = useState<string | null>(null)
  const [contact, setContact] = useState({ name: '', email: '', message: '' })
  const [routeId, setRouteId] = useState<string | null>(routeBurger)

  useEffect(() => {
    localStorage.setItem(BURGER_KEY, JSON.stringify(burgers))
  }, [burgers])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== CART_KEY || !event.newValue) return
      try {
        const parsed = JSON.parse(event.newValue) as CartItem[]
        if (Array.isArray(parsed)) setCart(parsed)
      } catch {
        setCart([])
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  useEffect(() => {
    const onHash = () => setRouteId(routeBurger())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!highlight) return
    const timer = window.setTimeout(() => setHighlight(null), 6000)
    return () => window.clearTimeout(timer)
  }, [highlight])

  const sorted = useMemo(() => sortBurgers(burgers, sortKey), [burgers, sortKey])
  const visible = showAll ? sorted : sorted.slice(0, 4)
  const featured = burgers.filter((burger) => burger.featured)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.burger.price * item.qty, 0)

  const addToCart = (burger: Burger, amount = 1) => {
    setCart((prev) => {
      const found = prev.find((item) => item.burger.id === burger.id)
      if (found) {
        return prev.map((item) =>
          item.burger.id === burger.id ? { ...item, qty: item.qty + amount } : item,
        )
      }
      return [...prev, { burger, qty: amount }]
    })
  }

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.burger.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    )
  }

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleFeatured = (id: string) => {
    setBurgers((prev) =>
      prev.map((burger) =>
        burger.id === id ? { ...burger, featured: !burger.featured } : burger,
      ),
    )
  }

  const openDetails = (burger: Burger) => {
    setSelected(burger)
    setQty(1)
  }

  const confirmOrder = () => {
    if (!selected) return
    addToCart(selected, qty)
    setToast(`${qty} x ${selected.name} added to your cart`)
    setSelected(null)
  }

  const saveBurger = (input: NewBurger) => {
    const burger: Burger = {
      id: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`,
      name: input.name.trim(),
      description: input.description.trim(),
      price: input.price,
      rating: input.rating,
      image: input.image,
      stock: input.stock,
      featured: input.featured,
      dateAdded: new Date().toISOString(),
    }
    setBurgers((prev) => [burger, ...prev])
    setSortKey('date-desc')
    setShowAll(true)
    setHighlight(burger.id)
    setAddOpen(false)
    setToast(`${burger.name} added to the menu`)
    window.setTimeout(() => {
      document
        .getElementById(`card-${burger.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
    return burger
  }

  const submitContact = (event: FormEvent) => {
    event.preventDefault()
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
      setToast('Please complete all fields')
      return
    }
    setToast(`Thanks ${contact.name}, your message was received`)
    setContact({ name: '', email: '', message: '' })
  }

  if (routeId) {
    const product = burgers.find((burger) => burger.id === routeId)
    if (!product) {
      return (
        <div className="burger-app">
          <div className="product-main">
            <a className="back-link" href="#">
              Back to menu
            </a>
            <p className="empty-state">That burger is no longer available.</p>
          </div>
        </div>
      )
    }
    return (
      <>
        <ProductPage
          burger={product}
          onAdd={(item) => {
            addToCart(item)
            setToast(`${item.name} added to your cart`)
          }}
        />
        {toast && <div className="toast">{toast}</div>}
      </>
    )
  }

  return (
    <div className="burger-app">
      <header className="header">
        <div className="header-content">
          <a className="logo" href="#about" aria-label="Tasty Burger home">
            <span className="logo-icon">TB</span>
            <span className="logo-name">
              TASTY <strong>BURGER</strong>
            </span>
          </a>
          <nav className="navigation" aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#menu">Our menu</a>
            <a href="#feature">Feature</a>
            <a href="#shop">Shop</a>
            <a href="#contact">Contact</a>
          </nav>
          <button
            className="cart-icon"
            aria-label={`${cartCount} items in cart`}
            onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span aria-hidden="true">&#128722;</span>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </header>

      <main className="main-content" id="menu">
        <section className="hero-section" id="about">
          <p className="eyebrow">Handcrafted. Hot off the grill.</p>
          <h1 className="hero-title">OUR CRAZY BURGERS</h1>
          <p className="hero-description">
            Big flavor, bold toppings, and toasted buns made for messy, memorable bites. Pick
            your favorite and make it a meal.
          </p>
        </section>

        <div className="toolbar">
          <span className="toolbar-count">{sorted.length} burgers</span>
          <div className="sort-control">
            <label htmlFor="sort">Sort by</label>
            <select
              id="sort"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="burger-grid" aria-label="Burger menu">
          {visible.map((burger) => {
            const wished = wishlist.includes(burger.id)
            return (
              <article
                className={highlight === burger.id ? 'burger-card highlight' : 'burger-card'}
                key={burger.id}
                id={`card-${burger.id}`}
                onClick={() => openDetails(burger)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openDetails(burger)
                  }
                }}
                aria-label={`View ${burger.name} details`}
              >
                <div className="card-image-container">
                  <img src={burger.image} alt={burger.name} className="burger-image" />
                  <span className="image-label">Grill favorite</span>
                  {isLow(burger.stock) && <span className="low-badge">Low stock</span>}
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <Stars rating={burger.rating} />
                    <div className="card-tools">
                      <button
                        className={burger.featured ? 'feature-btn active' : 'feature-btn'}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleFeatured(burger.id)
                        }}
                        aria-label={
                          burger.featured ? 'Remove from feature' : 'Add to feature'
                        }
                        title={burger.featured ? 'Remove from feature' : 'Add to feature'}
                      >
                        &#9733;
                      </button>
                      <button
                        className={wished ? 'wishlist-btn active' : 'wishlist-btn'}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleWishlist(burger.id)
                        }}
                        aria-label={`${wished ? 'Remove' : 'Add'} ${burger.name} ${wished ? 'from' : 'to'} wishlist`}
                        aria-pressed={wished}
                      >
                        {wished ? '\u2665' : '\u2661'}
                      </button>
                    </div>
                  </div>
                  <h2 className="burger-name">{burger.name}</h2>
                  <p className="burger-description">{burger.description}</p>
                  <div className="meta-row">
                    <span className={isLow(burger.stock) ? 'stock-low' : ''}>
                      {burger.stock} in stock
                    </span>
                    <span>&#183;</span>
                    <span>Added {addedOn(burger.dateAdded)}</span>
                  </div>
                  <div className="card-footer">
                    <span className="price">{money(burger.price)}</span>
                    <span className="view-details">View details</span>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        {sorted.length > 4 && (
          <button className="view-more" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : 'View more'}
          </button>
        )}
      </main>

      <section className="section" id="feature">
        <div className="section-head">
          <h2 className="section-title">Featured Burgers</h2>
          <p className="section-note">
            Kitchen picks and best sellers. Open any card to see its own page.
          </p>
        </div>
        {featured.length === 0 ? (
          <p className="empty-state">
            No featured burgers yet. Tap the star on a menu card to place it here.
          </p>
        ) : (
          <div className="feature-grid">
            {featured.map((burger) => (
              <a
                className="feature-card"
                key={burger.id}
                href={`#/burger/${burger.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <img src={burger.image} alt={burger.name} />
                <div className="feature-card-body">
                  <h3>{burger.name}</h3>
                  <span>{money(burger.price)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="section" id="shop">
        <div className="section-head">
          <h2 className="section-title">Your Order</h2>
          <p className="section-note">
            {cartCount === 0 ? 'Your cart is empty.' : `${cartCount} items ready to check out.`}
          </p>
        </div>
        {cart.length === 0 ? (
          <p className="empty-state">
            Nothing here yet. Open a burger and choose Add to cart to start an order.
          </p>
        ) : (
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-row" key={item.burger.id}>
                <img src={item.burger.image} alt={item.burger.name} />
                <div className="cart-info">
                  <h3>{item.burger.name}</h3>
                  <span>{money(item.burger.price)} each</span>
                </div>
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => changeQty(item.burger.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    &#8722;
                  </button>
                  <span className="quantity">{item.qty}</span>
                  <button
                    className="quantity-btn plus"
                    onClick={() => changeQty(item.burger.id, 1)}
                    aria-label="Increase quantity"
                  >
                    &#43;
                  </button>
                </div>
                <div className="cart-line">{money(item.burger.price * item.qty)}</div>
                <button
                  className="remove-btn"
                  onClick={() => setCart((prev) => prev.filter((row) => row.burger.id !== item.burger.id))}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="cart-total">
              <span>Total</span>
              <strong>{money(cartTotal)}</strong>
            </div>
            <button
              className="checkout-btn"
              onClick={() => {
                setCart([])
                setToast('Order placed. Thank you!')
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </section>

      <section className="section" id="contact">
        <div className="section-head">
          <h2 className="section-title">Contact</h2>
        </div>
        <div className="contact-shell">
          <div className="contact-copy">
            <p>
              Send us a message and the shop will reply within one business day.
            </p>
            <p>
              Tasty Burger &#183; <strong>Sorsogon</strong>
            </p>
          </div>
          <form className="contact-form" onSubmit={submitContact}>
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                value={contact.name}
                onChange={(event) => setContact({ ...contact, name: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={contact.email}
                onChange={(event) => setContact({ ...contact, email: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={4}
                value={contact.message}
                onChange={(event) => setContact({ ...contact, message: event.target.value })}
              />
            </div>
            <button className="send-btn" type="submit">
              Send message
            </button>
          </form>
        </div>
      </section>

      <footer className="footer">Tasty Burger. Pre-final project of Darwin Acdal.</footer>

      <button className="fab" onClick={() => setAddOpen(true)}>
        <span>&#43;</span> Add burger
      </button>

      <AddBurgerSheet open={addOpen} onClose={() => setAddOpen(false)} onSave={saveBurger} />

      {selected && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null)
          }}
        >
          <section
            className="burger-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-burger-name"
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close burger details"
            >
              &#215;
            </button>
            <img className="modal-image" src={selected.image} alt={selected.name} />
            <div className="modal-content">
              <p className="eyebrow">Made fresh to order</p>
              <h2 id="modal-burger-name">{selected.name}</h2>
              <p className="modal-description">{selected.description}</p>
              <span className={isLow(selected.stock) ? 'modal-stock low-stock' : 'modal-stock'}>
                {isLow(selected.stock) ? 'Low stock' : 'In stock'} &#183; {selected.stock} left
              </span>
              <div className="modal-order-row">
                <span className="price">{money(selected.price)}</span>
                <div className="quantity-control" aria-label="Select quantity">
                  <button
                    className="quantity-btn"
                    type="button"
                    onClick={() => setQty((value) => Math.max(1, value - 1))}
                    disabled={qty === 1}
                    aria-label="Decrease quantity"
                  >
                    &#8722;
                  </button>
                  <span className="quantity" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    className="quantity-btn plus"
                    type="button"
                    onClick={() => setQty((value) => value + 1)}
                    aria-label="Increase quantity"
                  >
                    &#43;
                  </button>
                </div>
              </div>
              <button className="add-to-cart-btn" type="button" onClick={confirmOrder}>
                Add to cart &#183; {money(selected.price * qty)}
              </button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
