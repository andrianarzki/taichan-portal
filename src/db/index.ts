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
  // Fresh clean start - no dummy or mock orders
  return;
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
