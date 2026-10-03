import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { db } from '../db';
import { Order } from '../types';

export interface SyncStatusState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  supabaseConfigured: boolean;
  message: string;
}

// Storage keys for optional live Supabase credentials
const STORAGE_KEY_SUPABASE_URL = 'taichan_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'taichan_supabase_key';

const DEFAULT_SUPABASE_URL = 'https://psbwmursjhotbrzidjcb.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYndtdXJzamhvdGJyemlkamNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTc2MzgsImV4cCI6MjEwNjUzMzYzOH0.r-JXSul59phhWivlBeKcPR0ei9ZTEvO_c-Nxp9Gj4qw';

let supabaseClient: SupabaseClient | null = null;
let realtimeChannel: RealtimeChannel | null = null;

export function getSupabaseCredentials() {
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_KEY;
  const url = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || envUrl;
  const key = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || envKey;
  return { url: url.trim(), key: key.trim() };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient) {
    const creds = getSupabaseCredentials();
    if (creds.url && creds.key) {
      try {
        supabaseClient = createClient(creds.url, creds.key);
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        supabaseClient = null;
      }
    }
  }
  return supabaseClient;
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, key.trim());
    try {
      supabaseClient = createClient(url.trim(), key.trim());
    } catch {
      supabaseClient = null;
    }
  } else {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
    supabaseClient = null;
  }
}

// Initial client initialization
getSupabaseClient();

export function isSupabaseActive(): boolean {
  return getSupabaseClient() !== null;
}

/**
 * Helper to map a Supabase record to local TypeScript Order format
 */
export function mapSupabaseRowToOrder(row: any): Order {
  return {
    id: row.id,
    tableInfo: row.table_info || '',
    items: Array.isArray(row.items) ? row.items : [],
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: row.payment_method || 'CASH',
    // Support both 'completed' and 'DONE' for completed status
    status: (row.status === 'completed' || row.status === 'DONE') ? 'DONE' : 'ACTIVE',
    createdAt: row.created_at || new Date().toISOString(),
    completedAt: row.completed_at || undefined,
    notes: row.notes || undefined,
    synced: true
  };
}

/**
 * Push a single order to Supabase.
 * - When newly added: status is 'ACTIVE'
 * - When finished in kitchen: status is 'completed' (with automatic fallback to 'DONE' if SQL check constraint requires it)
 */
export async function pushOrderToSupabase(order: Order): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client is not configured.');
    return false;
  }

  // If order is finished (DONE), try 'completed' as user requested
  const targetStatus = order.status === 'DONE' ? 'completed' : order.status;

  const payload: any = {
    id: order.id,
    table_info: order.tableInfo,
    items: order.items,
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    status: targetStatus,
    created_at: order.createdAt,
    completed_at: order.completedAt || null,
    notes: order.notes || null
  };

  try {
    let { error } = await client.from('orders').upsert(payload);

    // If constraint orders_status_check fails because DB only accepts 'DONE' / 'ACTIVE', retry with 'DONE'
    if (error && error.message?.includes('orders_status_check') && targetStatus === 'completed') {
      payload.status = 'DONE';
      const retryResult = await client.from('orders').upsert(payload);
      error = retryResult.error;
    }

    if (error) {
      console.error(`Gagal upsert pesanan ${order.id} ke Supabase:`, error.message);
      return false;
    }

    // Successfully saved to Supabase - update local record to synced: true
    await db.orders.update(order.id, { synced: true });
    return true;
  } catch (err) {
    console.error(`Koneksi error saat mengirim ${order.id} ke Supabase:`, err);
    return false;
  }
}

/**
 * Sync Manager: Scans unsynced orders in Dexie and pushes to Supabase.
 * Uses .filter(o => !o.synced) on db.orders.toArray() to avoid IndexedDB boolean index issues.
 */
export async function syncPendingOrders(): Promise<{ syncedCount: number; error?: string }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { syncedCount: 0, error: 'Perangkat sedang offline' };
  }

  try {
    const allOrders = await db.orders.toArray();
    const unsyncedOrders = allOrders.filter((o) => !o.synced);

    if (unsyncedOrders.length === 0) {
      return { syncedCount: 0 };
    }

    const client = getSupabaseClient();
    if (client) {
      let successfulCount = 0;
      for (const order of unsyncedOrders) {
        const success = await pushOrderToSupabase(order);
        if (success) {
          successfulCount++;
        }
      }
      return { syncedCount: successfulCount };
    } else {
      // Supabase credentials not set: mark synced locally
      await new Promise((r) => setTimeout(r, 400));
      for (const order of unsyncedOrders) {
        await db.orders.update(order.id, { synced: true });
      }
      return { syncedCount: unsyncedOrders.length };
    }
  } catch (err: any) {
    console.error('Error in syncPendingOrders:', err);
    return { syncedCount: 0, error: err?.message || 'Gagal sinkronisasi data' };
  }
}

