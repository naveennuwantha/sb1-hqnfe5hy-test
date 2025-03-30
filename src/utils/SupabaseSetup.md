# Supabase Setup Instructions

## Chat History Table Setup

To enable chat history functionality with the AI Assistant, you need to create a `chat_history` table in your Supabase database. Follow these steps:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the SQL script from `src/utils/createChatHistoryTable.sql`
5. Run the query

## Table Structure

The `chat_history` table has the following structure:

- `id`: UUID - Primary key, automatically generated
- `user_id`: UUID - Foreign key referencing the auth.users table
- `message`: TEXT - The user's message
- `response`: TEXT - The AI's response
- `created_at`: TIMESTAMP - When the chat was created (default: current time)

## Row Level Security (RLS)

The script also sets up Row Level Security policies to ensure that:

- Users can only see their own chat history
- Users can only insert, update, or delete their own chat history

## Testing the Setup

After setting up the table, you can test it by:

1. Using the AI Assistant in the app
2. Sending messages and receiving responses
3. Going to the Supabase dashboard and checking the `chat_history` table to verify that the messages are being saved

## Troubleshooting

If you encounter issues:

1. Check that the UUID extension is enabled in your Supabase instance
2. Verify that RLS is properly enabled
3. Ensure that your app is correctly authenticating users with Supabase
4. Check for any errors in the browser console or app logs 