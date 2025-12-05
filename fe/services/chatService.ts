'use server';
import { requestWithCredentials } from '@/helpers/request';
import { getUserInfo } from '@/helpers/auth';

export interface NewChatRequest {
  agent_id: string;
  client_id: string;
  message: string;
  channel: string;
  user_id: string;
}

export interface NewChatResponse {
  success: boolean;
  message: string;
  data: {
    chat_id: string;
    responses: string[];
    agent_id: string;
    is_first_message: boolean;
    bubble_count: number;
    token_usage: {
      input_tokens: number;
      output_tokens: number;
      total_cost: number;
    };
    timestamp: string;
  };
  error: any;
}

export interface ContinueChatRequest {
  chat_id: string;
  message: string;
}

export interface ContinueChatResponse {
  success: boolean;
  message: string;
  data: {
    chat_id: string;
    responses: string[];
    agent_id: string;
    bubble_count: number;
    token_usage: {
      input_tokens: number;
      output_tokens: number;
      total_cost: number;
    };
    timestamp: string;
  };
  error: any;
}

export interface ChatMessage {
  id: string;
  message: string;
  message_direction: 'incoming' | 'outgoing';
  agent_id: string;
  agent_type: 'human' | 'ai';
  created_at: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  message: string;
  data: {
    chat_id: string;
    messages: ChatMessage[];
    total_messages: number;
    status: string;
  };
  error: any;
}

/**
 * Start a new chat session
 */
export async function startNewChat(agentId: string, message: string): Promise<NewChatResponse> {
  try {
    const userInfo = await getUserInfo();
    
    if (!userInfo) {
      throw new Error('User not authenticated');
    }

    const requestBody: NewChatRequest = {
      agent_id: agentId,
      client_id: userInfo.company_id || userInfo.id, // Use company_id if available, fallback to user_id
      message: message,
      channel: 'web',
      user_id: userInfo.id
    };

    const url = `${process.env.ML_SERVICE_URL}chat/new`;
    console.log('Starting new chat:', url, requestBody);
    
    const response = await requestWithCredentials(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`New chat API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('New chat response:', data);
    
    return data;
  } catch (error) {
    console.error('Error starting new chat:', error);
    throw error;
  }
}

/**
 * Continue existing chat
 */
export async function continueChat(chatId: string, message: string): Promise<ContinueChatResponse> {
  try {
    const requestBody: ContinueChatRequest = {
      chat_id: chatId,
      message: message
    };

    const url = `${process.env.ML_SERVICE_URL}chat/continue-streaming`;
    console.log('Continuing chat:', url, requestBody);
    
    const response = await requestWithCredentials(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`Continue chat API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Continue chat response:', data);
    
    return data;
  } catch (error) {
    console.error('Error continuing chat:', error);
    throw error;
  }
}

/**
 * Get chat history
 */
export async function getChatHistory(chatId: string): Promise<ChatHistoryResponse> {
  try {
    const url = `${process.env.ML_SERVICE_URL}chat/history/${chatId}`;
    console.log('Getting chat history:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Chat history API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Chat history response:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
} 