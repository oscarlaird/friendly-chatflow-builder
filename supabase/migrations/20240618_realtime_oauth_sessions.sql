
-- Enable row-level changes for the oauth_sessions table
ALTER TABLE public.oauth_sessions REPLICA IDENTITY FULL;

-- Add the table to the publication that Supabase listens to
ALTER PUBLICATION supabase_realtime ADD TABLE public.oauth_sessions;
