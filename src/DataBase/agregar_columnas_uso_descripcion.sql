-- Script para agregar las columnas 'uso' y 'descripcion' a la tabla autobuses
-- Ejecuta este script en tu base de datos PostgreSQL

ALTER TABLE autobuses 
ADD COLUMN IF NOT EXISTS uso VARCHAR(100),
ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'autobuses'
ORDER BY ordinal_position;
