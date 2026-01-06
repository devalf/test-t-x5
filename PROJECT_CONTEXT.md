# Orders Dashboard - Project Context

> **For AI assistants:** This file contains all context needed to continue development. Read this file first before any task.

## Overview

A mini dashboard for managing and displaying e-commerce orders with real-time updates.

## Tech Stack (Exact Versions)

### Dependencies

| Package               | Version  | Purpose                                      |
| --------------------- | -------- | -------------------------------------------- |
| react                 | ^18.3.1  | UI framework                                 |
| react-dom             | ^18.3.1  | React DOM renderer                           |
| @mui/material         | ^5.18.0  | UI components (MUI 5.x required)             |
| @mui/icons-material   | ^5.18.0  | MUI icons                                    |
| @emotion/react        | ^11.14.0 | MUI styling engine                           |
| @emotion/styled       | ^11.14.1 | MUI styling engine                           |
| @tanstack/react-query | ^5.90.16 | Data fetching & caching                      |
| react-hook-form       | ^7.70.0  | Form handling                                |
| @hookform/resolvers   | ^5.2.2   | Form validation resolvers (Zod 4 compatible) |
| zod                   | ^4.3.5   | Schema validation                            |

### Dev Dependencies

| Package                     | Version | Purpose                               |
| --------------------------- | ------- | ------------------------------------- |
| typescript                  | ^5.9.3  | Type checking (strict mode, no `any`) |
| vite                        | ^7.3.0  | Build tool                            |
| vitest                      | ^4.0.16 | Testing framework                     |
| @testing-library/react      | ^16.3.1 | React testing utilities               |
| @testing-library/dom        | ^10.4.1 | DOM testing utilities                 |
| @testing-library/jest-dom   | ^6.9.1  | Jest DOM matchers                     |
| @testing-library/user-event | ^14.6.1 | User event simulation                 |
| vite-plugin-mock-dev-server | ^2.0.7  | Mock API endpoints                    |

## Features to Implement

### 1. Orders Table

- Display columns: Order ID, Customer Name, Status, Total Amount, Created Date
- Sorting by any column (click header)
- Filtering by status (dropdown)
- Search by customer name or order ID
- Pagination (10/25/50 items per page)

### 2. Real-time Updates (Mock WebSocket)

- MockWebSocket class simulating WebSocket behavior
- Every 3-5 seconds: "new order" or "order status update"
- Connection status indicator (Connected / Disconnected / Reconnecting)
- Reconnection with exponential backoff
- Cleanup on component unmount

### 3. Order Details Modal

- Click row opens modal with full details
- Change order status (dropdown)
- Save changes (mock/local)

### 4. Theme & Styling

- Custom MUI theme (primary, secondary colors, typography)
- Responsive layout (desktop and tablet)
- Dark mode toggle (bonus)

## Data Models

All TypeScript interfaces and types are defined in `src/models/index.ts`, including:

- OrderStatus type
- Order interface
- OrderItem interface
- Address interface
- ORDER_STATUSES constant

## Project Structure

```
src/
├── components/
│   ├── OrdersTable/           # Main orders table component
│   ├── OrderDetailsModal/     # Order details modal
│   ├── ConnectionStatus/      # WebSocket status indicator
│   └── ui/                    # Shared UI components
├── features/
│   └── orders/
│       ├── useOrders.ts       # TanStack Query hooks
│       ├── ordersStore.ts     # Local state (if needed)
│       └── types.ts           # Order-related types
├── services/
│   └── mockWebSocket.ts       # Mock WebSocket implementation
├── models/                    # [CREATED] TypeScript interfaces (Order, OrderItem, Address)
├── theme/
│   └── theme.ts               # MUI theme configuration [CREATED]
├── hooks/                     # Custom React hooks
├── utils/                     # Utility functions
├── mocks/                     # [CREATED] Mock data and API handlers
├── mock/                      # [CREATED] Mock API endpoints (vite-plugin-mock-dev-server)
├── App.tsx                    # [CREATED] Main app with providers
├── main.tsx                   # [CREATED] Entry point
└── vite-env.d.ts             # [CREATED] Vite types
```

## Implementation Status

### Completed

- [x] Project scaffolding (Vite + React + TypeScript)
- [x] package.json with all dependencies
- [x] tsconfig.json (strict mode enabled)
- [x] vite.config.ts (with mock-dev-server plugin)
- [x] Folder structure created
- [x] Basic theme setup (src/theme/theme.ts)
- [x] App.tsx with QueryClientProvider + ThemeProvider
- [x] Code style setup (ESLint, Prettier, VSCode/WebStorm settings)
- [x] TypeScript models in src/models/
- [x] Mock data generation (75 orders)
- [x] Mock API endpoints (vite-plugin-mock-dev-server)

### Pending

- [ ] MockWebSocket service
- [ ] OrdersTable component
- [ ] OrderDetailsModal component
- [ ] ConnectionStatus component
- [ ] Tests (minimum 3)

## API Endpoints

### 1. GET /api/orders

List orders with pagination, filtering, sorting, and search.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 10, options: 10/25/50) - Items per page
- `status` (string, optional) - Filter by status: pending|processing|shipped|delivered|cancelled
- `search` (string, optional) - Search by customer name or order ID
- `sortBy` (string, default: createdAt) - Sort field: customerName|totalAmount|status|createdAt
- `sortOrder` (string, default: desc) - Sort direction: asc|desc

**Example:** `/api/orders?page=1&pageSize=25&status=processing&search=smith&sortBy=totalAmount&sortOrder=asc`

**Response:**

```typescript
{
  data: Order[],
  pagination: {
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number
  }
}
```

### 2. GET /api/orders/:id

Get single order by ID.

**Path Parameters:**

- `id` (string) - Order identifier

**Example:** `/api/orders/ORD-ABC123-XYZ789`

**Response:** `Order`

### 3. PATCH /api/orders/:id

Update order status.

**Path Parameters:**

- `id` (string) - Order identifier

**Request Body:**

```typescript
{
  "status": OrderStatus
}
```

**Example:** `PATCH /api/orders/ORD-ABC123-XYZ789` with body `{ "status": "shipped" }`

**Response:** Updated `Order`

## Testing Requirements

1. **Component test** — OrdersTable renders correctly with mock data
2. **Integration test** — Filtering/sorting works as expected
3. **Hook/Logic test** — WebSocket reconnection logic or state updates

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Auto-fix ESLint issues
npm run format     # Format code with Prettier
```

## Evaluation Criteria

| Criteria           | Weight |
| ------------------ | ------ |
| TypeScript Quality | 25%    |
| Architecture       | 20%    |
| Code Quality       | 20%    |
| AI Workflow        | 20%    |
| Testing            | 10%    |
| UI/UX              | 5%     |

## Code Style

- **Use `const` arrow functions** — prefer `const fn = () => {}` over `function fn() {}`
- **Exports** — use `export const fn = () => {}` for named exports

```typescript
// Good
const helper = (x: number): number => x * 2;
export const calculate = (value: number): number => helper(value);

// Bad
function helper(x: number): number {
  return x * 2;
}
export function calculate(value: number): number {
  return helper(value);
}
```

## Important Notes

- TypeScript strict mode is ON — no `any` types allowed
- MUI 5.x is required (not 7.x)
- @hookform/resolvers ^5.2.2 is required for Zod 4 compatibility
- Generate 50-100 mock orders on app initialization
- See AI_WORKFLOW.md for AI assistance documentation
