"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ItemType } from "@/types/ItemType";
import { BranchType } from "@/types/BranchType";
import { getBranches } from "@/services/branchesService";
import { transferItem } from "@/services/itemService";
import { getBranchData } from "@/helpers/misc";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemType;
}

export default function TransferModal({ isOpen, onClose, item }: TransferModalProps) {
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [currentBranch, setCurrentBranch] = useState<BranchType | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [amount, setAmount] = useState<string>("1");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);

  // Load branches and current branch on modal open
  useEffect(() => {
    if (isOpen) {
      loadBranches();
      loadCurrentBranch();
    }
  }, [isOpen]);

  const loadBranches = async () => {
    try {
      setBranchesLoading(true);
      const response = await getBranches();
      if (response.isSuccess) {
        setBranches(response.data);
      } else {
        toast.error(response.message || "Failed to load branches");
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setBranchesLoading(false);
    }
  };

  const loadCurrentBranch = async () => {
    try {
      const branch = await getBranchData();
      if (branch) {
        setCurrentBranch(branch);
      } else {
        toast.error("Failed to get current branch");
      }
    } catch (error) {
      console.error("Error loading current branch:", error);
      toast.error("Failed to get current branch");
    }
  };

  const handleSubmit = async () => {
    if (!selectedBranch || !amount || !currentBranch) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseInt(amount);
    if (amountNum <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (amountNum > (item.stock || 0)) {
      toast.error(`Cannot transfer more than available stock (${item.stock})`);
      return;
    }

    if (selectedBranch === currentBranch.id) {
      toast.error("Cannot transfer to the same branch");
      return;
    }

    try {
      setLoading(true);
      const response = await transferItem({
        amount: amountNum,
        from_branch_id: currentBranch.id,
        item_id: item.id || "",
        note: note.trim(),
        to_branch_id: selectedBranch,
      });

      if (response.isSuccess) {
        toast.success(response.message || "Item transferred successfully");
        onClose();
        // Reset form
        setSelectedBranch("");
        setAmount("1");
        setNote("");
      } else {
        toast.error(response.message || "Failed to transfer item");
      }
    } catch (error) {
      console.error("Error transferring item:", error);
      toast.error("Failed to transfer item");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSelectedBranch("");
    setAmount("1");
    setNote("");
    onClose();
  };

  const selectedBranchDetails = branches.find(branch => branch.id === selectedBranch);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Item</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
            disabled={loading}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Item Details */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Item Details</label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Code:</span> {item.code}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {item.name}
                </div>
                <div>
                  <span className="font-medium">Current Stock:</span> {item.stock} {item.unit}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {item.type}
                </div>
              </div>
            </div>
          </div>

          {/* Current Branch */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">From Branch</label>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm">
                <span className="font-medium">Name:</span> {currentBranch?.name || "Loading..."}
              </div>
            </div>
          </div>

          {/* Target Branch Selection */}
          <div className="space-y-2">
            <label htmlFor="target-branch" className="block text-sm font-medium text-gray-700">
              To Branch <span className="text-red-500">*</span>
            </label>
            <select
              id="target-branch"
              value={selectedBranch}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedBranch(e.target.value)}
              disabled={branchesLoading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">{branchesLoading ? "Loading branches..." : "Select target branch"}</option>
              {branches
                .filter(branch => branch.id !== currentBranch?.id)
                .map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Selected Target Branch Details */}
          {selectedBranchDetails && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Target Branch Details</label>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm">
                  <span className="font-medium">Name:</span> {selectedBranchDetails.name}
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount to Transfer <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="amount"
                type="number"
                min="1"
                max={item.stock || 0}
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <span className="text-sm text-gray-500 min-w-fit">{item.unit}</span>
            </div>
            <p className="text-xs text-gray-500">
              Available: {item.stock} {item.unit}
            </p>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              Note (Optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              placeholder="Add a note about this transfer..."
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 p-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedBranch || !amount || branchesLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? "Transferring..." : "Transfer Item"}
          </button>
        </div>
      </div>
    </div>
  );
}