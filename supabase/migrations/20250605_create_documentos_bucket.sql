-- Create the documentos storage bucket if it doesn't exist
-- This bucket will store prescription files and attachments

-- Insert bucket (will not duplicate if exists)
insert into storage.buckets (id, name, public, file_size_limit, owner, allowed_mime_types)
values 
  ('documentos', 'documentos', true, 10485760, '', ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf'
  ])
on conflict (id) do nothing;

-- Drop existing policies if they conflict (run after checking if bucket exists)
drop policy if exists "Authenticated users can upload files" on storage.objects;
drop policy if exists "Users can read their own files" on storage.objects;
drop policy if exists "Public can read files in documentos bucket" on storage.objects;

-- Enable RLS (optional for public bucket)
-- For a public bucket with anon key access, these policies allow uploads
create policy "Allow authenticated uploads to documentos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documentos');

-- Allow public read access (needed for getPublicUrl to work)
create policy "Allow public read on documentos"
  on storage.objects for select
  to public
  using (bucket_id = 'documentos');