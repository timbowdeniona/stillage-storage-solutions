import { desc, eq, gte, or, sql, type SQL } from 'drizzle-orm';
import { getDb, type AppDatabase } from '../../db';
import {
  analyticsEvents,
  orders,
  users,
  type AnalyticsEventRecord,
  type OrderItemRecord,
  type OrderRecord,
  type UserRecord,
} from '../../db/schema';
import {
  buildSeedAnalyticsEvents,
  buildSeedOrders,
  buildSeedUsers,
} from './seedAccountsData';

export interface UpsertUserOnSignInInput {
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
  provider?: string | null;
}

export interface UpdateUserProfileInput {
  companyName?: string | null;
  phone?: string | null;
  defaultPostcode?: string | null;
  defaultTailLift?: boolean;
}

export interface CreateOrderInput {
  orderReference: string;
  userId?: number | null;
  customerEmail: string;
  companyName?: string | null;
  purchaseOrderNumber?: string | null;
  paymentMode: string;
  status?: string;
  stripeSessionId?: string | null;
  stripeInvoiceId?: string | null;
  invoiceNumber?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  itemsJson: OrderItemRecord[];
  totalUnits: number;
  subtotalExVatPence: number;
  deliveryExVatPence?: number;
  vatPence?: number;
  totalIncVatPence: number;
  postcode: string;
  deliveryZone?: string | null;
  requiresTailLift?: boolean;
}

export interface OrderStatusPatch {
  customerEmail?: string | null;
  companyName?: string | null;
  purchaseOrderNumber?: string | null;
  stripeInvoiceId?: string | null;
  invoiceNumber?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
}

export interface CustomerCountsResult {
  totalCustomers: number;
  newCustomersInPeriod: number;
  activeCustomersInPeriod: number;
  totalAdmins: number;
}

export interface InsertAnalyticsEventInput {
  eventName: string;
  userId?: number | null;
  sessionId?: string | null;
  sku?: string | null;
  productTitle?: string | null;
  optionType?: string | null;
  optionValue?: string | null;
  quantity?: number | null;
  discountPercentage?: number | null;
  totalExVatPence?: number | null;
  paymentMethod?: string | null;
  contactMethod?: string | null;
  searchQuery?: string | null;
  path?: string | null;
  createdAt?: Date;
}

interface InMemoryStore {
  users: UserRecord[];
  orders: OrderRecord[];
  analyticsEvents: AnalyticsEventRecord[];
  nextUserId: number;
  nextOrderId: number;
  nextEventId: number;
}

