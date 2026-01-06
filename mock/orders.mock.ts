import { defineMock } from 'vite-plugin-mock-dev-server';

import type { Order, OrderItem, Address, OrderStatus } from '../src/models';

// ============ Data Generation ============

const FIRST_NAMES = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Elizabeth',
  'David',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Emma',
  'Oliver',
  'Sophia',
  'Liam',
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
];

const PRODUCTS: readonly {
  name: string;
  priceRange: readonly [number, number];
}[] = [
  { name: 'Wireless Bluetooth Headphones', priceRange: [29.99, 199.99] },
  { name: 'USB-C Charging Cable', priceRange: [9.99, 29.99] },
  { name: 'Laptop Stand', priceRange: [24.99, 79.99] },
  { name: 'Mechanical Keyboard', priceRange: [49.99, 199.99] },
  { name: 'Ergonomic Mouse', priceRange: [19.99, 99.99] },
  { name: 'Monitor Light Bar', priceRange: [29.99, 89.99] },
  { name: 'Webcam HD 1080p', priceRange: [39.99, 149.99] },
  { name: 'Desk Organizer', priceRange: [14.99, 49.99] },
  { name: 'Phone Stand', priceRange: [9.99, 34.99] },
  { name: 'Smart Watch Band', priceRange: [12.99, 39.99] },
  { name: 'Portable SSD 1TB', priceRange: [79.99, 149.99] },
  { name: 'Wireless Charger', priceRange: [19.99, 59.99] },
  { name: 'Noise Cancelling Earbuds', priceRange: [49.99, 249.99] },
  { name: 'Gaming Mouse Pad XL', priceRange: [14.99, 49.99] },
  { name: 'USB Hub 7-Port', priceRange: [24.99, 69.99] },
];

const STREETS = [
  'Main Street',
  'Oak Avenue',
  'Maple Drive',
  'Cedar Lane',
  'Pine Road',
  'Elm Street',
  'Washington Boulevard',
  'Park Avenue',
  'Lake View Drive',
  'Sunset Boulevard',
  'Highland Avenue',
  'River Road',
  'Forest Lane',
];

const CITIES = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'Austin',
  'Seattle',
  'Denver',
  'Boston',
  'Portland',
  'Miami',
  'Atlanta',
  'San Francisco',
  'Minneapolis',
];

const COUNTRIES = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia'];

const STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const randomElement = <T>(arr: readonly T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)] as T;
};

const randomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(randomNumber(min, max + 1));
};

const generateId = (): string => {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

const generateItemId = (): string => {
  return `ITEM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};

const generateAddress = (): Address => ({
  street: `${randomInt(1, 9999)} ${randomElement(STREETS)}`,
  city: randomElement(CITIES),
  country: randomElement(COUNTRIES),
  postalCode: `${randomInt(10000, 99999)}`,
});

const generateOrderItem = (): OrderItem => {
  const product = randomElement(PRODUCTS);
  const price = Number(
    randomNumber(product.priceRange[0], product.priceRange[1]).toFixed(2),
  );
  return {
    id: generateItemId(),
    productName: product.name,
    quantity: randomInt(1, 5),
    price,
  };
};

const generateOrder = (daysAgo: number): Order => {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const customerName = `${firstName} ${lastName}`;
  const customerEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

  const itemCount = randomInt(1, 5);
  const items: OrderItem[] = Array.from(
    { length: itemCount },
    generateOrderItem,
  );
  const totalAmount = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - daysAgo);
  createdDate.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));

  const updatedDate = new Date(createdDate);
  updatedDate.setHours(updatedDate.getHours() + randomInt(0, 48));

  return {
    id: generateId(),
    customerName,
    customerEmail,
    status: randomElement(STATUSES),
    items,
    totalAmount,
    currency: 'USD',
    createdAt: createdDate.toISOString(),
    updatedAt: updatedDate.toISOString(),
    shippingAddress: generateAddress(),
  };
};

const generateMockOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = randomInt(0, 90);
    orders.push(generateOrder(daysAgo));
  }
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

// ============ Mock Data Store ============

const ordersStore: Order[] = generateMockOrders(75);

// ============ API Endpoints ============

export default defineMock([
  // GET /api/orders - List orders with pagination, filtering, sorting, search
  {
    url: '/api/orders',
    method: 'GET',
    body(request) {
      const url = new URL(request.url ?? '', 'http://localhost');
      const params = url.searchParams;

      // Pagination
      const page = parseInt(params.get('page') ?? '1', 10);
      const pageSize = parseInt(params.get('pageSize') ?? '10', 10);

      // Filtering
      const statusFilter = params.get('status');

      // Search
      const search = params.get('search')?.toLowerCase();

      // Sorting
      const sortBy = params.get('sortBy') ?? 'createdAt';
      const sortOrder = params.get('sortOrder') ?? 'desc';

      let filtered = [...ordersStore];

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((order) => order.status === statusFilter);
      }

      // Apply search
      if (search) {
        filtered = filtered.filter(
          (order) =>
            order.customerName.toLowerCase().includes(search) ||
            order.id.toLowerCase().includes(search),
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sortBy) {
          case 'customerName':
            aVal = a.customerName.toLowerCase();
            bVal = b.customerName.toLowerCase();
            break;
          case 'totalAmount':
            aVal = a.totalAmount;
            bVal = b.totalAmount;
            break;
          case 'status':
            aVal = a.status;
            bVal = b.status;
            break;
          case 'createdAt':
          default:
            aVal = new Date(a.createdAt).getTime();
            bVal = new Date(b.createdAt).getTime();
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // Apply pagination
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedOrders = filtered.slice(startIndex, endIndex);

      return {
        data: paginatedOrders,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      };
    },
  },

  // GET /api/orders/:id - Get single order by ID
  {
    url: '/api/orders/:id',
    method: 'GET',
    body(request) {
      const id = request.params.id as string;
      const order = ordersStore.find((o) => o.id === id);

      if (!order) {
        return {
          status: 404,
          body: { error: 'Order not found' },
        };
      }

      return order;
    },
  },

  // PATCH /api/orders/:id - Update order status
  {
    url: '/api/orders/:id',
    method: 'PATCH',
    body(request) {
      const id = request.params.id as string;
      const updates = request.body as Partial<Pick<Order, 'status'>>;

      const index = ordersStore.findIndex((o) => o.id === id);
      if (index === -1) {
        return {
          status: 404,
          body: { error: 'Order not found' },
        };
      }

      const existingOrder = ordersStore[index];
      if (existingOrder && updates.status) {
        ordersStore[index] = {
          ...existingOrder,
          status: updates.status,
          updatedAt: new Date().toISOString(),
        };
      }

      return ordersStore[index];
    },
  },
]);
