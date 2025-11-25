-- Agregar columnas codigo y modelo a la tabla repuestos
ALTER TABLE repuestos
ADD COLUMN codigo VARCHAR(100),
ADD COLUMN modelo VARCHAR(100);
