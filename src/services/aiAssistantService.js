import { supabase } from './supabaseClient';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

export const aiAssistant = {
  async chat(message, userId) {
    try {
      if (!message || typeof message !== 'string') {
        throw new Error('Invalid message format');
      }

      const requestBody = {
        contents: [{
          parts: [{
            text: message
          }]
        }]
      };

      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid JSON response from API');
      }
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from AI');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      // Save chat to Supabase
      if (userId) {
        try {
          const { error: saveError } = await supabase
            .from('chat_history')
            .insert({
              user_id: userId,
              user_message: message,
              ai_response: aiResponse,
              last_message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
              created_at: new Date().toISOString()
            });

          if (saveError) {
            console.error('Error saving chat history:', saveError);
          }
        } catch (error) {
          console.error('Error saving chat to Supabase:', error);
        }
      }

      return aiResponse;
    } catch (error) {
      console.error('AI Assistant Error:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error - Failed to connect to AI service');
      }
      throw error;
    }
  },

  async testConnection() {
    try {
      const response = await this.chat('Hello, this is a test message. Please respond with a simple greeting.');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async analyzeProfile(profile) {
    try {
      const prompt = `Please analyze this professional profile and provide suggestions for improvement:
      Name: ${profile.full_name || 'Not provided'}
      Skills: ${profile.skills || 'Not provided'}
      Education: ${profile.education || 'Not provided'}
      Experience: ${profile.experience || 'Not provided'}
      Bio: ${profile.bio || 'Not provided'}

      Please provide specific suggestions for:
      1. Profile completeness
      2. Skills presentation
      3. Professional image
      4. Areas for improvement`;

      return await this.chat(prompt);
    } catch (error) {
      console.error('Profile Analysis Error:', error);
      throw error;
    }
  }
}; 