import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export interface OrderItemRecord {
  sku: string;
  title: string;
  slug: string;
  quantity: number;
  basePriceExVatPence: number;
  finishOption: string;
  finishName: string;
  mobilityOption: string;
  mobilityName: string;
  primaryImage?: string;
  discountedUnitExVatPence: number;
  lineSubtotalExVatPence: number;
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  role: text('role').notNull().default('customer'),
  provider: text('provider'),
  companyName: text('company_name'),
  phone: text('phone'),
  defaultPostcode: text('default_postcode'),
  defaultTailLift: boolean('default_tail_lift').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    orderReference: text('order_reference').notNull().unique(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    customerEmail: text('customer_email').notNull(),
    companyName: text('company_name'),
    purchaseOrderNumber: text('purchase_order_number'),
    paymentMode: text('payment_mode').notNull(),
    status: text('status').notNull().default('pending'),
    stripeSessionId: text('stripe_session_id'),
    stripeInvoiceId: text('stripe_invoice_id'),
    invoiceNumber: text('invoice_number'),
    hostedInvoiceUrl: text('hosted_invoice_url'),
    invoicePdfUrl: text('invoice_pdf_url'),
    itemsJson: jsonb('items_json').$type<OrderItemRecord[]>().notNull(),
    totalUnits: integer('total_units').notNull(),
    subtotalExVatPence: integer('subtotal_ex_vat_pence').notNull(),
    deliveryExVatPence: integer('delivery_ex_vat_pence').notNull().default(0),
    vatPence: integer('vat_pence').notNull().default(0),
    totalIncVatPence: integer('total_inc_vat_pence').notNull(),
    postcode: text('postcode').notNull(),
    deliveryZone: text('delivery_zone'),
    requiresTailLift: boolean('requires_tail_lift').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_orders_customer_email').on(table.customerEmail),
    index('idx_orders_user_id').on(table.userId),
    index('idx_orders_created_at').on(table.createdAt),
  ]
);

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: serial('id').primaryKey(),
    eventName: text('event_name').notNull(),
    userId: integer('user_id'),
    sessionId: text('session_id'),
    sku: text('sku'),
    productTitle: text('product_title'),
    optionType: text('option_type'),
    optionValue: text('option_value'),
    quantity: integer('quantity'),
    discountPercentage: integer('discount_percentage'),
    totalExVatPence: integer('total_ex_vat_pence'),
    paymentMethod: text('payment_method'),
    contactMethod: text('contact_method'),
    searchQuery: text('search_query'),
    path: text('path'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_analytics_events_created_at').on(table.createdAt),
    index('idx_analytics_events_event_name').on(table.eventName),
  ]
);

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;
export type OrderRecord = typeof orders.$inferSelect;
export type NewOrderRecord = typeof orders.$inferInsert;
export type AnalyticsEventRecord = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEventRecord = typeof analyticsEvents.$inferInsert;
