# Warehouse CRM - Playwright POC

A simple warehouse CRM application built with React for learning Playwright automation testing.

## Features

### Warehouse Management
- List all warehouses
- Add new warehouses (name and description)
- Edit existing warehouses
- Delete warehouses

### Product Management
- List all products
- Add new products (name and price)
- Edit existing products
- Delete products

### Position Management
- List all positions (product in warehouse with quantity)
- Add new positions (select product, warehouse, and amount)
- Edit existing positions
- Delete positions

## Technical Stack

- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **localStorage** - Data persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Test IDs

All interactive elements have `data-testid` attributes for easy Playwright automation:

- Navigation: `nav-link-warehouses`, `nav-link-products`, `nav-link-positions`
- Buttons: `btn-add-{entity}`, `btn-edit-{entity}-{id}`, `btn-delete-{entity}-{id}`, `btn-save-{entity}`, `btn-cancel-{entity}`
- Forms: `form-{entity}`
- Inputs: `input-{field}-{entity}`
- Lists: `list-{entity}`

## Data Storage

All data is stored in browser localStorage and persists across page refreshes. The data structure:

- **Warehouses**: `{ id, name, description }`
- **Products**: `{ id, name, price }`
- **Positions**: `{ id, productId, warehouseId, amount }`

## Testing

### Running Playwright Tests

The project includes comprehensive Playwright UI autotests using the Page Object Model (POM) pattern.

**Note**: Playwright requires Node.js 18+. If you're using Node 17, you'll need to upgrade to run the tests.

#### Install Playwright Browsers

```bash
npx playwright install chromium
```

#### Run Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed
```

#### Test Structure

- `tests/pages/` - Page Object Model classes
  - `BasePage.ts` - Base page with common methods
  - `NavigationPage.ts` - Navigation page object
  - `WarehousePage.ts` - Warehouse management page object
  - `ProductPage.ts` - Product management page object
  - `PositionPage.ts` - Position management page object
- `tests/fixtures/` - Test data fixtures
  - `test-data.ts` - Reusable test data generators
- `tests/*.spec.ts` - Test files
  - `navigation.spec.ts` - Navigation tests
  - `warehouses.spec.ts` - Warehouse CRUD tests
  - `products.spec.ts` - Product CRUD tests
  - `positions.spec.ts` - Position CRUD tests

#### Test Coverage

The tests cover:
- Navigation between all pages
- CRUD operations for Warehouses (Create, Read, Update, Delete)
- CRUD operations for Products (Create, Read, Update, Delete)
- CRUD operations for Positions (Create, Read, Update, Delete)
- Form validation
- Data persistence (localStorage)
- Empty states
- Multiple item creation and management
