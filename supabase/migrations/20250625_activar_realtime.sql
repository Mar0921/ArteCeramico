-- Activar Realtime en las tablas necesarias
-- Ejecuta esto en Supabase > SQL Editor

alter publication supabase_realtime add table mensajes;
alter publication supabase_realtime add table solicitudes;

-- Verificar que están agregadas
-- select * from pg_publication_tables where pubname='supabase_realtime';
