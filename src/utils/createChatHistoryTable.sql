-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chat_history;
DROP POLICY IF EXISTS "Users can create their own chats" ON public.chat_history;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chat_history;

-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    last_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY "Users can view their own chats"
ON public.chat_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for insert
CREATE POLICY "Users can create their own chats"
ON public.chat_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for delete
CREATE POLICY "Users can delete their own chats"
ON public.chat_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.chat_history TO authenticated; 