/**
 * PULL Manager: Downloads all orders from Supabase and syncs into local Dexie.
 * Enables other devices (Kitchen phone, boss PC, Waiter 2) to see all live orders.
 */
export async function pullOrdersFromSupabase(): Promise<{ pulledCount: number; error?: string }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { pulledCount: 0, error: 'Perangkat sedang offline' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { pulledCount: 0 };
  }

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to pull orders from Supabase:', error);
      return { pulledCount: 0, error: error.message };
    }

    if (!data || data.length === 0) {
      return { pulledCount: 0 };
    }

    // Get current local unsynced orders to protect them from being overwritten
    const localOrders = await db.orders.toArray();
    const unsyncedLocalIds = new Set(localOrders.filter((o) => !o.synced).map((o) => o.id));

    const cloudOrdersToStore: Order[] = [];
    for (const row of data) {
      // If this device has an offline pending change for this order, preserve local change
      if (!unsyncedLocalIds.has(row.id)) {
        cloudOrdersToStore.push(mapSupabaseRowToOrder(row));
      }
    }

    if (cloudOrdersToStore.length > 0) {
      await db.orders.bulkPut(cloudOrdersToStore);
    }

    return { pulledCount: cloudOrdersToStore.length };
  } catch (err: any) {
    console.error('Error in pullOrdersFromSupabase:', err);
    return { pulledCount: 0, error: err?.message };
  }
}

/**
 * Two-way sync: Push any local unsynced orders first, then pull all cloud orders
 */
export async function syncAllBidirectional(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  try {
    await syncPendingOrders();
    await pullOrdersFromSupabase();
  } catch (err) {
    console.error('Error in syncAllBidirectional:', err);
  }
}

/**
 * Realtime Subscription Manager:
 * Connects to Supabase Realtime WebSocket to receive instant INSERT, UPDATE, DELETE broadcasts.
 */
export function subscribeToOrdersRealtime(onSync?: () => void): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  // Remove existing channel if any
  if (realtimeChannel) {
    try {
      client.removeChannel(realtimeChannel);
    } catch {
      // ignore
    }
    realtimeChannel = null;
  }

  try {
    realtimeChannel = client
      .channel('taichan-portal-live-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const row = payload.new;
              if (row && row.id) {
                const order = mapSupabaseRowToOrder(row);
                await db.orders.put(order);
              }
            } else if (payload.eventType === 'DELETE') {
              const oldId = payload.old?.id;
              if (oldId) {
                await db.orders.delete(oldId);
              }
            }
            if (onSync) {
              onSync();
            }
          } catch (err) {
            console.error('Error processing realtime event:', err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected to live order channel.');
        }
      });

    return () => {
      if (realtimeChannel) {
        try {
          client.removeChannel(realtimeChannel);
        } catch {
          // ignore
        }
        realtimeChannel = null;
      }
    };
  } catch (err) {
    console.error('Failed to subscribe to Supabase Realtime:', err);
    return () => {};
  }
}

/**
 * Cross-Device Sync Initializer:
 * 1. Pulls all orders on mount
 * 2. Subscribes to live WebSocket events
 * 3. Sets up background polling (every 8s) as resilient fallback
 */
export function initCrossDeviceSync(onUpdate?: () => void): () => void {
  // 1. Initial Pull
  syncAllBidirectional().then(() => {
    onUpdate?.();
  });

  // 2. Realtime WebSocket Listener
  const unsubscribeRealtime = subscribeToOrdersRealtime(() => {
    onUpdate?.();
  });

  // 3. Resilient Polling Fallback (every 8s while online)
  const pollInterval = setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      pullOrdersFromSupabase().then((res) => {
        if (res.pulledCount > 0) {
          onUpdate?.();
        }
      });
    }
  }, 8000);

  return () => {
    unsubscribeRealtime();
    clearInterval(pollInterval);
  };
}
