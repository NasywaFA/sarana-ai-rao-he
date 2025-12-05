'use server';
import { getAuthToken } from '@/helpers/auth';
import { requestWithCredentials } from '@/helpers/request';

export interface AIAgent {
  id: string;
  name: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface KnowledgeBase {
  id: string;
  type: 'text' | 'qna' | 'website';
  content?: string;
  question?: string;
  answer?: string;
  url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIAgentDetail {
  id: string;
  name: string;
  persona: string;
  welcome_message: string;
  agent_transfer_condition: string;
  is_active: boolean;
  user_id: string;
  company_id: string;
  created_by_name: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  knowledge_bases: KnowledgeBase[];
}

export interface AIAgentsResponse {
  code: number;
  status: string;
  message: string;
  results: AIAgent[];
  page: number;
  limit: number;
  total_pages: number;
  total_results: number;
}

export interface AIAgentDetailResponse {
  code: number;
  status: string;
  message: string;
  data: AIAgentDetail;
}

export interface CreateAIAgentResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    persona: string;
    welcome_message: string;
    agent_transfer_condition: string;
    is_active: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
}

export interface UpdateAIAgentData {
  name: string;
  persona: string;
  welcome_message: string;
  agent_transfer_condition: string;
  is_active: boolean;
}

export interface UpdateAIAgentResponse {
  success: boolean;
  message: string;
  data?: AIAgentDetail;
}

export interface CreateKnowledgeBaseData {
  ai_agent_id: string;
  type: 'text' | 'qna' | 'website';
  content?: string;
  question?: string;
  answer?: string;
  url?: string;
}

export interface CreateKnowledgeBaseResponse {
  success: boolean;
  message: string;
  data?: KnowledgeBase;
}

export interface UpdateKnowledgeBaseData {
  type: 'text' | 'qna' | 'website';
  is_active: boolean;
  content?: string;
  question?: string;
  answer?: string;
  url?: string;
}

export interface UpdateKnowledgeBaseResponse {
  success: boolean;
  message: string;
  data?: KnowledgeBase;
}

/**
 * Get AI Agent Detail
 */
export async function getAIAgentDetail(agentId: string): Promise<AIAgentDetailResponse> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}ai-agents/${agentId}`;
    console.log('Fetching AI Agent Detail from:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`AI Agent Detail API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Agent Detail response:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching AI agent detail:', error);
    throw error;
  }
}

/**
 * Update AI Agent
 */
export async function updateAIAgent(agentId: string, updateData: UpdateAIAgentData): Promise<UpdateAIAgentResponse> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}ai-agents/${agentId}`;
    console.log('Updating AI Agent:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    console.log('Update AI Agent response:', data);

    if (!response.ok) {
      console.error(`Update AI Agent API error: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        message: data.message || 'Gagal mengupdate AI Agent' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'AI Agent berhasil diupdate',
      data: data.data
    };
  } catch (error) {
    console.error('Error updating AI agent:', error);
    return { 
      success: false, 
      message: 'Gagal mengupdate AI Agent' 
    };
  }
}

/**
 * Create a new AI Agent
 */
export async function createAIAgent(name: string): Promise<CreateAIAgentResponse> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}ai-agents`;
    console.log('Creating AI Agent:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
      }),
    });

    const data = await response.json();
    console.log('Create AI Agent response:', data);

    if (!response.ok) {
      console.error(`Create AI Agent API error: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        message: data.message || 'Gagal membuat AI Agent' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'AI Agent berhasil dibuat',
      data: data.data
    };
  } catch (error) {
    console.error('Error creating AI agent:', error);
    return { 
      success: false, 
      message: 'Gagal membuat AI Agent' 
    };
  }
}

/**
 * Get list of AI Agents
 */
export async function getAIAgents(page: number = 1, limit: number = 10): Promise<AIAgentsResponse> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}ai-agents?page=${page}&limit=${limit}`;
    console.log('Fetching AI Agents from:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`AI Agents API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Agents response:', data);
    
    // Handle null results from API
    return {
      ...data,
      results: data.results || [] // Ensure results is always an array
    };
  } catch (error) {
    console.error('Error fetching AI agents:', error);
    throw error;
  }
}

/**
 * Delete an AI Agent
 */
export async function deleteAIAgent(agentId: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}ai-agents/${agentId}`;
    console.log('Deleting AI Agent:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Delete AI Agent API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Delete AI Agent response:', data);
    
    return { success: true, message: data.message || 'AI Agent deleted successfully' };
  } catch (error) {
    console.error('Error deleting AI agent:', error);
    return { success: false, message: 'Failed to delete AI agent' };
  }
}

/**
 * Create a new Knowledge Base
 */
export async function createKnowledgeBase(knowledgeData: CreateKnowledgeBaseData): Promise<CreateKnowledgeBaseResponse> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}knowledge-bases`;
    console.log('Creating Knowledge Base:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(knowledgeData),
    });

    const data = await response.json();
    console.log('Create Knowledge Base response:', data);

    if (!response.ok) {
      console.error(`Create Knowledge Base API error: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        message: data.message || 'Gagal membuat Knowledge Base' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'Knowledge Base berhasil dibuat',
      data: data.data
    };
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    return { 
      success: false, 
      message: 'Gagal membuat Knowledge Base' 
    };
  }
}

/**
 * Update a Knowledge Base
 */
export async function updateKnowledgeBase(knowledgeId: string, updateData: UpdateKnowledgeBaseData): Promise<UpdateKnowledgeBaseResponse> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}knowledge-bases/${knowledgeId}`;
    console.log('Updating Knowledge Base:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    console.log('Update Knowledge Base response:', data);

    if (!response.ok) {
      console.error(`Update Knowledge Base API error: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        message: data.message || 'Gagal mengupdate Knowledge Base' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'Knowledge Base berhasil diupdate',
      data: data.data
    };
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return { 
      success: false, 
      message: 'Gagal mengupdate Knowledge Base' 
    };
  }
}

/**
 * Delete a Knowledge Base
 */
export async function deleteKnowledgeBase(knowledgeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${process.env.BACKEND_SERVICE_URL}knowledge-bases/${knowledgeId}`;
    console.log('Deleting Knowledge Base:', url);
    
    const response = await requestWithCredentials(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Delete Knowledge Base API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Delete Knowledge Base response:', data);
    
    return { success: true, message: data.message || 'Knowledge Base deleted successfully' };
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    return { success: false, message: 'Failed to delete knowledge base' };
  }
} 