const globalForRepo = globalThis as unknown as {
  __sssMemoryStore?: InMemoryStore;
  __sssDbFallbackWarned?: boolean;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getMemoryStore(): InMemoryStore {
  if (!globalForRepo.__sssMemoryStore) {
    const now = new Date();
    const seededUsers = buildSeedUsers(now);
    const seededOrders = buildSeedOrders(now);
    const seededEvents = buildSeedAnalyticsEvents(now);

    globalForRepo.__sssMemoryStore = {
      users: seededUsers,
      orders: seededOrders,
      analyticsEvents: seededEvents,
      nextUserId: seededUsers.reduce((max, u) => Math.max(max, u.id), 0) + 1,
      nextOrderId: seededOrders.reduce((max, o) => Math.max(max, o.id), 0) + 1,
      nextEventId: seededEvents.reduce((max, e) => Math.max(max, e.id), 0) + 1,
    };
  }
  return globalForRepo.__sssMemoryStore;
}

function warnDbFallbackOnce(operationName: string, err: unknown): void {
  if (globalForRepo.__sssDbFallbackWarned) return;
  globalForRepo.__sssDbFallbackWarned = true;
  const details = err instanceof Error ? err.message : String(err);
  console.warn(
    `[repository] Database unavailable or not migrated yet during "${operationName}"; falling back to seeded in-memory store. (${details})`
  );
}

async function withDbFallback<T>(
  operationName: string,
  dbOperation: (db: AppDatabase) => Promise<T>,
  memoryOperation: () => T | Promise<T>
): Promise<T> {
  const db = getDb();
  if (!db) {
    return await memoryOperation();
  }

  try {
    return await dbOperation(db);
  } catch (err) {
    warnDbFallbackOnce(operationName, err);
    return await memoryOperation();
  }
}

function sortOrdersNewestFirst(rows: OrderRecord[]): OrderRecord[] {
  return [...rows].sort((a, b) => {
    const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
    return timeDiff !== 0 ? timeDiff : b.id - a.id;
  });
}

function sortEventsNewestFirst(rows: AnalyticsEventRecord[]): AnalyticsEventRecord[] {
  return [...rows].sort((a, b) => {
    const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
    return timeDiff !== 0 ? timeDiff : b.id - a.id;
  });
}

function buildOrderPatchFields(
  status: string,
  now: Date,
  patch?: OrderStatusPatch
): Partial<OrderRecord> {
  const updateFields: Partial<OrderRecord> = {
    status,
    updatedAt: now,
  };

  if (patch) {
    if (patch.customerEmail !== undefined && patch.customerEmail !== null) {
      const normalized = normalizeEmail(patch.customerEmail);
      if (normalized) {
        updateFields.customerEmail = normalized;
      }
    }
    if (patch.companyName !== undefined) updateFields.companyName = patch.companyName;
    if (patch.purchaseOrderNumber !== undefined) {
      updateFields.purchaseOrderNumber = patch.purchaseOrderNumber;
    }
    if (patch.stripeInvoiceId !== undefined) updateFields.stripeInvoiceId = patch.stripeInvoiceId;
    if (patch.invoiceNumber !== undefined) updateFields.invoiceNumber = patch.invoiceNumber;
    if (patch.hostedInvoiceUrl !== undefined) updateFields.hostedInvoiceUrl = patch.hostedInvoiceUrl;
    if (patch.invoicePdfUrl !== undefined) updateFields.invoicePdfUrl = patch.invoicePdfUrl;
  }

  return updateFields;
}

export async function upsertUserOnSignIn(input: UpsertUserOnSignInInput): Promise<UserRecord> {
  const email = normalizeEmail(input.email);
  const role = input.role || 'customer';
  const now = new Date();

  return withDbFallback(
    'upsertUserOnSignIn',
    async (db) => {
      const [row] = await db
        .insert(users)
        .values({
          email,
          name: input.name ?? null,
          image: input.image ?? null,
          role,
          provider: input.provider ?? null,
          lastLoginAt: now,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            name:
              input.name !== undefined && input.name !== null
                ? input.name
                : sql`${users.name}`,
            image:
              input.image !== undefined && input.image !== null
                ? input.image
                : sql`${users.image}`,
            role,
            provider:
              input.provider !== undefined && input.provider !== null
                ? input.provider
                : sql`${users.provider}`,
            lastLoginAt: now,
          },
        })
        .returning();
      return row;
    },
    () => {
      const store = getMemoryStore();
      const existing = store.users.find((u) => normalizeEmail(u.email) === email);
      if (existing) {
        if (input.name !== undefined && input.name !== null) existing.name = input.name;
        if (input.image !== undefined && input.image !== null) existing.image = input.image;
        if (input.provider !== undefined && input.provider !== null) {
          existing.provider = input.provider;
        }
        existing.role = role;
        existing.lastLoginAt = now;
        return { ...existing };
      }

      const created: UserRecord = {
        id: store.nextUserId++,
        email,
        name: input.name ?? null,
        image: input.image ?? null,
        role,
        provider: input.provider ?? null,
        companyName: null,
        phone: null,
        defaultPostcode: null,
        defaultTailLift: false,
        createdAt: now,
        lastLoginAt: now,
      };
      store.users.push(created);
      return { ...created };
    }
  );
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  return withDbFallback(
    'getUserByEmail',
    async (db) => {
      const rows = await db
        .select()
        .from(users)
        .where(eq(sql`lower(${users.email})`, normalized))
        .limit(1);
      return rows[0] ?? null;
    },
    () => {
      const store = getMemoryStore();
      const found = store.users.find((u) => normalizeEmail(u.email) === normalized);
      return found ? { ...found } : null;
    }
  );
}

