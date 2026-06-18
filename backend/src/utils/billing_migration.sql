-- Billing transactions table
CREATE TABLE IF NOT EXISTS billing_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  checkout_id VARCHAR(255) UNIQUE,
  payment_id VARCHAR(255),
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SAR',
  payment_brand VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
  error_code VARCHAR(50),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_billing_tenant ON billing_transactions(tenant_id);
