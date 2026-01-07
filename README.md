# Orders Dashboard

E-commerce orders management dashboard built with React + TypeScript.

**Goal:** Demonstrate AI-assisted development workflow — maximize AI tool usage to deliver a working product within strict time constraints.

## Tech Stack

React 18 | TypeScript 5 | MUI 5 | TanStack Query | React Hook Form + Zod | Zustand | Vite | Vitest

> Note: Package versions are fixed per technical assignment requirements, not necessarily the latest available.

## Features

- **Orders Table** - Sortable columns, pagination (10/25/50), status filtering, search by customer name or order ID
- **Real-time Updates** - Mock WebSocket with simulated order events every 3-5 seconds
- **Connection Status** - Visual indicator (Connected/Disconnected/Reconnecting) with auto-reconnect
- **Order Details Modal** - View full order info, change status with instant updates
- **Dark Mode** - Theme switcher (Light/Dark/System) with OS preference detection and localStorage persistence
- **Responsive Design** - Mobile-first layout optimized for desktop and tablet

## Setup & Run

```bash
# Install dependencies
npm install

# Start development server (includes mock API)
npm run dev

# Build for production
npm run build
```

The dev server runs at `http://localhost:5173` with mock API endpoints provided by `vite-plugin-mock-dev-server`.

## Testing

```bash
# Run tests (watch mode by default)
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

Includes sample tests demonstrating full coverage patterns: unit tests, component tests, and integration tests.

## Scripts

| Command                 | Description             |
| ----------------------- | ----------------------- |
| `npm run dev`           | Start dev server        |
| `npm run build`         | Build for production    |
| `npm run test`          | Run tests (watch mode)  |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:ui`       | Run tests with UI       |
| `npm run lint`          | Run ESLint              |
| `npm run lint:fix`      | Auto-fix ESLint issues  |
| `npm run format`        | Format with Prettier    |

## Project Structure

```
src/
├── components/       # UI components (OrdersTable, ConnectionStatus, ThemeSwitcher, etc.)
├── pages/            # Page components (OrdersPage)
├── features/orders/  # Order-related hooks and logic
├── forms/            # Form components and schemas (OrderEditForm)
├── services/         # MockWebSocket implementation
├── stores/           # Zustand stores (search, theme)
├── models/           # TypeScript interfaces
├── constants/        # Application constants (modal types, etc.)
├── theme/            # MUI theme configuration
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
└── test/             # Test setup and helpers
```

## Documentation

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Full project context and requirements
- [AI_WORKFLOW.md](AI_WORKFLOW.md) - AI assistance documentation

---

> For a production-grade implementation showcasing best practices and comprehensive architecture, see my [demo-t3](https://github.com/devalf/demo-t3) repository.
