'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Bot, 
  Settings, 
  MessageCircle, 
  Save, 
  Loader2, 
  Eye, 
  EyeOff,
  Send,
  User,
  Sparkles,
  Clock,
  FileText,
  Database,
  Calendar,
  Plus,
  Trash2,
  Filter,
  Globe,
  MessageSquare,
  Type,
  X,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getAIAgentDetail, 
  updateAIAgent, 
  deleteKnowledgeBase,
  AIAgentDetail, 
  UpdateAIAgentData,
  KnowledgeBase
} from '@/services/aiAgentService';
import {
  startNewChat,
  continueChat,
  getChatHistory,
  ChatMessage as APIChatMessage
} from '@/services/chatService';
import AddKnowledgeModal from '@/components/ai-agent/AddKnowledgeModal';
import EditKnowledgeModal from '@/components/ai-agent/EditKnowledgeModal';
import DeleteKnowledgeModal from '@/components/ai-agent/DeleteKnowledgeModal';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export default function AIAgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State management
  const [agent, setAgent] = useState<AIAgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'knowledge'>('general');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    persona: '',
    welcome_message: '',
    agent_transfer_condition: '',
    is_active: true
  });
  
  // Chat simulation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Knowledge base state
  const [knowledgeFilter, setKnowledgeFilter] = useState<'all' | 'text' | 'qna' | 'website'>('all');
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeBase | null>(null);
  const [deletingKnowledge, setDeletingKnowledge] = useState<KnowledgeBase | null>(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, chatLoading]);

  const fetchAgentDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAIAgentDetail(agentId);
      setAgent(response.data);
      setFormData({
        name: response.data.name,
        persona: response.data.persona,
        welcome_message: response.data.welcome_message,
        agent_transfer_condition: response.data.agent_transfer_condition,
        is_active: response.data.is_active
      });

      // Chat will start empty - welcome message will come from API response
    } catch (error) {
      toast.error('Gagal memuat detail AI Agent');
      router.push('/dashboard/ai-agent');
    } finally {
      setLoading(false);
    }
  }, [agentId, router]);

  // Load agent data
  useEffect(() => {
    fetchAgentDetail();
  }, [fetchAgentDetail]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: UpdateAIAgentData = {
        name: formData.name,
        persona: formData.persona,
        welcome_message: formData.welcome_message,
        agent_transfer_condition: formData.agent_transfer_condition,
        is_active: formData.is_active
      };

      const response = await updateAIAgent(agentId, updateData);
      if (response.success) {
        toast.success(response.message);
        await fetchAgentDetail(); // Refresh data
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Gagal mengupdate AI Agent');
    } finally {
      setSaving(false);
    }
  };

  // Function to convert API chat messages to local chat message format
  const convertApiMessageToLocal = (apiMessage: APIChatMessage): ChatMessage => {
    return {
      id: apiMessage.id,
      type: apiMessage.message_direction === 'incoming' ? 'user' : 'bot',
      message: apiMessage.message,
      timestamp: new Date(apiMessage.created_at)
    };
  };

  // Function to start polling for chat history
  const startPolling = useCallback((chatId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const historyResponse = await getChatHistory(chatId);
        
        if (historyResponse.success) {
          // Convert API messages to local format and sort by timestamp
          const localMessages = historyResponse.data.messages
            .map(convertApiMessageToLocal)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          
          setChatMessages(localMessages);
          
          console.log(`Polling chat history: ${historyResponse.data.total_messages} messages, status: ${historyResponse.data.status}`);
          
          // Stop polling if status is success
          if (historyResponse.data.status === 'success') {
            clearInterval(interval);
            setIsPolling(false);
            setChatLoading(false);
            setPollingInterval(null);
          }
        }
      } catch (error) {
        console.error('Error polling chat history:', error);
        clearInterval(interval);
        setIsPolling(false);
        setChatLoading(false);
        setPollingInterval(null);
      }
    }, 1000); // Poll every 1 second

    setPollingInterval(interval);
  }, [pollingInterval]);

  // Function to stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsPolling(false);
  }, [pollingInterval]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const messageText = chatInput.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: messageText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      if (!chatId) {
        // Start new chat
        const response = await startNewChat(agentId, messageText);
        
        if (response.success) {
          setChatId(response.data.chat_id);
          
          console.log(`Received ${response.data.bubble_count} responses for new chat`);
          
          // Add bot responses to chat messages (handle multiple responses)
          const botMessages: ChatMessage[] = response.data.responses.map((responseText, index) => ({
            id: `${response.data.chat_id}_response_${index}`,
            type: 'bot' as const,
            message: responseText,
            timestamp: new Date(response.data.timestamp)
          }));
          
          setChatMessages(prev => [...prev, ...botMessages]);
          setChatLoading(false);
        } else {
          toast.error('Gagal memulai chat');
          setChatLoading(false);
        }
      } else {
        // Continue existing chat
        const response = await continueChat(chatId, messageText);
        
        if (response.success) {
          console.log(`Continue chat success, expecting ${response.data.bubble_count} responses`);
          // Don't add bot response to chat messages immediately
          // Instead, start polling for chat history
          startPolling(chatId);
        } else {
          toast.error('Gagal melanjutkan chat');
          setChatLoading(false);
        }
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Terjadi kesalahan saat mengirim pesan');
      setChatLoading(false);
    }
  };

  const handleKnowledgeSuccess = async () => {
    await fetchAgentDetail(); // Refresh data
  };

  const handleResetChat = () => {
    stopPolling();
    setChatId(null);
    setChatMessages([]);
    setChatLoading(false);
    
    // Chat will start empty - welcome message will come from API response
  };

  const handleDeleteKnowledge = (knowledge: KnowledgeBase) => {
    setDeletingKnowledge(knowledge);
  };

  const handleEditKnowledge = (knowledge: KnowledgeBase) => {
    setEditingKnowledge(knowledge);
  };

  const getFilteredKnowledgeBases = () => {
    if (!agent?.knowledge_bases) return [];
    
    if (knowledgeFilter === 'all') {
      return agent.knowledge_bases;
    }
    
    return agent.knowledge_bases.filter(kb => kb.type === knowledgeFilter);
  };

  const getKnowledgeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'qna':
        return <MessageSquare className="w-4 h-4" />;
      case 'website':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getKnowledgeTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text';
      case 'qna':
        return 'Q&A';
      case 'website':
        return 'Website';
      default:
        return type;
    }
  };

  const formatTextWithNewlines = (text: string, maxLines?: number) => {
    if (!text) return text;
    
    const lines = text.split('\n');
    const limitedLines = maxLines ? lines.slice(0, maxLines) : lines;
    const shouldShowEllipsis = maxLines && lines.length > maxLines;
    
    return (
      <span>
        {limitedLines.map((line, index) => (
          <span key={index}>
            {line}
            {index < limitedLines.length - 1 && <br />}
          </span>
        ))}
        {shouldShowEllipsis && '...'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sarana-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail AI Agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Agent tidak ditemukan</h2>
          <button
            onClick={() => router.push('/dashboard/ai-agent')}
            className="text-sarana-primary hover:text-sarana-primary-dark"
          >
            Kembali ke daftar AI Agent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard/ai-agent')}
            className="flex items-center space-x-2 text-gray-600 hover:text-sarana-primary transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl border border-gray-300 group-hover:border-sarana-primary group-hover:bg-sarana-primary/5 flex items-center justify-center transition-all duration-200">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Kembali ke AI Agents</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-sarana-primary hover:bg-sarana-primary-dark text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Panel - Configuration */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Agent Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-sarana-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{agent.name}</h1>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      agent.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        agent.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <p>{agent.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Updated {formatDate(agent.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Agent Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Last Trained</p>
                    </div>
                    <p className="text-gray-900 ml-6">
                      {formatDate(agent.updated_at)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Created</p>
                    </div>
                    <p className="text-gray-900 ml-6">
                      {formatDate(agent.created_at)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Agent ID</p>
                    </div>
                    <p className="font-mono text-sm text-gray-900 ml-6 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                      {agent.id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Created By</p>
                    </div>
                    <p className="text-gray-900 ml-6">
                      {agent.created_by_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'general'
                        ? 'border-sarana-primary text-sarana-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>General Settings</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'knowledge'
                        ? 'border-sarana-primary text-sarana-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span>Knowledge Sources</span>
                    </div>
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'general' ? (
                  <div className="space-y-6">
                    {/* Agent Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Agent Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarana-primary/20 focus:border-sarana-primary transition-colors"
                        placeholder="Enter agent name"
                      />
                    </div>

                    {/* Agent Status */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.is_active ? 'bg-sarana-primary' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-700">
                          {formData.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* AI Agent Behavior */}
                    <div>
                      <label htmlFor="persona" className="block text-sm font-semibold text-gray-700 mb-2">
                        AI Agent Behavior
                      </label>
                      <div className="relative">
                        <textarea
                          id="persona"
                          rows={6}
                          value={formData.persona}
                          onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarana-primary/20 focus:border-sarana-primary transition-colors resize-none"
                          placeholder="Describe how the AI agent should behave and respond to customers..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {formData.persona.length}/15000
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Ini adalah Prompt AI yang akan mengatur gaya bicara dan mengatur identitas AI nya.
                      </p>
                    </div>

                    {/* Welcome Message */}
                    <div>
                      <label htmlFor="welcome_message" className="block text-sm font-semibold text-gray-700 mb-2">
                        Welcome Message
                      </label>
                      <div className="relative">
                        <textarea
                          id="welcome_message"
                          rows={4}
                          value={formData.welcome_message}
                          onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarana-primary/20 focus:border-sarana-primary transition-colors resize-none"
                          placeholder="Enter the first message that will be sent to users..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {formData.welcome_message.length}/5000
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Pesan pertama yang akan dikirim AI kepada setiap user.
                      </p>
                    </div>

                    {/* Agent Transfer Conditions */}
                    <div>
                      <label htmlFor="agent_transfer_condition" className="block text-sm font-semibold text-gray-700 mb-2">
                        Agent Transfer Conditions
                      </label>
                      <div className="relative">
                        <textarea
                          id="agent_transfer_condition"
                          rows={4}
                          value={formData.agent_transfer_condition}
                          onChange={(e) => setFormData(prev => ({ ...prev, agent_transfer_condition: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarana-primary/20 focus:border-sarana-primary transition-colors resize-none"
                          placeholder="Define when the AI should transfer chat to human agents..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {formData.agent_transfer_condition.length}/750
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Tentukan kondisi yang akan memicu AI untuk mentransfer chat ke agent manusia.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Knowledge Sources Tab
                  <div className="space-y-6">
                    {/* Knowledge Header & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">Knowledge Sources</h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                          {getFilteredKnowledgeBases().length} items
                        </span>
                      </div>
                      <button
                        onClick={() => setShowAddKnowledge(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-sarana-primary text-white rounded-lg hover:bg-sarana-primary-dark transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Knowledge</span>
                      </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                      {[
                        { key: 'all', label: 'All', icon: Database },
                        { key: 'text', label: 'Text', icon: Type },
                        { key: 'qna', label: 'Q&A', icon: MessageSquare },
                        { key: 'website', label: 'Website', icon: Globe }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setKnowledgeFilter(key as 'all' | 'text' | 'qna' | 'website')}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            knowledgeFilter === key
                              ? 'bg-white text-sarana-primary shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Knowledge List */}
                    <div className="space-y-3">
                      {getFilteredKnowledgeBases().length === 0 ? (
                        <div className="text-center py-12">
                          <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {knowledgeFilter === 'all' ? 'No Knowledge Sources' : `No ${getKnowledgeTypeLabel(knowledgeFilter)} Knowledge`}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {knowledgeFilter === 'all' 
                              ? 'Add knowledge sources to train your AI Agent.'
                              : `Add ${getKnowledgeTypeLabel(knowledgeFilter)} knowledge to train your AI Agent.`
                            }
                          </p>
                        </div>
                      ) : (
                        getFilteredKnowledgeBases().map((knowledge) => (
                          <div key={knowledge.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className={`p-2 rounded-lg ${
                                    knowledge.type === 'text' ? 'bg-blue-100 text-blue-600' :
                                    knowledge.type === 'qna' ? 'bg-green-100 text-green-600' :
                                    'bg-purple-100 text-purple-600'
                                  }`}>
                                    {getKnowledgeIcon(knowledge.type)}
                                  </div>
                                  <div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      knowledge.type === 'text' ? 'bg-blue-100 text-blue-700' :
                                      knowledge.type === 'qna' ? 'bg-green-100 text-green-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      {getKnowledgeTypeLabel(knowledge.type)}
                                    </span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                      knowledge.is_active 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {knowledge.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  {knowledge.type === 'text' && knowledge.content && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Content:</p>
                                      <p className="text-sm text-gray-600">
                                        {formatTextWithNewlines(knowledge.content, 3)}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {knowledge.type === 'qna' && (
                                    <div className="space-y-2">
                                      {knowledge.question && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Question:</p>
                                          <p className="text-sm text-gray-600">{knowledge.question}</p>
                                        </div>
                                      )}
                                      {knowledge.answer && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Answer:</p>
                                          <p className="text-sm text-gray-600">
                                            {formatTextWithNewlines(knowledge.answer, 3)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {knowledge.type === 'website' && knowledge.url && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">URL:</p>
                                      <a 
                                        href={knowledge.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-sarana-primary hover:text-sarana-primary-dark underline"
                                      >
                                        {knowledge.url}
                                      </a>
                                    </div>
                                  )}
                                  
                                  <p className="text-xs text-gray-500">
                                    Updated {formatDate(knowledge.updated_at)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEditKnowledge(knowledge)}
                                  className="p-2 text-gray-400 hover:text-sarana-primary transition-colors"
                                  title="Edit knowledge"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteKnowledge(knowledge)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete knowledge"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Simulation */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit sticky top-8">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-sarana-primary to-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <div className="text-sm flex items-center">
                        {isPolling ? (
                          <>
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-blue-600">Processing...</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-green-600">Online</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleResetChat}
                    disabled={chatLoading || isPolling}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Reset Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="h-96 overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-sarana-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-1">
                        {message.timestamp.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' ? 'order-2 ml-2 bg-gray-300' : 'order-1 mr-2 bg-sarana-primary'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                ))}
                
                {(chatLoading || isPolling) && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-sarana-primary flex items-center justify-center flex-shrink-0 mr-2">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="max-w-xs">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {isPolling ? 'Processing response...' : 'Typing...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !chatLoading && !isPolling && handleChatSend()}
                    placeholder={isPolling ? "Waiting for response..." : "Type your message..."}
                    disabled={chatLoading || isPolling}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarana-primary/20 focus:border-sarana-primary disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || chatLoading || isPolling}
                    className="px-4 py-2 bg-sarana-primary hover:bg-sarana-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Knowledge Modal */}
      <AddKnowledgeModal
        isOpen={showAddKnowledge}
        onClose={() => setShowAddKnowledge(false)}
        onSuccess={handleKnowledgeSuccess}
        agentId={agentId}
      />

      {/* Edit Knowledge Modal */}
      <EditKnowledgeModal
        isOpen={!!editingKnowledge}
        onClose={() => setEditingKnowledge(null)}
        onSuccess={handleKnowledgeSuccess}
        knowledge={editingKnowledge}
      />

      {/* Delete Knowledge Modal */}
      <DeleteKnowledgeModal
        isOpen={!!deletingKnowledge}
        onClose={() => setDeletingKnowledge(null)}
        onSuccess={handleKnowledgeSuccess}
        knowledge={deletingKnowledge}
      />
    </div>
  );
} 