export async function updateUserProfile(
  email: string,
  patch: UpdateUserProfileInput
): Promise<UserRecord | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const updateSet: Partial<UserRecord> = {};
  if (patch.companyName !== undefined) {
    updateSet.companyName = patch.companyName ? patch.companyName.trim() : null;
  }
  if (patch.phone !== undefined) {
    updateSet.phone = patch.phone ? patch.phone.trim() : null;
  }
  if (patch.defaultPostcode !== undefined) {
    updateSet.defaultPostcode = patch.defaultPostcode
      ? patch.defaultPostcode.trim().toUpperCase()
      : null;
  }
  if (patch.defaultTailLift !== undefined) {
    updateSet.defaultTailLift = Boolean(patch.defaultTailLift);
  }

  if (Object.keys(updateSet).length === 0) {
    return getUserByEmail(normalized);
  }

  return withDbFallback(
    'updateUserProfile',
    async (db) => {
      const rows = await db
        .update(users)
        .set(updateSet)
        .where(eq(sql`lower(${users.email})`, normalized))
        .returning();
      return rows[0] ?? null;
    },
    () => {
      const store = getMemoryStore();
      const existing = store.users.find((u) => normalizeEmail(u.email) === normalized);
      if (!existing) return null;
      Object.assign(existing, updateSet);
      return { ...existing };
    }
  );
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  const normalizedEmail = normalizeEmail(input.customerEmail);
  const normalizedPostcode = input.postcode.trim().toUpperCase();
  const now = new Date();

  let resolvedUserId = input.userId ?? null;
  if (input.userId === undefined && normalizedEmail) {
    const matchedUser = await getUserByEmail(normalizedEmail);
    resolvedUserId = matchedUser?.id ?? null;
  }

  const values = {
    orderReference: input.orderReference.trim(),
    userId: resolvedUserId,
    customerEmail: normalizedEmail,
    companyName: input.companyName ?? null,
    purchaseOrderNumber: input.purchaseOrderNumber ?? null,
    paymentMode: input.paymentMode,
    status: input.status ?? 'pending',
    stripeSessionId: input.stripeSessionId ?? null,
    stripeInvoiceId: input.stripeInvoiceId ?? null,
    invoiceNumber: input.invoiceNumber ?? null,
    hostedInvoiceUrl: input.hostedInvoiceUrl ?? null,
    invoicePdfUrl: input.invoicePdfUrl ?? null,
    itemsJson: input.itemsJson,
    totalUnits: input.totalUnits,
    subtotalExVatPence: input.subtotalExVatPence,
    deliveryExVatPence: input.deliveryExVatPence ?? 0,
    vatPence: input.vatPence ?? 0,
    totalIncVatPence: input.totalIncVatPence,
    postcode: normalizedPostcode,
    deliveryZone: input.deliveryZone ?? null,
    requiresTailLift: Boolean(input.requiresTailLift),
    createdAt: now,
    updatedAt: now,
  };

  return withDbFallback(
    'createOrder',
    async (db) => {
      const [row] = await db
        .insert(orders)
        .values(values)
        .onConflictDoUpdate({
          target: orders.orderReference,
          set: {
            userId: values.userId,
            customerEmail: values.customerEmail,
            companyName: values.companyName,
            purchaseOrderNumber: values.purchaseOrderNumber,
            paymentMode: values.paymentMode,
            status: values.status,
            stripeSessionId: values.stripeSessionId,
            stripeInvoiceId: values.stripeInvoiceId,
            invoiceNumber: values.invoiceNumber,
            hostedInvoiceUrl: values.hostedInvoiceUrl,
            invoicePdfUrl: values.invoicePdfUrl,
            itemsJson: values.itemsJson,
            totalUnits: values.totalUnits,
            subtotalExVatPence: values.subtotalExVatPence,
            deliveryExVatPence: values.deliveryExVatPence,
            vatPence: values.vatPence,
            totalIncVatPence: values.totalIncVatPence,
            postcode: values.postcode,
            deliveryZone: values.deliveryZone,
            requiresTailLift: values.requiresTailLift,
            updatedAt: now,
          },
        })
        .returning();
      return row;
    },
    () => {
      const store = getMemoryStore();
      const existing = store.orders.find((o) => o.orderReference === values.orderReference);
      if (existing) {
        Object.assign(existing, {
          ...values,
          createdAt: existing.createdAt,
          updatedAt: now,
        });
        return { ...existing };
      }

      const created: OrderRecord = {
        id: store.nextOrderId++,
        ...values,
      };
      store.orders.push(created);
      return { ...created };
    }
  );
}

