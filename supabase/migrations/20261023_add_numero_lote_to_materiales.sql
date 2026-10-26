-- Agregar número de lote a materiales
ALTER TABLE public."materiales"
ADD COLUMN IF NOT EXISTS numero_lote text;

