-- First, check if the new columns already exist
DO $$
BEGIN
    -- Check if user_message column doesn't exist but message does
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_history' AND column_name = 'user_message') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_history' AND column_name = 'message') THEN
        -- Add the new columns
        ALTER TABLE chat_history ADD COLUMN user_message TEXT;
        ALTER TABLE chat_history ADD COLUMN ai_response TEXT;
        ALTER TABLE chat_history ADD COLUMN last_message TEXT;
        
        -- Migrate data from old columns to new columns
        UPDATE chat_history SET 
            user_message = message,
            ai_response = response,
            last_message = CASE
                WHEN length(message) > 100 THEN substring(message from 1 for 100) || '...'
                ELSE message
            END;
            
        -- Make columns NOT NULL after data migration
        ALTER TABLE chat_history ALTER COLUMN user_message SET NOT NULL;
        ALTER TABLE chat_history ALTER COLUMN ai_response SET NOT NULL;
        
        -- Drop old columns (optional - may want to keep them for transition period)
        -- ALTER TABLE chat_history DROP COLUMN message;
        -- ALTER TABLE chat_history DROP COLUMN response;
    END IF;
END
$$; 