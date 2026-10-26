# Pre_Final_Acdal_Darwin_SIA

Burger shop web app built with React, TypeScript and Vite.

## Run

```bash
npm install
npm run dev      # development server
npm run build    # production build in dist/
npm run preview  # serve the production build
npm run lint     # eslint
```

## Sections

- About - hero with the shop tagline
- Our menu - burger grid, four per row, four shown at first, View more / Show less
- Feature - featured burgers, each card opens its own page in a new tab
- Shop - order list with quantity controls, total and checkout
- Contact - message form with validation

## Menu features

- Sort by date added, price, name, stock or rating
- Stock per burger, with a Low stock badge when the count is 5 or below
- Star button on every card to add or remove it from the Feature section
- Add Burger button at the bottom right opens a form over a blurred page:
  photo upload with preview, name, description, price in pesos, stock, rating
  and a Feature checkbox. The new burger shows up in the menu right away with
  a highlight and a confirmation message.
- Burgers and the cart are kept in localStorage, so a reload keeps the menu
  and the current order.

Sample burgers: Crispy Chicken, Ultimate Bacon, Black Sheep, Vegan Burger,
Smokehouse Stack, Golden Gouda, Firecracker Beef, Herb Garden.

Project by Darwin Acdal.
