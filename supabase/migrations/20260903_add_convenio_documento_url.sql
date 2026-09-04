-- Add convenio columns to clientes table
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS convenio_firmado BOOLEAN DEFAULT FALSE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS convenio_documento_url TEXT;
