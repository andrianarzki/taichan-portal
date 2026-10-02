import Dexie, { type Table } from 'dexie';
import { Order } from '../types';

export class TaichanDatabase extends Dexie {
  orders!: Table<Order, string>;

  constructor() {
    super('TaichanPortalDB');
    this.version(1).stores({
      orders: 'id, tableInfo, status, paymentMethod, createdAt, completedAt, synced'
    });
  }
}

export const db = new TaichanDatabase();

// Helper to seed initial sample data if database is empty
export async function seedInitialDataIfEmpty() {
  const count = await db.orders.count();
  if (count > 0) return;

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const dateStr = `${dd}${mm}${yy}`; // e.g. "031026"
  
  // Create relative timestamps
  const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000).toISOString();
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  const seedOrders: Order[] = [
    // Active orders in kitchen
    {
      id: `ORD-${dateStr}-01`,
      tableInfo: 'Meja 03',
      items: [
        { menuId: 'tc-daging-porsi', name: 'Taichan Daging (Porsi 10 tsk)', unitPrice: 20000, quantity: 2, subtotal: 40000, category: 'taichan', skewerCount: 10 },
        { menuId: 'tc-kulit-porsi', name: 'Taichan Kulit (Porsi 10 tsk)', unitPrice: 16000, quantity: 1, subtotal: 16000, category: 'taichan', skewerCount: 10 },
        { menuId: 'side-nasi-jeruk', name: 'Nasi Daun Jeruk', unitPrice: 4000, quantity: 2, subtotal: 8000, category: 'side' },
        { menuId: 'drink-es-teh', name: 'Es Teh Manis', unitPrice: 4000, quantity: 2, subtotal: 8000, category: 'drink' }
      ],
      totalAmount: 72000,
      paymentMethod: 'CASH',
      status: 'ACTIVE',
      createdAt: minutesAgo(8),
      synced: true,
      notes: 'Pelanggan baju biru'
    },
    {
      id: `ORD-${dateStr}-02`,
      tableInfo: 'Meja 01',
      items: [
        { menuId: 'tc-campur', name: 'Taichan Campur (10 tsk)', unitPrice: 18000, quantity: 1, subtotal: 18000, category: 'taichan', skewerCount: 10 },
        { menuId: 'side-lontong', name: 'Lontong', unitPrice: 3000, quantity: 1, subtotal: 3000, category: 'side' },
        { menuId: 'drink-nutrisari', name: 'Nutrisari Jeruk Dingin', unitPrice: 6000, quantity: 1, subtotal: 6000, category: 'drink' }
      ],
      totalAmount: 27000,
      paymentMethod: 'QRIS',
      status: 'ACTIVE',
      createdAt: minutesAgo(4),
      synced: true
    },
    {
      id: `ORD-${dateStr}-03`,
      tableInfo: 'Bungkus / Takeaway',
      items: [
        { menuId: 'tc-krispy', name: 'Taichan Krispy (10 tsk)', unitPrice: 20000, quantity: 2, subtotal: 40000, category: 'taichan', skewerCount: 10 },
        { menuId: 'side-nasi-jeruk', name: 'Nasi Daun Jeruk', unitPrice: 4000, quantity: 2, subtotal: 8000, category: 'side' }
      ],
      totalAmount: 48000,
      paymentMethod: 'QRIS',
      status: 'ACTIVE',
      createdAt: minutesAgo(2),
      synced: true
    },

    // Completed orders for analytics & history demonstration
    {
      id: `ORD-${dateStr}-04`,
      tableInfo: 'Meja 02',
      items: [
        { menuId: 'tc-daging-porsi', name: 'Taichan Daging (Porsi 10 tsk)', unitPrice: 20000, quantity: 2, subtotal: 40000, category: 'taichan', skewerCount: 10 },
        { menuId: 'side-nasi-jeruk', name: 'Nasi Daun Jeruk', unitPrice: 4000, quantity: 2, subtotal: 8000, category: 'side' },
        { menuId: 'drink-es-teh', name: 'Es Teh Manis', unitPrice: 4000, quantity: 2, subtotal: 8000, category: 'drink' }
      ],
      totalAmount: 56000,
      paymentMethod: 'CASH',
      status: 'DONE',
      createdAt: hoursAgo(1.5),
      completedAt: hoursAgo(1.2),
      synced: true
    },
    {
      id: `ORD-${dateStr}-05`,
      tableInfo: 'Meja 04',
      items: [
        { menuId: 'tc-kulit-porsi', name: 'Taichan Kulit (Porsi 10 tsk)', unitPrice: 16000, quantity: 2, subtotal: 32000, category: 'taichan', skewerCount: 10 },
        { menuId: 'tc-daging-satuan', name: 'Taichan Daging (Satuan / 1 tsk)', unitPrice: 2000, quantity: 5, subtotal: 10000, category: 'taichan', skewerCount: 1 },
        { menuId: 'side-lontong', name: 'Lontong', unitPrice: 3000, quantity: 2, subtotal: 6000, category: 'side' },
        { menuId: 'drink-air-mineral', name: 'Air Mineral 600ml', unitPrice: 5000, quantity: 2, subtotal: 10000, category: 'drink' }
      ],
      totalAmount: 58000,
      paymentMethod: 'QRIS',
      status: 'DONE',
      createdAt: hoursAgo(2.1),
      completedAt: hoursAgo(1.8),
      synced: true
    },
    {
      id: `ORD-${dateStr}-06`,
      tableInfo: 'Meja 01',
      items: [
        { menuId: 'tc-daging-porsi', name: 'Taichan Daging (Porsi 10 tsk)', unitPrice: 20000, quantity: 3, subtotal: 60000, category: 'taichan', skewerCount: 10 },
        { menuId: 'side-nasi-jeruk', name: 'Nasi Daun Jeruk', unitPrice: 4000, quantity: 3, subtotal: 12000, category: 'side' },
        { menuId: 'drink-nutrisari', name: 'Nutrisari Jeruk Dingin', unitPrice: 6000, quantity: 3, subtotal: 18000, category: 'drink' }
      ],
      totalAmount: 90000,
      paymentMethod: 'CASH',
      status: 'DONE',
      createdAt: hoursAgo(3.0),
      completedAt: hoursAgo(2.6),
      synced: true
    },
    {
      id: `ORD-${dateStr}-07`,
      tableInfo: 'Meja 03',
      items: [
        { menuId: 'tc-campur', name: 'Taichan Campur (10 tsk)', unitPrice: 18000, quantity: 2, subtotal: 36000, category: 'taichan', skewerCount: 10 },
        { menuId: 'drink-es-teh', name: 'Es Teh Manis', unitPrice: 4000, quantity: 2, subtotal: 8000, category: 'drink' }
      ],
      totalAmount: 44000,
      paymentMethod: 'QRIS',
      status: 'DONE',
      createdAt: hoursAgo(3.5),
      completedAt: hoursAgo(3.2),
      synced: true
    },
    {
      id: `ORD-${dateStr}-08`,
      tableInfo: 'Takeaway Mas Dani',
      items: [
        { menuId: 'tc-krispy', name: 'Taichan Krispy (10 tsk)', unitPrice: 20000, quantity: 2, subtotal: 40000, category: 'taichan', skewerCount: 10 },
        { menuId: 'side-nasi-jeruk', name: 'Nasi Daun Jeruk', unitPrice: 4000, quantity: 1, subtotal: 4000, category: 'side' }
      ],
      totalAmount: 44000,
      paymentMethod: 'CASH',
      status: 'DONE',
      createdAt: hoursAgo(4.2),
      completedAt: hoursAgo(3.9),
      synced: true
    }
  ];

  await db.orders.bulkAdd(seedOrders);
}

// Generate next order number with format ORD-DDMMYY-XX (e.g. ORD-031026-01)
export async function getNextOrderId(): Promise<string> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `ORD-${dd}${mm}${yy}`; // e.g. "ORD-031026"

  const allOrders = await db.orders.toArray();
  const todayOrders = allOrders.filter((o) => o.id && o.id.startsWith(prefix));

  const seqNums = todayOrders.map((o) => {
    const parts = o.id.split('-');
    const lastPart = parts[parts.length - 1];
    const n = parseInt(lastPart, 10);
    return isNaN(n) ? 0 : n;
  });

  const maxSeq = seqNums.length > 0 ? Math.max(...seqNums, 0) : 0;
  const nextSeq = maxSeq + 1;
  return `${prefix}-${String(nextSeq).padStart(2, '0')}`;
}
