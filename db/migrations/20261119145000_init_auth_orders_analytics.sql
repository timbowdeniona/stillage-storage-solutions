CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  provider TEXT,
  company_name TEXT,
  phone TEXT,
  default_postcode TEXT,
  default_tail_lift BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_reference TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  company_name TEXT,
  purchase_order_number TEXT,
  payment_mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  invoice_number TEXT,
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,
  items_json JSONB NOT NULL,
  total_units INTEGER NOT NULL,
  subtotal_ex_vat_pence INTEGER NOT NULL,
  delivery_ex_vat_pence INTEGER NOT NULL DEFAULT 0,
  vat_pence INTEGER NOT NULL DEFAULT 0,
  total_inc_vat_pence INTEGER NOT NULL,
  postcode TEXT NOT NULL,
  delivery_zone TEXT,
  requires_tail_lift BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id INTEGER,
  session_id TEXT,
  sku TEXT,
  product_title TEXT,
  option_type TEXT,
  option_value TEXT,
  quantity INTEGER,
  discount_percentage INTEGER,
  total_ex_vat_pence INTEGER,
  payment_method TEXT,
  contact_method TEXT,
  search_query TEXT,
  path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events (event_name);
