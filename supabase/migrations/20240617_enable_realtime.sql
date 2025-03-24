
-- This function enables realtime for a specific table
CREATE OR REPLACE FUNCTION public.enable_realtime(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL;', table_name);
  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', table_name);
END;
$$;

-- Enable realtime for needed tables
SELECT enable_realtime('chats');
SELECT enable_realtime('messages');
SELECT enable_realtime('coderun_events');
SELECT enable_realtime('browser_events');
