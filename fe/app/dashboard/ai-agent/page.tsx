'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Trash2, Bot, Sparkles, Users, Search, RefreshCw, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAIAgents, AIAgent } from '@/services/aiAgentService';
import AddAgentModal from '@/components/ai-agent/AddAgentModal';
import DeleteAgentModal from '@/components/ai-agent/DeleteAgentModal';

export default function AIAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchAgents = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getAIAgents(page, 10);
      setAgents(response.results || []); // Ensure agents is always an array
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Gagal memuat daftar AI Agent');
      setAgents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDeleteAgent = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    fetchAgents(currentPage); // Refresh data
  };

  const handleAddSuccess = (agentId: string) => {
    fetchAgents(currentPage); // Refresh data
    // Navigate to detail page
    router.push(`/dashboard/ai-agent/${agentId}`);
  };

  const handleRefresh = () => {
    fetchAgents(currentPage);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredAgents = (agents || []).filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gradientColors = [
    'from-blue-500 to-purple-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-blue-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-cyan-600',
    'from-indigo-500 to-purple-600',
  ];

  return (
    <div className="">
      <div className="container mx-auto py-6">
        {/* Header Section */}
        <div className="text-center mb-6 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sarana-primary to-blue-600 rounded-2xl mb-6 shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Kelola AI Agents
            <Sparkles className="inline-block w-8 h-8 text-yellow-500 ml-2" />
          </h1>
          <p className="text text-gray-600 max-w-2xl mx-auto leading-relaxed">
             Buat, konfigurasi, dan kelola asisten digital yang akan membantu mengotomatisasi layanan pelanggan bisnis Anda.
          </p>
        </div>

        {/* Stats and Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-sarana-primary" />
                <span className="text-gray-600">Total AI Agents:</span>
                <span className="font-bold text-sarana-primary text-lg">{totalResults}</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Halaman:</span>
                <span className="font-medium text-gray-900">{currentPage} dari {totalPages == 0 ? 1 : totalPages}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari AI Agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sarana-primary focus:border-transparent"
                />
              </div>
              
              {/* Add Agent Button */}
              {/* <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-sarana-primary hover:bg-sarana-primary-dark text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Agent</span>
              </button> */}
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-sarana-primary hover:bg-sarana-primary/5 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sarana-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat AI Agents...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAgents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md mx-auto">
              {searchTerm ? (
                <>
                  {/* Search Not Found */}
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Tidak Ditemukan
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    AI Agent dengan nama <span className="font-semibold text-gray-900">"{searchTerm}"</span> tidak ditemukan. 
                    Coba gunakan kata kunci yang berbeda.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    <span>Hapus Filter</span>
                  </button>
                </>
              ) : (
                <>
                  {/* No Agents Yet */}
                  <div className="w-20 h-20 bg-gradient-to-br from-sarana-primary/10 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-10 h-10 text-sarana-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Belum Ada AI Agent
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Anda belum memiliki AI Agent. Mulai dengan membuat AI Agent pertama untuk mengotomatisasi layanan pelanggan dan meningkatkan produktivitas bisnis Anda.
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-sarana-primary hover:bg-sarana-primary-dark text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Buat AI Agent Pertama</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Agents Grid */}
        {!loading && filteredAgents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Agent Card */}
            <div 
              onClick={() => setIsAddModalOpen(true)}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-sarana-primary to-blue-600 rounded-2xl p-8 text-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Buat AI Agent Baru</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Klik untuk membuat AI Agent yang powerful dan cerdas
                </p>
              </div>
            </div>
            {/* Agent Cards */}
            {filteredAgents.map((agent, index) => (
              <div key={agent.id} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden">
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${gradientColors[index % gradientColors.length]} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">
                          {getInitials(agent.name)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-2 group-hover:text-sarana-primary transition-colors">
                      {agent.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-3">
                      <Bot className="w-4 h-4" />
                      <span>AI Agent</span>
                    </div>
                    
                    {/* Creator Information */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {agent.user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {agent.user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 pb-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard/ai-agent/${agent.id}`)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-medium"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id, agent.name)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchAgents(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchAgents(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-sarana-primary text-white'
                      : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => fetchAgents(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAgentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
      
      <DeleteAgentModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        agent={agentToDelete}
      />
    </div>
  );
}
