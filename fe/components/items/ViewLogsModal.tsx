"use client";
import { useEffect, useState } from "react";
import { WasteLogType } from "@/types/WasteLogType";
import { getWasteLogsByItem, createWasteLog, updateWasteLog, deleteWasteLog } from "@/services/itemService";
import AddWasteLogModal from "./AddWasteLogModal";
import EditWasteLogModal from "./EditWasteLogModal";
import DeleteWasteLogModal from "./DeleteWasteLogModal";
import { InfoIcon } from "lucide-react";
import { ItemType } from "@/types/ItemType";
import { ITEM_TYPES_LABELS } from "@/lib/constants";

interface ViewLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemType;
}

export default function ViewLogsModal({ isOpen, onClose, item }: ViewLogsModalProps) {
  const [logs, setLogs] = useState<WasteLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editLog, setEditLog] = useState<WasteLogType | null>(null);
  const [deleteLog, setDeleteLog] = useState<WasteLogType | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWasteLogsByItem(item.id!);
      if (res.isSuccess) setLogs(res.data);
      else setError(res.message || "Failed to fetch logs");
    } catch (e) {
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchLogs();
    // eslint-disable-next-line
  }, [isOpen, item.id!]);

  const handleAdd = async (data: any) => {
    const res = await createWasteLog(item.id!, data);
    if (res.isSuccess) fetchLogs();
  };
  const handleEdit = async (id: string, data: any) => {
    const res = await updateWasteLog(item.id!, id, data);
    if (res.isSuccess) fetchLogs();
  };
  const handleDelete = async (id: string) => {
    const res = await deleteWasteLog(item.id!, id);
    if (res.isSuccess) fetchLogs();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Waste Logs</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          {item && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Item Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{item.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <span className="ml-2 font-medium text-gray-900">{item.stock || 0} {item.unit}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium text-gray-900">{ITEM_TYPES_LABELS[item.type as keyof typeof ITEM_TYPES_LABELS]}</span>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setShowAdd(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Waste Log</button>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No waste logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recipe</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        <span className="relative group me-1 flex items-center">
                          <InfoIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 cursor-pointer" />
                          <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20" style={{ textTransform: 'initial' }}>
                            Current stock as of this point in time.
                          </span>
                        </span>
                        <span>Current Stock</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{log.waste_type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{log.waste_quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{log.note || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{log.recipe?.name || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{log.current_stock || 'Unknown'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                        <button onClick={() => setEditLog(log)} className="text-blue-600 hover:text-blue-900 mr-2 cursor-pointer">Edit</button>
                        <button onClick={() => setDeleteLog(log)} className="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <AddWasteLogModal isOpen={showAdd} onClose={() => {
          setShowAdd(false);
          fetchLogs();
        }} onSubmit={handleAdd} />
        <EditWasteLogModal isOpen={!!editLog} onClose={() => {
          setEditLog(null);
          fetchLogs();
        }} wasteLog={editLog} onSubmit={handleEdit} />
        <DeleteWasteLogModal isOpen={!!deleteLog} onClose={() => setDeleteLog(null)} wasteLog={deleteLog} onConfirm={handleDelete} />
      </div>
    </div>
  );
}