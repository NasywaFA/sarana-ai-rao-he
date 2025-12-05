'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Plus, Type, MessageSquare, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createKnowledgeBase, CreateKnowledgeBaseData } from '@/services/aiAgentService';

interface AddKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agentId: string;
}

export default function AddKnowledgeModal({ isOpen, onClose, onSuccess, agentId }: AddKnowledgeModalProps) {
  const [knowledge, setKnowledge] = useState({
    type: 'text' as 'text' | 'qna' | 'website',
    content: '',
    question: '',
    answer: '',
    url: ''
  });
  const [loading, setLoading] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (knowledge.type === 'text' && !knowledge.content.trim()) {
      toast.error('Content tidak boleh kosong');
      return;
    }
    
    if (knowledge.type === 'qna') {
      if (!knowledge.question.trim()) {
        toast.error('Question tidak boleh kosong');
        return;
      }
      if (!knowledge.answer.trim()) {
        toast.error('Answer tidak boleh kosong');
        return;
      }
    }
    
    if (knowledge.type === 'website') {
      if (!knowledge.url.trim()) {
        toast.error('URL tidak boleh kosong');
        return;
      }
      if (!validateUrl(knowledge.url.trim())) {
        toast.error('URL tidak valid. Contoh: https://example.com');
        return;
      }
    }

    try {
      setLoading(true);
      
      const knowledgeData: CreateKnowledgeBaseData = {
        ai_agent_id: agentId,
        type: knowledge.type
      };

      // Add specific fields based on type
      if (knowledge.type === 'text') {
        knowledgeData.content = knowledge.content.trim();
      } else if (knowledge.type === 'qna') {
        knowledgeData.question = knowledge.question.trim();
        knowledgeData.answer = knowledge.answer.trim();
      } else if (knowledge.type === 'website') {
        knowledgeData.url = knowledge.url.trim();
      }

      const result = await createKnowledgeBase(knowledgeData);
      
      if (result.success) {
        toast.success(result.message);
        handleClose();
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Gagal membuat Knowledge Base');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setKnowledge({
        type: 'text',
        content: '',
        question: '',
        answer: '',
        url: ''
      });
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-sarana-primary to-blue-600 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Add Knowledge Base
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Tambahkan pengetahuan untuk AI Agent
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Knowledge Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Knowledge Type *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'text', label: 'Text', icon: Type },
                        { key: 'qna', label: 'Q&A', icon: MessageSquare },
                        { key: 'website', label: 'Website', icon: Globe }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setKnowledge(prev => ({ ...prev, type: key as 'text' | 'qna' | 'website' }))}
                          disabled={loading}
                          className={`p-3 border rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 disabled:opacity-50 ${
                            knowledge.type === key
                              ? 'border-sarana-primary bg-sarana-primary-50 text-sarana-primary shadow-sm'
                              : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Form Fields */}
                  {knowledge.type === 'text' && (
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        id="content"
                        rows={4}
                        value={knowledge.content}
                        onChange={(e) => setKnowledge(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Masukkan konten teks untuk knowledge base..."
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sarana-primary focus:border-transparent transition-colors resize-none disabled:bg-gray-50 disabled:opacity-50"
                      />
                    </div>
                  )}

                  {knowledge.type === 'qna' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                          Question *
                        </label>
                        <input
                          type="text"
                          id="question"
                          value={knowledge.question}
                          onChange={(e) => setKnowledge(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="Masukkan pertanyaan..."
                          disabled={loading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sarana-primary focus:border-transparent transition-colors disabled:bg-gray-50 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                          Answer *
                        </label>
                        <textarea
                          id="answer"
                          rows={3}
                          value={knowledge.answer}
                          onChange={(e) => setKnowledge(prev => ({ ...prev, answer: e.target.value }))}
                          placeholder="Masukkan jawaban..."
                          disabled={loading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sarana-primary focus:border-transparent transition-colors resize-none disabled:bg-gray-50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}

                  {knowledge.type === 'website' && (
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                        Website URL *
                      </label>
                      <input
                        type="url"
                        id="url"
                        value={knowledge.url}
                        onChange={(e) => setKnowledge(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com"
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sarana-primary focus:border-transparent transition-colors disabled:bg-gray-50 disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Masukkan URL website yang valid (harus dimulai dengan https://)
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-sarana-primary hover:bg-sarana-primary-dark text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add Knowledge</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 