export type UserStatus = 'active' | 'blocked';
export type UserRole = 'admin' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  status: UserStatus;
  role: UserRole;
};

export type ItemStatus = 'active' | 'out_of_stock' | 'disabled_by_seller' | 'disabled_by_admin';

export type Item = {
  id: string;
  name: string;
  sellerId: string;
  price: number;
  stock: number;
  status: ItemStatus;
};

export const CURRENT_ADMIN_ID = 'u-001';

export const users: User[] = [
  {
    id: 'u-001',
    name: 'Ignacio Rodríguez',
    email: 'ignacio@bazaar.com',
    registeredAt: '2025-01-12',
    status: 'active',
    role: 'admin',
  },
  {
    id: 'u-002',
    name: 'Camila Fernández',
    email: 'camila.fernandez@gmail.com',
    registeredAt: '2025-02-03',
    status: 'active',
    role: 'user',
  },
  {
    id: 'u-003',
    name: 'Martín López',
    email: 'martin.lopez@hotmail.com',
    registeredAt: '2025-02-18',
    status: 'active',
    role: 'user',
  },
  {
    id: 'u-004',
    name: 'Lucía Méndez',
    email: 'lucia.mendez@gmail.com',
    registeredAt: '2025-03-05',
    status: 'blocked',
    role: 'user',
  },
  {
    id: 'u-005',
    name: 'Federico Álvarez',
    email: 'fede.alvarez@yahoo.com',
    registeredAt: '2025-03-22',
    status: 'active',
    role: 'user',
  },
  {
    id: 'u-006',
    name: 'Sofía Iglesias',
    email: 'sofi.iglesias@gmail.com',
    registeredAt: '2025-04-09',
    status: 'active',
    role: 'user',
  },
  {
    id: 'u-007',
    name: 'Diego Pereyra',
    email: 'diego.pereyra@outlook.com',
    registeredAt: '2025-05-14',
    status: 'blocked',
    role: 'user',
  },
  {
    id: 'u-008',
    name: 'Valentina Soria',
    email: 'valentina.soria@gmail.com',
    registeredAt: '2025-06-01',
    status: 'active',
    role: 'user',
  },
  {
    id: 'u-009',
    name: 'Tomás Quiroga',
    email: 'tomas.quiroga@gmail.com',
    registeredAt: '2025-07-20',
    status: 'active',
    role: 'user',
  },
  {
    id: 'u-010',
    name: 'Agustina Romero',
    email: 'agus.romero@gmail.com',
    registeredAt: '2025-08-11',
    status: 'active',
    role: 'user',
  },
  {
    id: 'u-011',
    name: 'Joaquín Vidal',
    email: 'jvidal@bazaar.com',
    registeredAt: '2025-09-30',
    status: 'active',
    role: 'admin',
  },
  {
    id: 'u-012',
    name: 'Brenda Castro',
    email: 'brenda.castro@gmail.com',
    registeredAt: '2026-01-18',
    status: 'active',
    role: 'user',
  },
];

export const items: Item[] = [
  {
    id: 'i-001',
    name: 'Mate de calabaza con virola',
    sellerId: 'u-002',
    price: 8500,
    stock: 12,
    status: 'active',
  },
  {
    id: 'i-002',
    name: 'Bombilla alpaca pico de loro',
    sellerId: 'u-002',
    price: 4200,
    stock: 0,
    status: 'out_of_stock',
  },
  {
    id: 'i-003',
    name: 'Termo Stanley 1L verde',
    sellerId: 'u-003',
    price: 78000,
    stock: 5,
    status: 'active',
  },
  {
    id: 'i-004',
    name: 'Auriculares bluetooth genéricos',
    sellerId: 'u-004',
    price: 12000,
    stock: 30,
    status: 'disabled_by_admin',
  },
  {
    id: 'i-005',
    name: 'Cargador USB-C 65W',
    sellerId: 'u-005',
    price: 18500,
    stock: 8,
    status: 'active',
  },
  {
    id: 'i-006',
    name: 'Funda silicona iPhone 14',
    sellerId: 'u-005',
    price: 6500,
    stock: 22,
    status: 'disabled_by_seller',
  },
  {
    id: 'i-007',
    name: 'Zapatillas running talle 42',
    sellerId: 'u-006',
    price: 95000,
    stock: 3,
    status: 'active',
  },
  {
    id: 'i-008',
    name: 'Buzo oversize negro talle L',
    sellerId: 'u-006',
    price: 32000,
    stock: 0,
    status: 'out_of_stock',
  },
  {
    id: 'i-009',
    name: 'Réplica perfume importado',
    sellerId: 'u-007',
    price: 14000,
    stock: 15,
    status: 'disabled_by_admin',
  },
  {
    id: 'i-010',
    name: 'Cuaderno A5 tapa dura',
    sellerId: 'u-008',
    price: 4800,
    stock: 40,
    status: 'active',
  },
  {
    id: 'i-011',
    name: 'Set lapiceras gel x10',
    sellerId: 'u-008',
    price: 3200,
    stock: 18,
    status: 'active',
  },
  {
    id: 'i-012',
    name: 'Monitor 24" full HD',
    sellerId: 'u-009',
    price: 240000,
    stock: 2,
    status: 'active',
  },
  {
    id: 'i-013',
    name: 'Teclado mecánico switches red',
    sellerId: 'u-009',
    price: 86000,
    stock: 0,
    status: 'out_of_stock',
  },
  {
    id: 'i-014',
    name: 'Plantita suculenta en maceta',
    sellerId: 'u-010',
    price: 3500,
    stock: 25,
    status: 'active',
  },
  {
    id: 'i-015',
    name: 'Vela aromática lavanda',
    sellerId: 'u-010',
    price: 5200,
    stock: 10,
    status: 'disabled_by_seller',
  },
  {
    id: 'i-016',
    name: 'Bicicleta MTB rodado 29',
    sellerId: 'u-012',
    price: 580000,
    stock: 1,
    status: 'active',
  },
];
