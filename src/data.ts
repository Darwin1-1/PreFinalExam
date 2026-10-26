import type { Burger, SortKey } from './types'

const SEED_DATE = '2026-10-25T09:00:00'

export const seedBurgers: Burger[] = [
  {
    id: 'crispy-chicken',
    name: 'Crispy Chicken',
    description: 'Chicken breast, chilli sauce, tomatoes, pickles, coleslaw',
    price: 99.15,
    rating: 5,
    image: './burgers/crispy-chicken.jpg',
    stock: 18,
    featured: true,
    dateAdded: SEED_DATE,
  },
  {
    id: 'ultimate-bacon',
    name: 'Ultimate Bacon',
    description: 'House patty, cheddar cheese, bacon, onion, mustard',
    price: 99.32,
    rating: 4.5,
    image: './burgers/ultimate-bacon.jpg',
    stock: 9,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'black-sheep',
    name: 'Black Sheep',
    description: 'American cheese, tomato relish, avocado, lettuce, red onion',
    price: 69.15,
    rating: 4,
    image: './burgers/black-sheep.jpg',
    stock: 12,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'vegan-burger',
    name: 'Vegan Burger',
    description: 'House patty, cheddar cheese, bacon, onion, mustard',
    price: 99.25,
    rating: 4.5,
    image: './burgers/vegan-burger.jpg',
    stock: 4,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'smokehouse-stack',
    name: 'Smokehouse Stack',
    description: 'Double beef, smoked cheddar, onion rings, barbecue glaze',
    price: 129.5,
    rating: 4.8,
    image: './burgers/smokehouse-stack.jpg',
    stock: 6,
    featured: true,
    dateAdded: SEED_DATE,
  },
  {
    id: 'golden-gouda',
    name: 'Golden Gouda',
    description: 'Beef patty, gouda, caramelised onion, garlic aioli',
    price: 119.75,
    rating: 4.6,
    image: './burgers/golden-gouda.jpg',
    stock: 15,
    featured: false,
    dateAdded: SEED_DATE,
  },
  {
    id: 'firecracker-beef',
    name: 'Firecracker Beef',
    description: 'Flame grilled beef, jalapenos, pepper jack, chipotle sauce',
    price: 115.25,
    rating: 4.2,
    image: './burgers/firecracker-beef.jpg',
    stock: 5,
    featured: true,
    dateAdded: SEED_DATE,
  },
  {
    id: 'herb-garden',
    name: 'Herb Garden',
    description: 'Chickpea patty, avocado, tomato, lettuce, herb dressing',
    price: 105,
    rating: 4,
    image: './burgers/herb-garden.jpg',
    stock: 20,
    featured: false,
    dateAdded: SEED_DATE,
  },
]

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'date-desc', label: 'Date added (newest)' },
  { value: 'price-asc', label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
  { value: 'name-asc', label: 'Name (A to Z)' },
  { value: 'stock-asc', label: 'Stock (low to high)' },
  { value: 'rating-desc', label: 'Rating (high to low)' },
]

export const sortBurgers = (list: Burger[], key: SortKey): Burger[] => {
  const sorted = [...list]
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'stock-asc':
      return sorted.sort((a, b) => a.stock - b.stock)
    case 'rating-desc':
      return sorted.sort((a, b) => b.rating - a.rating)
    default:
      return sorted.sort(
        (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      )
  }
}
