import { supabase } from './supabaseClient';

const API_KEY = 'AIzaSyCrof62ht22as8QGr89BBxUm3AsDOamSDw';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateResponse(prompt) {
  try {
    console.log('Sending message to Gemini AI:', prompt);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from API');
    }

    console.log('Parsed API Response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response format from AI');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function startChat() {
  try {
    // Test the connection
    const response = await generateResponse('Hello, this is a test message.');
    if (response) {
      return { sendMessage: generateResponse };
    }
    throw new Error('Failed to initialize chat');
  } catch (error) {
    console.error('Error starting chat:', error);
    throw error;
  }
} 