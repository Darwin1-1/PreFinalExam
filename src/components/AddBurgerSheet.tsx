import { useEffect, useRef, useState } from 'react'
import { readImage } from '../readImage'
import { money } from '../format'
import type { Burger } from '../types'

export type NewBurger = {
  name: string
  description: string
  price: number
  stock: number
  rating: number
  image: string
  featured: boolean
}

type AddBurgerSheetProps = {
  open: boolean
  onClose: () => void
  onSave: (burger: NewBurger) => Burger
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  rating: '5',
  image: '',
  featured: false,
}

export default function AddBurgerSheet({ open, onClose, onSave }: AddBurgerSheetProps) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setForm(emptyForm)
      setErrors({})
    }
  }, [open])

  if (!open) return null

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Choose an image file.' }))
      return
    }
    setLoading(true)
    try {
      set('image', await readImage(file))
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        image: error instanceof Error ? error.message : 'Could not load that image.',
      }))
    } finally {
      setLoading(false)
    }
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const price = Number(form.price)
    const stock = Number(form.stock)
    const rating = Number(form.rating)
    const next: Record<string, string> = {}

    if (!form.image) next.image = 'Burger photo is required.'
    if (!form.name.trim()) next.name = 'Burger name is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    if (!form.price || Number.isNaN(price) || price <= 0) next.price = 'Enter a price in pesos.'
    if (form.stock === '' || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))
      next.stock = 'Enter a whole stock count.'
    if (Number.isNaN(rating) || rating < 1 || rating > 5) next.rating = 'Rating must be 1 to 5.'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    onSave({
      name: form.name,
      description: form.description,
      price,
      stock,
      rating,
      image: form.image,
      featured: form.featured,
    })
  }

  return (
    <div
      className="sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Add a burger"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form className="sheet" onSubmit={submit}>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="Close form">
          &#215;
        </button>
        <h2>Add a Burger</h2>
        <p className="sheet-note">Fill in the details and it will appear in the menu.</p>

        <div className="field">
          <label htmlFor="burger-photo">Burger photo</label>
          <div className="upload-row">
            <div className="upload-preview">
              {form.image ? <img src={form.image} alt="Burger preview" /> : <span>&#127828;</span>}
            </div>
            <div>
              <input
                id="burger-photo"
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => pickFile(event.target.files?.[0])}
              />
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileRef.current?.click()}
              >
                {loading ? 'Loading photo' : form.image ? 'Change photo' : 'Upload photo'}
              </button>
              <p className="upload-hint">JPG or PNG, kept on this device.</p>
              {errors.image && <p className="error-text">{errors.image}</p>}
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="burger-name">Burger name</label>
          <input
            id="burger-name"
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="burger-description">Description</label>
          <textarea
            id="burger-description"
            rows={3}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
          />
          {errors.description && <p className="error-text">{errors.description}</p>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="burger-price">Price (&#8369;)</label>
            <input
              id="burger-price"
              type="number"
              min={1}
              step="0.01"
              value={form.price}
              onChange={(event) => set('price', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="burger-stock">Stock</label>
            <input
              id="burger-stock"
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(event) => set('stock', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="burger-rating">Rating</label>
            <input
              id="burger-rating"
              type="number"
              min={1}
              max={5}
              step="0.1"
              value={form.rating}
              onChange={(event) => set('rating', event.target.value)}
            />
          </div>
        </div>
        {(errors.price || errors.stock || errors.rating) && (
          <p className="error-text">{errors.price || errors.stock || errors.rating}</p>
        )}

        <label className="check-line">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => set('featured', event.target.checked)}
          />
          Show this burger in Feature
        </label>

        {form.price && Number(form.price) > 0 && !errors.price && (
          <p className="upload-hint">Price preview: {money(Number(form.price))}</p>
        )}

        <div className="sheet-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save burger
          </button>
        </div>
      </form>
    </div>
  )
}