export async function updateOrderStatusByStripeSession(
  stripeSessionId: string,
  status: string,
  patch?: OrderStatusPatch
): Promise<OrderRecord | null> {
  const sessionId = stripeSessionId.trim();
  if (!sessionId) return null;

  const now = new Date();
  const updateFields = buildOrderPatchFields(status, now, patch);

  return withDbFallback(
    'updateOrderStatusByStripeSession',
    async (db) => {
      const rows = await db
        .update(orders)
        .set(updateFields)
        .where(eq(orders.stripeSessionId, sessionId))
        .returning();
      return rows[0] ?? null;
    },
    () => {
      const store = getMemoryStore();
      const existing = store.orders.find((o) => o.stripeSessionId === sessionId);
      if (!existing) return null;
      Object.assign(existing, updateFields);
      return { ...existing };
    }
  );
}

export async function updateOrderStatusByStripeInvoice(
  stripeInvoiceId: string,
  status: string,
  patch?: OrderStatusPatch
): Promise<OrderRecord | null> {
  const invoiceId = stripeInvoiceId.trim();
  if (!invoiceId) return null;

  const now = new Date();
  const updateFields = buildOrderPatchFields(status, now, patch);

  return withDbFallback(
    'updateOrderStatusByStripeInvoice',
    async (db) => {
      const rows = await db
        .update(orders)
        .set(updateFields)
        .where(eq(orders.stripeInvoiceId, invoiceId))
        .returning();
      return rows[0] ?? null;
    },
    () => {
      const store = getMemoryStore();
      const existing = store.orders.find((o) => o.stripeInvoiceId === invoiceId);
      if (!existing) return null;
      Object.assign(existing, updateFields);
      return { ...existing };
    }
  );
}

export async function getOrdersForCustomer(params: {
  userId?: number | null;
  email?: string | null;
}): Promise<OrderRecord[]> {
  const validUserId =
    typeof params.userId === 'number' && Number.isFinite(params.userId)
      ? params.userId
      : null;
  const normalizedEmail = params.email ? normalizeEmail(params.email) : '';

  if (validUserId === null && !normalizedEmail) {
    return [];
  }

  return withDbFallback(
    'getOrdersForCustomer',
    async (db) => {
      const conditions: SQL[] = [];
      if (validUserId !== null) {
        conditions.push(eq(orders.userId, validUserId));
      }
      if (normalizedEmail) {
        conditions.push(eq(sql`lower(${orders.customerEmail})`, normalizedEmail));
      }

      const whereClause = conditions.length > 1 ? or(...conditions) : conditions[0];
      return db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt), desc(orders.id));
    },
    () => {
      const store = getMemoryStore();
      const matches = store.orders.filter((order) => {
        const userIdMatches = validUserId !== null && order.userId === validUserId;
        const emailMatches =
          Boolean(normalizedEmail) && normalizeEmail(order.customerEmail) === normalizedEmail;
        return userIdMatches || emailMatches;
      });
      return sortOrdersNewestFirst(matches).map((order) => ({ ...order }));
    }
  );
}

