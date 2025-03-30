import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiAssistant } from '../services/aiAssistantService';
import { supabase } from '../services/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';
import NexiaIcon from '../components/NexiaIcon';

// DeleteButton component for direct Supabase deletion
const DeleteButton = ({ chatId, onSuccess, iconOnly = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!chatId) {
      Alert.alert('Error', 'Please provide a chat ID');
      return;
    }

    try {
      setIsDeleting(true);
      
      // Verify chat exists
      const { data: chatData, error: fetchError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', chatId)
        .single();

      if (fetchError || !chatData) {
        throw new Error(fetchError?.message || 'Chat not found');
      }

      // Perform deletion
      const { error: deleteError } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', chatId);

      if (deleteError) throw new Error(deleteError.message);

      Alert.alert('Success', `Chat ${chatId} deleted!`);
      if (onSuccess) onSuccess(); // Call the callback function if provided
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TouchableOpacity
      style={iconOnly ? styles.deleteButton : styles.button}
      onPress={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : iconOnly ? (
        <Ionicons name="trash-outline" size={20} color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Delete Chat</Text>
      )}
    </TouchableOpacity>
  );
};

export default function AIAssistantScreen() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Assistant. How can I help you today?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showRecentChats, setShowRecentChats] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const scrollViewRef = useRef();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadRecentChats();
    testConnection();
    getUserProfile();
    checkDatabasePermissions();
  }, []);

  const testConnection = async () => {
    try {
      setIsTesting(true);
      const connected = await aiAssistant.testConnection();
      setIsConnected(connected);
      if (!connected) {
        Alert.alert(
          'Connection Error',
          'Failed to connect to the AI service. Please check your internet connection and try again.'
        );
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setIsConnected(false);
      Alert.alert(
        'Connection Error',
        error.message || 'Failed to connect to the AI service. Please check your internet connection and try again.'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const loadRecentChats = async () => {
    try {
      setLoadingChats(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        Alert.alert('Error', 'Failed to get user information');
        return;
      }
      
      if (!user) {
        console.log('No user logged in');
        Alert.alert('Error', 'Please log in to view chat history');
        return;
      }
      
      console.log('Fetching chats for user:', user.id);
      
      // Fetch chat history
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error('Error fetching chats:', error);
        Alert.alert('Error', 'Failed to load chat history');
        return;
      }
      
      console.log('Fetched chats:', data?.length || 0);
      setRecentChats(data || []);
    } catch (error) {
      console.error('Error in loadRecentChats:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading chats');
    } finally {
      setLoadingChats(false);
    }
  };

  const getUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
    }
  };

  const startNewChat = () => {
    setMessages([
      { id: 1, text: "Hello! I'm your AI Assistant. How can I help you today?", isBot: true }
    ]);
  };

  const loadChatHistory = (chat) => {
    setShowRecentChats(false);
    
    // Handle both old and new column naming
    const userMessage = chat.user_message || chat.message;
    const botResponse = chat.ai_response || chat.response;
    
    setMessages([
      { id: 1, text: "Hello! I'm your AI Assistant. How can I help you today?", isBot: true },
      { id: 2, text: userMessage, isBot: false },
      { id: 3, text: botResponse, isBot: true }
    ]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!isConnected) {
      Alert.alert(
        'Connection Error',
        'Please wait while we reconnect to the AI service...'
      );
      await testConnection();
      if (!isConnected) {
        return;
      }
    }

    const userMessage = {
      id: messages.length + 1,
      text: inputText.trim(),
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error('Failed to get user information');
      }
      
      if (!user) {
        throw new Error('Please log in to use the AI Assistant');
      }

      console.log('Sending message:', currentInput);
      const responseText = await aiAssistant.chat(currentInput, user.id);
      console.log('Received response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from AI');
      }

      const botMessage = {
        id: messages.length + 2,
        text: responseText,
        isBot: true,
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Reload recent chats
      loadRecentChats();
    } catch (error) {
      console.error('Chat error:', error);
      
      Alert.alert(
        'Error',
        error.message || 'Unable to get a response from the AI. Please try again.'
      );
      
      const errorMessage = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble generating a response. Please try again.",
        isBot: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageIcon = (isBot) => {
    if (isBot) {
      return (
        <View style={[styles.messageIcon, { backgroundColor: theme.primary }]}>
          <NexiaIcon size={24} color="#fff" backgroundColor={theme.primary} />
        </View>
      );
    } else {
      return (
        <View style={[styles.messageIcon, { backgroundColor: theme.primary }]}>
          {userProfile?.avatar_url ? (
            <Image
              source={{ uri: userProfile.avatar_url }}
              style={styles.userAvatar}
            />
          ) : (
            <Ionicons name="person" size={16} color="#fff" />
          )}
        </View>
      );
    }
  };

  const deleteChat = async (chatId) => {
    try {
      console.log('=== DELETE CHAT DEBUG ===');
      console.log('1. Delete chat function called with ID:', chatId);
      
      if (!chatId) {
        console.error('Invalid chat ID');
        Alert.alert('Error', 'Invalid chat ID');
        return;
      }
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('2. Current user:', user?.id);
      
      if (userError) {
        console.error('3. User auth error:', userError);
        Alert.alert('Error', 'Authentication error. Please login again.');
        return;
      }
      
      if (!user) {
        console.error('3. No user found');
        Alert.alert('Error', 'Please login to delete chats');
        return;
      }

      console.log('4. Checking if chat exists before deleting');
      
      // First verify the chat exists and belongs to the user
      const { data: chatData, error: fetchError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', chatId)
        .single();

      console.log('5. Chat fetch result:', chatData ? 'Found' : 'Not found', fetchError ? `Error: ${fetchError.message}` : 'No error');

      if (fetchError) {
        console.error('5. Error fetching chat:', fetchError);
        Alert.alert('Error', 'Failed to verify chat ownership');
        return;
      }

      if (!chatData) {
        console.error('6. Chat not found');
        Alert.alert('Error', 'Chat not found');
        return;
      }

      if (chatData.user_id !== user.id) {
        console.error('7. Chat does not belong to user');
        Alert.alert('Error', 'You do not have permission to delete this chat');
        return;
      }
      
      console.log('8. Attempting database delete...');
      console.log('8a. Supabase client initialized:', !!supabase);
      
      // Print chat details for debugging
      console.log('8b. Chat to delete:', {
        id: chatData.id,
        user_id: chatData.user_id,
        created_at: chatData.created_at
      });
      
      // Delete from database - with timeout for debugging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delete operation timed out')), 10000)
      );
      
      const deletePromise = supabase
        .from('chat_history')
        .delete()
        .eq('id', chatId);
      
      const { error: deleteError } = await Promise.race([deletePromise, timeoutPromise]);

      if (deleteError) {
        console.error('9. Delete failed:', deleteError);
        Alert.alert('Error', `Failed to delete chat: ${deleteError.message}`);
        return;
      }

      console.log('10. Database delete successful');
      
      // Update local state
      setRecentChats(prevChats => {
        const newChats = prevChats.filter(chat => chat.id !== chatId);
        console.log('11. Updated local state. Chats count:', newChats.length);
        return newChats;
      });
      
      // Show success message
      console.log('12. Delete operation complete');
      Alert.alert('Success', 'Chat deleted successfully');
      
    } catch (error) {
      console.error('ERROR in deleteChat:', error);
      Alert.alert('Error', `Failed to delete chat: ${error.message}`);
    }
  };

  const handleDeleteChat = async (chat) => {
    if (isDeleting) return; // Prevent multiple delete attempts
    
    console.log('handleDeleteChat called with chat ID:', chat.id);
    
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Delete cancelled')
        },
        { 
          text: 'Delete', 
          onPress: async () => {
            console.log('Delete confirmed for chat ID:', chat.id);
            setIsDeleting(true);
            try {
              await deleteChat(chat.id);
            } catch (error) {
              console.error('Error in handleDeleteChat:', error);
              Alert.alert('Error', 'Failed to delete chat. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const checkDatabasePermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        return false;
      }

      // Test select permission
      const { data: selectTest, error: selectError } = await supabase
        .from('chat_history')
        .select('*')
        .limit(1);

      if (selectError) {
        console.error('Select permission error:', selectError);
        return false;
      }

      // Test delete permission
      const { error: deleteError } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Test with non-existent ID

      if (deleteError && !deleteError.message.includes('No rows found')) {
        console.error('Delete permission error:', deleteError);
        return false;
      }

      console.log('Database permissions check passed');
      return true;
    } catch (error) {
      console.error('Database permissions check failed:', error);
      return false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />
      
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <View style={[styles.customHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>AI Assistant</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={testConnection}
              disabled={isTesting}
            >
              <Ionicons 
                name={isTesting ? "sync" : isConnected ? "checkmark-circle" : "alert-circle"} 
                size={24} 
                color={isTesting ? theme.textSecondary : isConnected ? "#4CAF50" : "#F44336"} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                loadRecentChats();
                setShowRecentChats(true);
              }}
            >
              <Ionicons name="time-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={startNewChat}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isBot 
                    ? [styles.botBubble, { 
                        backgroundColor: theme.messageBubbleBot,
                        borderColor: theme.messageBubbleBotBorder 
                      }]
                    : [styles.userBubble, { backgroundColor: theme.messageBubbleUser }]
                ]}
              >
                {renderMessageIcon(message.isBot)}
                <Text style={[
                  styles.messageText,
                  message.isBot 
                    ? [styles.botText, { color: theme.messageTextBot }]
                    : [styles.userText, { color: theme.messageTextUser }]
                ]}>
                  {message.text}
                </Text>
              </View>
            ))}
            {isTyping && (
              <View style={[
                styles.messageBubble,
                styles.botBubble,
                { 
                  backgroundColor: theme.messageBubbleBot,
                  borderColor: theme.messageBubbleBotBorder 
                }
              ]}>
                {renderMessageIcon(true)}
                <Text style={[styles.messageText, styles.botText, { color: theme.messageTextBot }]}>
                  Typing...
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={[
            styles.inputContainer,
            { 
              backgroundColor: theme.surface,
              borderTopColor: theme.border 
            }
          ]}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.inputBackground,
                  color: theme.text 
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={theme.textSecondary}
              multiline
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isTyping) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons
                name="send"
                size={24}
                color={!inputText.trim() || isTyping ? theme.textSecondary : theme.primary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={showRecentChats}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRecentChats(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Recent Chats</Text>
                <TouchableOpacity
                  onPress={() => setShowRecentChats(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              {loadingChats ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <ScrollView style={styles.recentChatsContainer}>
                  {recentChats.map((chat) => (
                    <View
                      key={chat.id}
                      style={[styles.recentChatItem, { backgroundColor: theme.cardBackground }]}
                    >
                      <TouchableOpacity
                        style={styles.recentChatContent}
                        onPress={() => {
                          setShowRecentChats(false);
                          loadChatHistory(chat);
                        }}
                      >
                        <Text style={[styles.recentChatText, { color: theme.text }]} numberOfLines={2}>
                          {chat.user_message || chat.message || "No message content"}
                        </Text>
                        <Text style={[styles.recentChatDate, { color: theme.textSecondary }]}>
                          {new Date(chat.created_at).toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>
                      <DeleteButton
                        chatId={chat.id}
                        onSuccess={loadRecentChats}
                        iconOnly={true}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '85%',
    borderRadius: 16,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    flex: 1,
  },
  botText: {
    color: '#000',
  },
  userText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  recentChatsContainer: {
    flex: 1,
  },
  recentChatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  recentChatContent: {
    flex: 1,
    marginRight: 12,
  },
  recentChatText: {
    fontSize: 16,
    marginBottom: 4,
  },
  recentChatDate: {
    fontSize: 12,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    marginLeft: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    padding: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 