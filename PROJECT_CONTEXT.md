# Orders Dashboard - Project Context

> **For AI assistants:** This file contains all context needed to continue development. Read this file first before any task.

## Overview
A mini dashboard for managing and displaying e-commerce orders with real-time updates.

## Tech Stack (Exact Versions)

### Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | React DOM renderer |
| @mui/material | ^5.18.0 | UI components (MUI 5.x required) |
| @mui/icons-material | ^5.18.0 | MUI icons |
| @emotion/react | ^11.14.0 | MUI styling engine |
| @emotion/styled | ^11.14.1 | MUI styling engine |
| @tanstack/react-query | ^5.90.16 | Data fetching & caching |
| react-hook-form | ^7.70.0 | Form handling |
| @hookform/resolvers | ^5.2.2 | Form validation resolvers (Zod 4 compatible) |
| zod | ^4.3.5 | Schema validation |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.9.3 | Type checking (strict mode, no `any`) |
| vite | ^7.3.0 | Build tool |
| vitest | ^4.0.16 | Testing framework |
| @testing-library/react | ^16.3.1 | React testing utilities |
| @testing-library/dom | ^10.4.1 | DOM testing utilities |
| @testing-library/jest-dom | ^6.9.1 | Jest DOM matchers |
| @testing-library/user-event | ^14.6.1 | User event simulation |
| vite-plugin-mock-dev-server | ^2.0.7 | Mock API endpoints |

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

```typescript
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  shippingAddress: Address;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

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
├── models/                    # TypeScript interfaces (Order, OrderItem, Address)
├── theme/
│   └── theme.ts               # MUI theme configuration [CREATED]
├── hooks/                     # Custom React hooks
├── utils/                     # Utility functions
├── mocks/                     # Mock data and API handlers
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

### Pending
- [ ] TypeScript models in src/models/
- [ ] Mock data generation (50-100 orders)
- [ ] Mock API endpoints (vite-plugin-mock-dev-server)
- [ ] MockWebSocket service
- [ ] OrdersTable component
- [ ] OrderDetailsModal component
- [ ] ConnectionStatus component
- [ ] Tests (minimum 3)

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
```

## Evaluation Criteria
| Criteria | Weight |
|----------|--------|
| TypeScript Quality | 25% |
| Architecture | 20% |
| Code Quality | 20% |
| AI Workflow | 20% |
| Testing | 10% |
| UI/UX | 5% |

## Important Notes
- TypeScript strict mode is ON — no `any` types allowed
- MUI 5.x is required (not 7.x)
- @hookform/resolvers ^5.2.2 is required for Zod 4 compatibility
- Generate 50-100 mock orders on app initialization
- See AI_WORKFLOW.md for AI assistance documentation