export async function listAllOrders(): Promise<OrderRecord[]> {
  return withDbFallback(
    'listAllOrders',
    async (db) => {
      return db.select().from(orders).orderBy(desc(orders.createdAt), desc(orders.id));
    },
    () => {
      const store = getMemoryStore();
      return sortOrdersNewestFirst(store.orders).map((order) => ({ ...order }));
    }
  );
}

export async function getCustomerCounts(since?: Date): Promise<CustomerCountsResult> {
  return withDbFallback(
    'getCustomerCounts',
    async (db) => {
      const rows = await db
        .select({
          role: users.role,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
        })
        .from(users);

      return aggregateCustomerCounts(rows, since);
    },
    () => {
      const store = getMemoryStore();
      return aggregateCustomerCounts(store.users, since);
    }
  );
}

function aggregateCustomerCounts(
  rows: Array<{ role: string; createdAt: Date; lastLoginAt: Date }>,
  since?: Date
): CustomerCountsResult {
  let totalCustomers = 0;
  let newCustomersInPeriod = 0;
  let activeCustomersInPeriod = 0;
  let totalAdmins = 0;

  for (const row of rows) {
    if (row.role === 'admin') {
      totalAdmins += 1;
      continue;
    }

    totalCustomers += 1;
    if (!since || row.createdAt >= since) {
      newCustomersInPeriod += 1;
    }
    if (!since || row.lastLoginAt >= since) {
      activeCustomersInPeriod += 1;
    }
  }

  return {
    totalCustomers,
    newCustomersInPeriod,
    activeCustomersInPeriod,
    totalAdmins,
  };
}

export async function insertAnalyticsEvent(
  input: InsertAnalyticsEventInput
): Promise<AnalyticsEventRecord> {
  const createdAt = input.createdAt ?? new Date();
  const values = {
    eventName: input.eventName,
    userId: input.userId ?? null,
    sessionId: input.sessionId ?? null,
    sku: input.sku ?? null,
    productTitle: input.productTitle ?? null,
    optionType: input.optionType ?? null,
    optionValue: input.optionValue ?? null,
    quantity: input.quantity ?? null,
    discountPercentage: input.discountPercentage ?? null,
    totalExVatPence: input.totalExVatPence ?? null,
    paymentMethod: input.paymentMethod ?? null,
    contactMethod: input.contactMethod ?? null,
    searchQuery: input.searchQuery ?? null,
    path: input.path ?? null,
    createdAt,
  };

  return withDbFallback(
    'insertAnalyticsEvent',
    async (db) => {
      const [row] = await db.insert(analyticsEvents).values(values).returning();
      return row;
    },
    () => {
      const store = getMemoryStore();
      const created: AnalyticsEventRecord = {
        id: store.nextEventId++,
        ...values,
      };
      store.analyticsEvents.push(created);
      return { ...created };
    }
  );
}

export async function listAnalyticsEvents(since?: Date): Promise<AnalyticsEventRecord[]> {
  return withDbFallback(
    'listAnalyticsEvents',
    async (db) => {
      if (since) {
        return db
          .select()
          .from(analyticsEvents)
          .where(gte(analyticsEvents.createdAt, since))
          .orderBy(desc(analyticsEvents.createdAt), desc(analyticsEvents.id));
      }
      return db
        .select()
        .from(analyticsEvents)
        .orderBy(desc(analyticsEvents.createdAt), desc(analyticsEvents.id));
    },
    () => {
      const store = getMemoryStore();
      const filtered = since
        ? store.analyticsEvents.filter((event) => event.createdAt >= since)
        : store.analyticsEvents;
      return sortEventsNewestFirst(filtered).map((event) => ({ ...event }));
    }
  );
}
