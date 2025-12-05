'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, AlertTriangle, Trash2, Type, MessageSquare, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteKnowledgeBase, KnowledgeBase } from '@/services/aiAgentService';

interface DeleteKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  knowledge: KnowledgeBase | null;
}

export default function DeleteKnowledgeModal({ isOpen, onClose, onSuccess, knowledge }: DeleteKnowledgeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!knowledge) return;

    try {
      setLoading(true);
      const result = await deleteKnowledgeBase(knowledge.id);
      
      if (result.success) {
        toast.success(result.message);
        onClose();
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Gagal menghapus Knowledge Base');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getKnowledgeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4 text-white" />;
      case 'qna':
        return <MessageSquare className="w-4 h-4 text-white" />;
      case 'website':
        return <Globe className="w-4 h-4 text-white" />;
      default:
        return <Type className="w-4 h-4 text-white" />;
    }
  };

  const getKnowledgeTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text Knowledge';
      case 'qna':
        return 'Q&A Knowledge';
      case 'website':
        return 'Website Knowledge';
      default:
        return 'Knowledge';
    }
  };

  const getKnowledgeTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'from-blue-500 to-blue-600';
      case 'qna':
        return 'from-green-500 to-green-600';
      case 'website':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getKnowledgeDisplayText = () => {
    if (!knowledge) return '';
    
    if (knowledge.type === 'text' && knowledge.content) {
      return knowledge.content.length > 60 
        ? knowledge.content.substring(0, 60) + '...'
        : knowledge.content;
    }
    
    if (knowledge.type === 'qna' && knowledge.question) {
      return knowledge.question.length > 60 
        ? knowledge.question.substring(0, 60) + '...'
        : knowledge.question;
    }
    
    if (knowledge.type === 'website' && knowledge.url) {
      return knowledge.url.length > 60 
        ? knowledge.url.substring(0, 60) + '...'
        : knowledge.url;
    }
    
    return 'Knowledge Base';
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Hapus Knowledge Base
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Tindakan ini tidak dapat dibatalkan
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

                {/* Content */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Apakah Anda yakin ingin menghapus Knowledge Base ini:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${getKnowledgeTypeColor(knowledge?.type || '')} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {getKnowledgeIcon(knowledge?.type || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {getKnowledgeTypeLabel(knowledge?.type || '')}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            knowledge?.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {knowledge?.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 break-words">
                          {getKnowledgeDisplayText()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 